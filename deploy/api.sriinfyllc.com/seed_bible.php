<?php
// Fast batch seeder for Tamil Bible (31,102 verses) into PlayCast database
set_time_limit(300);
ini_set('memory_limit', '512M');

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$jsonPath = __DIR__ . '/data/tamil-bible.json';
if (!file_exists($jsonPath)) {
    // Try looking in public folder
    $alt = dirname(dirname(__DIR__)) . '/app/frontend/public/data/tamil-bible.json';
    if (file_exists($alt)) {
        $jsonPath = $alt;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'tamil-bible.json not found in ' . $jsonPath]);
        exit;
    }
}

$count = (int) $db->query("SELECT COUNT(*) FROM bible_verses")->fetchColumn();
if ($count > 30000 && !isset($_GET['force'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Bible already fully seeded in database (' . $count . ' verses)',
        'count' => $count
    ]);
    exit;
}

// Read JSON
$raw = file_get_contents($jsonPath);
$books = json_decode($raw, true);
if (!is_array($books)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse tamil-bible.json']);
    exit;
}

$startTime = microtime(true);
$db->beginTransaction();

// Clear if forcing
if (isset($_GET['force'])) {
    $db->exec("DELETE FROM bible_verses");
}

$stmt = $db->prepare("INSERT INTO bible_verses (book_id, book_name, book_tamil, chapter, verse, verse_text) VALUES (?, ?, ?, ?, ?, ?)");

$totalInserted = 0;
$bookId = 1;

foreach ($books as $b) {
    $english = $b['e'] ?? ('Book ' . $bookId);
    $tamil = $b['t'] ?? $english;
    $chapters = $b['c'] ?? [];

    $chapterNum = 1;
    foreach ($chapters as $verses) {
        $verseNum = 1;
        foreach ($verses as $text) {
            $stmt->execute([
                $bookId,
                $english,
                $tamil,
                $chapterNum,
                $verseNum,
                $text
            ]);
            $totalInserted++;
            $verseNum++;
        }
        $chapterNum++;
    }
    $bookId++;
}

$db->commit();
$elapsed = round(microtime(true) - $startTime, 2);

echo json_encode([
    'success' => true,
    'message' => "Successfully seeded {$totalInserted} Bible verses into database!",
    'total_verses' => $totalInserted,
    'books' => ($bookId - 1),
    'elapsed_seconds' => $elapsed,
    'database_driver' => $activeDriver
]);
