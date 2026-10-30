<?php
// PlayCast CLI Super Administrator Bootstrap & Credential Provisioner
// Usage: php cli_bootstrap_admin.php [username] [password] [email] [name]

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "CLI execution only.\n";
    exit(1);
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

$username = $argv[1] ?? 'admin';
$password = $argv[2] ?? 'Admin@PlayCast2026!';
$email    = $argv[3] ?? 'admin@playcast.local';
$name     = $argv[4] ?? 'Super Administrator';

echo "=== RMC PlayCast Super Administrator Provisioning ===\n";
echo "Target User: {$username}\n";
echo "Target Email: {$email}\n";

$existing = $db->prepare("SELECT id, role FROM users WHERE username = ? OR email = ?");
$existing->execute([$username, $email]);
$user = $existing->fetch();

$hash = password_hash($password, PASSWORD_BCRYPT);

if ($user) {
    echo "Existing account found (ID: {$user['id']}). Updating password & ensuring SUPER_ADMIN role...\n";
    $update = $db->prepare("UPDATE users SET password_hash = ?, role = 'SUPER_ADMIN', status = 'ACTIVE', must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $update->execute([$hash, $user['id']]);
    revokeAllUserSessions($db, $user['id']);
    logAudit($db, $user['id'], $username, 'CLI_ADMIN_PASSWORD_RESET', ['note' => 'Super admin reset via CLI']);
    echo "SUCCESS: Super Administrator credentials updated.\n";
} else {
    $adminId = 'usr-' . bin2hex(random_bytes(8));
    $stmt = $db->prepare("INSERT INTO users (id, username, email, name, password_hash, role, status, must_change_password, created_at) VALUES (?, ?, ?, ?, ?, 'SUPER_ADMIN', 'ACTIVE', 0, CURRENT_TIMESTAMP)");
    $stmt->execute([$adminId, $username, $email, $name, $hash]);
    logAudit($db, $adminId, $username, 'CLI_ADMIN_CREATED', ['note' => 'Super admin created via CLI']);
    echo "SUCCESS: Super Administrator created with ID {$adminId}.\n";
}

echo "Username: {$username}\n";
echo "Role: SUPER_ADMIN\n";
echo "Status: ACTIVE\n";
echo "Ready for login.\n";
