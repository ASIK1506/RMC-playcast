<?php
// PlayCast PHP REST API Router & Controller

// 1. Full CORS Support for OBS Browser Sources & Web Frontends
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// 2. Respond to Preflight OPTIONS Requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

// 3. Normalize Request URI
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// Remove script path (e.g. /index.php or /subfolder/index.php) if present
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = dirname($scriptName);
if ($scriptDir !== '/' && $scriptDir !== '\\' && strpos($requestUri, $scriptDir) === 0) {
    $requestUri = substr($requestUri, strlen($scriptDir));
}
$requestUri = preg_replace('#^/index\.php#i', '', $requestUri);

// Strip leading /api or /api/
$endpoint = preg_replace('#^/api(/|$)#i', '/', $requestUri);
$endpoint = trim($endpoint, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get raw JSON payload
function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// ----------------- ROUTES -----------------

// 1. Health check & Diagnostics (/ or /health or /api/health)
if ($endpoint === 'health' || $endpoint === '') {
    echo json_encode([
        'status' => 'online',
        'service' => 'PlayCast PHP API',
        'version' => '1.0.0',
        'php_version' => PHP_VERSION,
        'database' => $activeDriver ?? 'connected',
        'host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
        'timestamp' => time()
    ]);
    exit;
}

// 2. Worship Songs CRUD (/api/songs or /songs)
if ($endpoint === 'songs') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM songs ORDER BY title ASC");
        $rows = $stmt->fetchAll();
        $songs = array_map(function($r) {
            return [
                'id' => $r['id'],
                'title' => $r['title'],
                'tamilTitle' => $r['tamil_title'],
                'author' => $r['author'],
                'key' => $r['song_key'],
                'sections' => json_decode($r['sections_json'], true)
            ];
        }, $rows);
        echo json_encode(['success' => true, 'data' => $songs]);
        exit;
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $id = $input['id'] ?? ('song-' . uniqid());
        $title = $input['title'] ?? 'Untitled Song';
        $tamilTitle = $input['tamilTitle'] ?? '';
        $author = $input['author'] ?? '';
        $key = $input['key'] ?? '';
        $sections = json_encode($input['sections'] ?? [], JSON_UNESCAPED_UNICODE);

        $stmt = $db->prepare("REPLACE INTO songs (id, title, tamil_title, author, song_key, sections_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$id, $title, $tamilTitle, $author, $key, $sections]);

        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Song saved successfully']);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("DELETE FROM songs WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Song deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing song ID']);
        }
        exit;
    }
}

// 3. Service Playlists CRUD (/api/services or /services)
if ($endpoint === 'services') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM services ORDER BY updated_at DESC");
        $rows = $stmt->fetchAll();
        $services = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['name'],
                'isActive' => (bool)$r['is_active'],
                'sections' => json_decode($r['sections_json'], true),
                'updatedAt' => $r['updated_at']
            ];
        }, $rows);
        echo json_encode(['success' => true, 'data' => $services]);
        exit;
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $id = $input['id'] ?? ('service-' . uniqid());
        $name = $input['name'] ?? 'Sunday Service';
        $isActive = !empty($input['isActive']) ? 1 : 0;
        $sections = json_encode($input['sections'] ?? [], JSON_UNESCAPED_UNICODE);

        $stmt = $db->prepare("REPLACE INTO services (id, name, is_active, sections_json, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$id, $name, $isActive, $sections]);

        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Service saved successfully']);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("DELETE FROM services WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Service deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing service ID']);
        }
        exit;
    }
}

// 4. Live Broadcast State (/api/live or /live)
if ($endpoint === 'live') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT state_json, updated_at FROM live_state WHERE id = 1");
        $row = $stmt->fetch();
        if ($row) {
            echo json_encode(['success' => true, 'state' => json_decode($row['state_json'], true), 'updatedAt' => $row['updated_at']]);
        } else {
            echo json_encode(['success' => true, 'state' => null]);
        }
        exit;
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $stateJson = json_encode($input, JSON_UNESCAPED_UNICODE);

        $stmt = $db->prepare("REPLACE INTO live_state (id, state_json, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$stateJson]);

        echo json_encode(['success' => true, 'message' => 'Live broadcast state updated']);
        exit;
    }
}

// 5. Global Settings (/api/settings or /settings)
if ($endpoint === 'settings') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT setting_key, value_json FROM settings");
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $r) {
            $settings[$r['setting_key']] = json_decode($r['value_json'], true);
        }
        echo json_encode(['success' => true, 'data' => $settings]);
        exit;
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $stmt = $db->prepare("REPLACE INTO settings (setting_key, value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
        foreach ($input as $k => $v) {
            $stmt->execute([$k, json_encode($v, JSON_UNESCAPED_UNICODE)]);
        }
        echo json_encode(['success' => true, 'message' => 'Settings saved successfully']);
        exit;
    }
}

// 404 Fallback
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'endpoint' => $endpoint]);
