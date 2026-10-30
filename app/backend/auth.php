<?php
// PlayCast Authentication & Authorization Middleware Engine
// Enforces server-side session validation, role verification, and capacity policies.

/**
 * Extract Bearer token from Authorization header or fallback session cookie
 */
function getBearerToken() {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (empty($header) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (!empty($header) && preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
        return trim($matches[1]);
    }

    // Fallback to cookie
    if (!empty($_COOKIE['playcast_session'])) {
        return trim($_COOKIE['playcast_session']);
    }

    return null;
}

/**
 * Securely hash a token with SHA-256 for database lookup
 */
function hashSessionToken($token) {
    return hash('sha256', $token);
}

/**
 * Create a new authenticated session in database & set cookie
 */
function createSession($db, $userId, $durationSeconds = 604800) {
    $rawToken = bin2hex(random_bytes(32)); // 64 hex chars of cryptographic entropy
    $tokenHash = hashSessionToken($rawToken);
    $sessionId = 'sess-' . bin2hex(random_bytes(16));
    $expiresAt = date('Y-m-d H:i:s', time() + $durationSeconds);
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 500);

    $stmt = $db->prepare("INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
    $stmt->execute([$sessionId, $userId, $tokenHash, $ip, $userAgent, $expiresAt]);

    // Set HttpOnly, Secure, SameSite Cookie
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
    setcookie('playcast_session', $rawToken, [
        'expires' => time() + $durationSeconds,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    return [
        'token' => $rawToken,
        'expiresAt' => $expiresAt
    ];
}

/**
 * Validates active session token against database and returns sanitized user record
 */
function validateSession($db) {
    $token = getBearerToken();
    if (!$token) return null;

    $tokenHash = hashSessionToken($token);

    $sql = "SELECT s.id AS session_id, s.expires_at AS session_expires_at,
                   u.id, u.username, u.email, u.name, u.phone, u.role, u.status,
                   u.must_change_password, u.expires_at AS user_expires_at, u.last_login_at
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token_hash = ?
            LIMIT 1";

    $stmt = $db->prepare($sql);
    $stmt->execute([$tokenHash]);
    $user = $stmt->fetch();

    if (!$user) return null;

    $now = date('Y-m-d H:i:s');

    // 1. Check if session itself expired
    if ($user['session_expires_at'] < $now) {
        $db->prepare("DELETE FROM user_sessions WHERE token_hash = ?")->execute([$tokenHash]);
        return null;
    }

    // 2. Check if user account is disabled
    if ($user['status'] === 'DISABLED') {
        // Invalidate active session immediately
        $db->prepare("DELETE FROM user_sessions WHERE token_hash = ?")->execute([$tokenHash]);
        return null;
    }

    // 3. Check if account reached its expiry date
    if (!empty($user['user_expires_at']) && $user['user_expires_at'] < $now) {
        $db->prepare("UPDATE users SET status = 'EXPIRED' WHERE id = ?")->execute([$user['id']]);
        $db->prepare("DELETE FROM user_sessions WHERE token_hash = ?")->execute([$tokenHash]);
        return null;
    }

    // Touch last_activity_at occasionally (once every 5 minutes)
    $stmtTouch = $db->prepare("UPDATE user_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmtTouch->execute([$user['session_id']]);

    return [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'name' => $user['name'],
        'phone' => $user['phone'],
        'role' => $user['role'],
        'status' => $user['status'],
        'mustChangePassword' => (bool)$user['must_change_password'],
        'expiresAt' => $user['user_expires_at'],
        'lastLoginAt' => $user['last_login_at']
    ];
}

/**
 * Enforces authenticated access (HTTP 401 if missing/invalid)
 */
function requireAuth($db) {
    $user = validateSession($db);
    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => 'Authentication required or session expired. Please log in.',
            'code' => 'UNAUTHENTICATED'
        ]);
        exit;
    }
    return $user;
}

/**
 * Enforces Super Administrator role access (HTTP 403 if standard user)
 */
function requireSuperAdmin($db) {
    $user = requireAuth($db);
    if ($user['role'] !== 'SUPER_ADMIN') {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => 'Access denied: Super Administrator privilege required.',
            'code' => 'FORBIDDEN'
        ]);
        exit;
    }
    return $user;
}

/**
 * Revokes current session token
 */
function revokeCurrentSession($db) {
    $token = getBearerToken();
    if ($token) {
        $tokenHash = hashSessionToken($token);
        $db->prepare("DELETE FROM user_sessions WHERE token_hash = ?")->execute([$tokenHash]);
    }

    setcookie('playcast_session', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true
    ]);
}

/**
 * Revokes all active sessions for a target user (e.g. on deactivation or password reset)
 */
function revokeAllUserSessions($db, $userId) {
    $stmt = $db->prepare("DELETE FROM user_sessions WHERE user_id = ?");
    $stmt->execute([$userId]);
}

/**
 * Retrieves the current licensing and user capacity policy
 */
function getLicensePolicy($db) {
    $stmt = $db->prepare("SELECT value_json FROM settings WHERE setting_key = 'system_license' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch();

    if ($row && !empty($row['value_json'])) {
        $config = json_decode($row['value_json'], true);
        if (is_array($config)) {
            return [
                'max_users' => isset($config['max_users']) ? (int)$config['max_users'] : 0,
                'license_tier' => $config['license_tier'] ?? 'Unlimited Enterprise'
            ];
        }
    }

    // Default policy: 0 = unlimited capacity
    return [
        'max_users' => 0,
        'license_tier' => 'Unlimited Enterprise'
    ];
}

/**
 * Checks if current user count is within configured capacity limit
 */
function checkUserCapacity($db) {
    $policy = getLicensePolicy($db);
    $maxUsers = $policy['max_users'];

    // If max_users is 0 or less, license is unlimited
    if ($maxUsers <= 0) {
        $currentCount = (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'USER'")->fetchColumn();
        return [
            'allowed' => true,
            'current' => $currentCount,
            'max' => 0,
            'unlimited' => true,
            'tier' => $policy['license_tier']
        ];
    }

    $currentCount = (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'USER'")->fetchColumn();
    $allowed = ($currentCount < $maxUsers);

    return [
        'allowed' => $allowed,
        'current' => $currentCount,
        'max' => $maxUsers,
        'unlimited' => false,
        'tier' => $policy['license_tier']
    ];
}

/**
 * Records a security or administrative audit log entry
 */
function logAudit($db, $userId, $username, $action, $details = []) {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $detailsJson = !empty($details) ? json_encode($details, JSON_UNESCAPED_UNICODE) : null;
        $stmt = $db->prepare("INSERT INTO audit_logs (user_id, username, action, details_json, ip_address, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$userId, $username, $action, $detailsJson, $ip]);
    } catch (Exception $e) {
        // Logging failure should never crash the main application
    }
}
