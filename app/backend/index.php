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
        'mysql_attempted' => $mysqlAttempted ?? false,
        'mysql_error' => $mysqlError ?? null,
        'db_name' => $dbName ?? null,
        'db_user' => $dbUser ?? null,
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

// 6. Scripture / Bible Engine (/api/bible/...)
if (strpos($endpoint, 'bible') === 0) {
    // 6a. List Books (/api/bible/books)
    if ($endpoint === 'bible/books') {
        $stmt = $db->query("SELECT book_id, book_name, book_tamil, MAX(chapter) as chapters FROM bible_verses GROUP BY book_id, book_name, book_tamil ORDER BY book_id ASC");
        $rows = $stmt->fetchAll();
        
        // If DB has verses, return them
        if (!empty($rows)) {
            $books = array_map(function($r) {
                return [
                    'id' => (int)$r['book_id'],
                    'name' => $r['book_name'],
                    'nameTamil' => $r['book_tamil'],
                    'chapters' => (int)$r['chapters'],
                    'testament' => ((int)$r['book_id'] <= 39) ? 'old' : 'new'
                ];
            }, $rows);
            echo json_encode(['success' => true, 'source' => 'database', 'data' => $books]);
            exit;
        }

        // Canonical 66 Books fallback
        $canonicalBooks = [
            ['id' => 1, 'name' => 'Genesis', 'nameTamil' => 'ஆதியாகமம்', 'chapters' => 50, 'testament' => 'old'],
            ['id' => 2, 'name' => 'Exodus', 'nameTamil' => 'யாத்திராகமம்', 'chapters' => 40, 'testament' => 'old'],
            ['id' => 3, 'name' => 'Leviticus', 'nameTamil' => 'லேவியராகமம்', 'chapters' => 27, 'testament' => 'old'],
            ['id' => 4, 'name' => 'Numbers', 'nameTamil' => 'எண்ணாகமம்', 'chapters' => 36, 'testament' => 'old'],
            ['id' => 5, 'name' => 'Deuteronomy', 'nameTamil' => 'உபாகமம்', 'chapters' => 34, 'testament' => 'old'],
            ['id' => 6, 'name' => 'Joshua', 'nameTamil' => 'யோசுவா', 'chapters' => 24, 'testament' => 'old'],
            ['id' => 7, 'name' => 'Judges', 'nameTamil' => 'நியாயாதிபதிகள்', 'chapters' => 21, 'testament' => 'old'],
            ['id' => 8, 'name' => 'Ruth', 'nameTamil' => 'ரூத்', 'chapters' => 4, 'testament' => 'old'],
            ['id' => 9, 'name' => '1 Samuel', 'nameTamil' => '1 சாமுவேல்', 'chapters' => 31, 'testament' => 'old'],
            ['id' => 10, 'name' => '2 Samuel', 'nameTamil' => '2 சாமுவேல்', 'chapters' => 24, 'testament' => 'old'],
            ['id' => 11, 'name' => '1 Kings', 'nameTamil' => '1 இராஜாக்கள்', 'chapters' => 22, 'testament' => 'old'],
            ['id' => 12, 'name' => '2 Kings', 'nameTamil' => '2 இராஜாக்கள்', 'chapters' => 25, 'testament' => 'old'],
            ['id' => 13, 'name' => '1 Chronicles', 'nameTamil' => '1 நாளாகமம்', 'chapters' => 29, 'testament' => 'old'],
            ['id' => 14, 'name' => '2 Chronicles', 'nameTamil' => '2 நாளாகமம்', 'chapters' => 36, 'testament' => 'old'],
            ['id' => 15, 'name' => 'Ezra', 'nameTamil' => 'எஸ்றா', 'chapters' => 10, 'testament' => 'old'],
            ['id' => 16, 'name' => 'Nehemiah', 'nameTamil' => 'நெகேமியா', 'chapters' => 13, 'testament' => 'old'],
            ['id' => 17, 'name' => 'Esther', 'nameTamil' => 'எஸ்தர்', 'chapters' => 10, 'testament' => 'old'],
            ['id' => 18, 'name' => 'Job', 'nameTamil' => 'யோபு', 'chapters' => 42, 'testament' => 'old'],
            ['id' => 19, 'name' => 'Psalms', 'nameTamil' => 'சங்கீதம்', 'chapters' => 150, 'testament' => 'old'],
            ['id' => 20, 'name' => 'Proverbs', 'nameTamil' => 'நீதிமொழிகள்', 'chapters' => 31, 'testament' => 'old'],
            ['id' => 21, 'name' => 'Ecclesiastes', 'nameTamil' => 'பிரசங்கி', 'chapters' => 12, 'testament' => 'old'],
            ['id' => 22, 'name' => 'Song of Solomon', 'nameTamil' => 'உன்னதப்பாட்டு', 'chapters' => 8, 'testament' => 'old'],
            ['id' => 23, 'name' => 'Isaiah', 'nameTamil' => 'ஏசாயா', 'chapters' => 66, 'testament' => 'old'],
            ['id' => 24, 'name' => 'Jeremiah', 'nameTamil' => 'எரேமியா', 'chapters' => 52, 'testament' => 'old'],
            ['id' => 25, 'name' => 'Lamentations', 'nameTamil' => 'புலம்பல்', 'chapters' => 5, 'testament' => 'old'],
            ['id' => 26, 'name' => 'Ezekiel', 'nameTamil' => 'எசேக்கியேல்', 'chapters' => 48, 'testament' => 'old'],
            ['id' => 27, 'name' => 'Daniel', 'nameTamil' => 'தானியேல்', 'chapters' => 12, 'testament' => 'old'],
            ['id' => 28, 'name' => 'Hosea', 'nameTamil' => 'ஓசியா', 'chapters' => 14, 'testament' => 'old'],
            ['id' => 29, 'name' => 'Joel', 'nameTamil' => 'யோவேல்', 'chapters' => 3, 'testament' => 'old'],
            ['id' => 30, 'name' => 'Amos', 'nameTamil' => 'ஆமோஸ்', 'chapters' => 9, 'testament' => 'old'],
            ['id' => 31, 'name' => 'Obadiah', 'nameTamil' => 'ஒபதியா', 'chapters' => 1, 'testament' => 'old'],
            ['id' => 32, 'name' => 'Jonah', 'nameTamil' => 'யோனா', 'chapters' => 4, 'testament' => 'old'],
            ['id' => 33, 'name' => 'Micah', 'nameTamil' => 'மீகா', 'chapters' => 7, 'testament' => 'old'],
            ['id' => 34, 'name' => 'Nahum', 'nameTamil' => 'நாகூம்', 'chapters' => 3, 'testament' => 'old'],
            ['id' => 35, 'name' => 'Habakkuk', 'nameTamil' => 'ஆபகூக்', 'chapters' => 3, 'testament' => 'old'],
            ['id' => 36, 'name' => 'Zephaniah', 'nameTamil' => 'செப்பனியா', 'chapters' => 3, 'testament' => 'old'],
            ['id' => 37, 'name' => 'Haggai', 'nameTamil' => 'ஆகாய்', 'chapters' => 2, 'testament' => 'old'],
            ['id' => 38, 'name' => 'Zechariah', 'nameTamil' => 'சகரியா', 'chapters' => 14, 'testament' => 'old'],
            ['id' => 39, 'name' => 'Malachi', 'nameTamil' => 'மல்கியா', 'chapters' => 4, 'testament' => 'old'],
            ['id' => 40, 'name' => 'Matthew', 'nameTamil' => 'மத்தேயு', 'chapters' => 28, 'testament' => 'new'],
            ['id' => 41, 'name' => 'Mark', 'nameTamil' => 'மாற்கு', 'chapters' => 16, 'testament' => 'new'],
            ['id' => 42, 'name' => 'Luke', 'nameTamil' => 'லூக்கா', 'chapters' => 24, 'testament' => 'new'],
            ['id' => 43, 'name' => 'John', 'nameTamil' => 'யோவான்', 'chapters' => 21, 'testament' => 'new'],
            ['id' => 44, 'name' => 'Acts', 'nameTamil' => 'அப்போஸ்தலர் நடபடிகள்', 'chapters' => 28, 'testament' => 'new'],
            ['id' => 45, 'name' => 'Romans', 'nameTamil' => 'ரோமர்', 'chapters' => 16, 'testament' => 'new'],
            ['id' => 46, 'name' => '1 Corinthians', 'nameTamil' => '1 கொரிந்தியர்', 'chapters' => 16, 'testament' => 'new'],
            ['id' => 47, 'name' => '2 Corinthians', 'nameTamil' => '2 கொரிந்தியர்', 'chapters' => 13, 'testament' => 'new'],
            ['id' => 48, 'name' => 'Galatians', 'nameTamil' => 'கலாத்தியர்', 'chapters' => 6, 'testament' => 'new'],
            ['id' => 49, 'name' => 'Ephesians', 'nameTamil' => 'எபேசியர்', 'chapters' => 6, 'testament' => 'new'],
            ['id' => 50, 'name' => 'Philippians', 'nameTamil' => 'பிலிப்பியர்', 'chapters' => 4, 'testament' => 'new'],
            ['id' => 51, 'name' => 'Colossians', 'nameTamil' => 'கொலோசெயர்', 'chapters' => 4, 'testament' => 'new'],
            ['id' => 52, 'name' => '1 Thessalonians', 'nameTamil' => '1 தெசலோனிக்கேயர்', 'chapters' => 5, 'testament' => 'new'],
            ['id' => 53, 'name' => '2 Thessalonians', 'nameTamil' => '2 தெசலோனிக்கேயர்', 'chapters' => 3, 'testament' => 'new'],
            ['id' => 54, 'name' => '1 Timothy', 'nameTamil' => '1 தீமோத்தேயு', 'chapters' => 6, 'testament' => 'new'],
            ['id' => 55, 'name' => '2 Timothy', 'nameTamil' => '2 தீமோத்தேயு', 'chapters' => 4, 'testament' => 'new'],
            ['id' => 56, 'name' => 'Titus', 'nameTamil' => 'தீத்து', 'chapters' => 3, 'testament' => 'new'],
            ['id' => 57, 'name' => 'Philemon', 'nameTamil' => 'பிலேமோன்', 'chapters' => 1, 'testament' => 'new'],
            ['id' => 58, 'name' => 'Hebrews', 'nameTamil' => 'எபிரெயர்', 'chapters' => 13, 'testament' => 'new'],
            ['id' => 59, 'name' => 'James', 'nameTamil' => 'யாக்கோபு', 'chapters' => 5, 'testament' => 'new'],
            ['id' => 60, 'name' => '1 Peter', 'nameTamil' => '1 பேதுரு', 'chapters' => 5, 'testament' => 'new'],
            ['id' => 61, 'name' => '2 Peter', 'nameTamil' => '2 பேதுரு', 'chapters' => 3, 'testament' => 'new'],
            ['id' => 62, 'name' => '1 John', 'nameTamil' => '1 யோவான்', 'chapters' => 5, 'testament' => 'new'],
            ['id' => 63, 'name' => '2 John', 'nameTamil' => '2 யோவான்', 'chapters' => 1, 'testament' => 'new'],
            ['id' => 64, 'name' => '3 John', 'nameTamil' => '3 யோவான்', 'chapters' => 1, 'testament' => 'new'],
            ['id' => 65, 'name' => 'Jude', 'nameTamil' => 'யூதா', 'chapters' => 1, 'testament' => 'new'],
            ['id' => 66, 'name' => 'Revelation', 'nameTamil' => 'வெளிப்படுத்தின விசேஷம்', 'chapters' => 22, 'testament' => 'new']
        ];
        echo json_encode(['success' => true, 'source' => 'static', 'data' => $canonicalBooks]);
        exit;
    }

    // 6b. Fetch Chapter Verses (/api/bible/chapter?bookId=19&chapter=23)
    if ($endpoint === 'bible/chapter') {
        $bookId = (int)($_GET['bookId'] ?? $_GET['book_id'] ?? 19);
        $chapter = (int)($_GET['chapter'] ?? 1);

        $stmt = $db->prepare("SELECT verse, verse_text FROM bible_verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC");
        $stmt->execute([$bookId, $chapter]);
        $rows = $stmt->fetchAll();

        $verses = array_map(function($r) {
            return [
                'verse' => (int)$r['verse'],
                'text' => $r['verse_text']
            ];
        }, $rows);

        echo json_encode([
            'success' => true,
            'bookId' => $bookId,
            'chapter' => $chapter,
            'count' => count($verses),
            'data' => $verses
        ]);
        exit;
    }

    // 6c. Search Verses (/api/bible/search?q=அற்புத)
    if ($endpoint === 'bible/search') {
        $q = trim($_GET['q'] ?? '');
        if (empty($q)) {
            echo json_encode(['success' => true, 'data' => []]);
            exit;
        }

        $searchTerm = '%' . $q . '%';
        $stmt = $db->prepare("SELECT book_id, book_name, book_tamil, chapter, verse, verse_text FROM bible_verses WHERE verse_text LIKE ? OR book_tamil LIKE ? OR book_name LIKE ? LIMIT 50");
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
        $rows = $stmt->fetchAll();

        $results = array_map(function($r) {
            return [
                'bookId' => (int)$r['book_id'],
                'book' => $r['book_name'],
                'bookTamil' => $r['book_tamil'],
                'chapter' => (int)$r['chapter'],
                'verse' => (int)$r['verse'],
                'text' => $r['verse_text'],
                'reference' => "{$r['book_tamil']} {$r['chapter']}:{$r['verse']}"
            ];
        }, $rows);

        echo json_encode(['success' => true, 'query' => $q, 'count' => count($results), 'data' => $results]);
        exit;
    }

    // 6d. Single Verse Lookup (/api/bible/verse?bookId=19&chapter=23&verse=1)
    if ($endpoint === 'bible/verse') {
        $bookId = (int)($_GET['bookId'] ?? 19);
        $chapter = (int)($_GET['chapter'] ?? 23);
        $verse = (int)($_GET['verse'] ?? 1);

        $stmt = $db->prepare("SELECT book_name, book_tamil, verse_text FROM bible_verses WHERE book_id = ? AND chapter = ? AND verse = ? LIMIT 1");
        $stmt->execute([$bookId, $chapter, $verse]);
        $r = $stmt->fetch();

        if ($r) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'bookId' => $bookId,
                    'book' => $r['book_name'],
                    'bookTamil' => $r['book_tamil'],
                    'chapter' => $chapter,
                    'verse' => $verse,
                    'text' => $r['verse_text'],
                    'reference' => "{$r['book_tamil']} {$chapter}:{$verse}"
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Verse not found']);
        }
        exit;
    }
}

// 7. Background Themes CRUD (/api/backgrounds)
if ($endpoint === 'backgrounds') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM backgrounds ORDER BY is_default DESC, created_at ASC");
        $rows = $stmt->fetchAll();
        $bgs = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['name'],
                'type' => $r['type'],
                'gradientFrom' => $r['gradient_from'],
                'gradientTo' => $r['gradient_to'],
                'color' => $r['color'],
                'imageUrl' => $r['image_url'],
                'videoUrl' => $r['video_url'],
                'isDefault' => (bool)$r['is_default']
            ];
        }, $rows);
        echo json_encode(['success' => true, 'data' => $bgs]);
        exit;
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $id = $input['id'] ?? ('bg-' . uniqid());
        $name = $input['name'] ?? 'Custom Background';
        $type = $input['type'] ?? 'gradient';
        $gradientFrom = $input['gradientFrom'] ?? $input['gradient_from'] ?? null;
        $gradientTo = $input['gradientTo'] ?? $input['gradient_to'] ?? null;
        $color = $input['color'] ?? null;
        $imageUrl = $input['imageUrl'] ?? $input['image_url'] ?? null;
        $videoUrl = $input['videoUrl'] ?? $input['video_url'] ?? null;
        $isDefault = !empty($input['isDefault']) ? 1 : 0;

        $stmt = $db->prepare("REPLACE INTO backgrounds (id, name, type, gradient_from, gradient_to, color, image_url, video_url, is_default, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$id, $name, $type, $gradientFrom, $gradientTo, $color, $imageUrl, $videoUrl, $isDefault]);

        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Background saved']);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("DELETE FROM backgrounds WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Background deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing background ID']);
        }
        exit;
    }
}

// 8. Templates CRUD (/api/templates)
if ($endpoint === 'templates') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM templates ORDER BY is_default DESC, name ASC");
        $rows = $stmt->fetchAll();
        $tpls = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['name'],
                'description' => $r['description'],
                'layoutType' => $r['layout_type'],
                'config' => json_decode($r['config_json'], true),
                'isDefault' => (bool)$r['is_default']
            ];
        }, $rows);
        echo json_encode(['success' => true, 'data' => $tpls]);
        exit;
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $id = $input['id'] ?? ('tpl-' . uniqid());
        $name = $input['name'] ?? 'Custom Template';
        $description = $input['description'] ?? '';
        $layoutType = $input['layoutType'] ?? $input['layout_type'] ?? 'fullscreen';
        $config = json_encode($input['config'] ?? [], JSON_UNESCAPED_UNICODE);
        $isDefault = !empty($input['isDefault']) ? 1 : 0;

        $stmt = $db->prepare("REPLACE INTO templates (id, name, description, layout_type, config_json, is_default, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$id, $name, $description, $layoutType, $config, $isDefault]);

        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Template saved']);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("DELETE FROM templates WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Template deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing template ID']);
        }
        exit;
    }
}

// 9. Media & Uploads (/api/media or /api/media/upload)
if (strpos($endpoint, 'media') === 0) {
    $uploadsDir = __DIR__ . '/uploads';
    if (!is_dir($uploadsDir)) {
        @mkdir($uploadsDir, 0755, true);
    }

    // 9a. File Upload Handling
    if ($endpoint === 'media/upload' && $method === 'POST') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded or upload error occurred']);
            exit;
        }

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'aac'];

        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Allowed: images, videos, audio.']);
            exit;
        }

        $type = in_array($ext, ['mp4', 'webm', 'mov']) ? 'video' : (in_array($ext, ['mp3', 'wav', 'aac']) ? 'audio' : 'image');
        $id = 'media-' . uniqid();
        $safeFileName = $id . '.' . $ext;
        $destPath = $uploadsDir . '/' . $safeFileName;

        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $fileUrl = "{$scheme}://{$host}/uploads/{$safeFileName}";

            $stmt = $db->prepare("REPLACE INTO media (id, name, type, file_url, file_path, file_size, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([$id, $file['name'], $type, $fileUrl, $destPath, $file['size']]);

            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $id,
                    'name' => $file['name'],
                    'type' => $type,
                    'url' => $fileUrl,
                    'size' => $file['size']
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save uploaded file']);
        }
        exit;
    }

    // 9b. List Media (/api/media)
    if ($endpoint === 'media' && $method === 'GET') {
        $stmt = $db->query("SELECT * FROM media ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $media = array_map(function($r) {
            return [
                'id' => $r['id'],
                'name' => $r['name'],
                'type' => $r['type'],
                'url' => $r['file_url'],
                'size' => (int)$r['file_size'],
                'createdAt' => $r['created_at']
            ];
        }, $rows);
        echo json_encode(['success' => true, 'data' => $media]);
        exit;
    }

    // 9c. Delete Media (/api/media?id=...)
    if ($endpoint === 'media' && $method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("SELECT file_path FROM media WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row && !empty($row['file_path']) && file_exists($row['file_path'])) {
                @unlink($row['file_path']);
            }
            $del = $db->prepare("DELETE FROM media WHERE id = ?");
            $del->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Media deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing media ID']);
        }
        exit;
    }
}

// 404 Fallback
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'endpoint' => $endpoint]);
