<?php
// PlayCast Database & Environment Diagnostic Tool
// Access via: https://api.sriinfyllc.com/test_db.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');

$envPath = __DIR__ . '/.env';
$envExists = file_exists($envPath);

require_once __DIR__ . '/config.php';

$phpVersion = PHP_VERSION;
$hasPdoMysql = extension_loaded('pdo_mysql');
$hasPdoSqlite = extension_loaded('pdo_sqlite');

$dbStatus = 'Unknown';
$dbMessage = '';
$tableStatus = [];
$sampleSongs = 0;

try {
    if ($db) {
        $dbStatus = 'Connected (' . strtoupper($activeDriver) . ')';
        $stmt = $db->query("SELECT COUNT(*) FROM songs");
        $sampleSongs = (int) $stmt->fetchColumn();

        // Check tables
        $tables = ['services', 'songs', 'settings', 'live_state'];
        foreach ($tables as $t) {
            try {
                $count = $db->query("SELECT COUNT(*) FROM `{$t}`")->fetchColumn();
                $tableStatus[$t] = ['ok' => true, 'count' => $count];
            } catch (Exception $te) {
                // Try without backticks (for SQLite)
                try {
                    $count = $db->query("SELECT COUNT(*) FROM {$t}")->fetchColumn();
                    $tableStatus[$t] = ['ok' => true, 'count' => $count];
                } catch (Exception $te2) {
                    $tableStatus[$t] = ['ok' => false, 'error' => $te2->getMessage()];
                }
            }
        }
    } else {
        $dbStatus = 'Failed to connect';
    }
} catch (Exception $e) {
    $dbStatus = 'Error';
    $dbMessage = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlayCast API & Database Diagnostic - api.sriinfyllc.com</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
        .card { max-width: 720px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: 1px solid #334155; }
        h1 { font-size: 20px; margin-top: 0; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
        .badge-success { background: #065f46; color: #34d399; }
        .badge-warning { background: #854d0e; color: #facc15; }
        .badge-error { background: #991b1b; color: #f87171; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #334155; font-size: 14px; }
        .label { color: #94a3b8; }
        .val { font-weight: 600; }
        .table-list { margin-top: 14px; }
        .table-item { display: inline-block; background: #0f172a; padding: 6px 12px; border-radius: 6px; margin: 4px 6px 4px 0; font-size: 13px; border: 1px solid #334155; }
        .hint { background: #0c4a6e; border-left: 4px solid #38bdf8; padding: 12px; border-radius: 4px; margin-top: 20px; font-size: 13px; line-height: 1.5; }
        a { color: #38bdf8; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🟢 PlayCast API Diagnostic • api.sriinfyllc.com</h1>
        <p style="color: #94a3b8; font-size: 13px;">Self-diagnostic test running on MilesWeb PHP Server.</p>

        <div class="row">
            <span class="label">Host Domain</span>
            <span class="val"><?php echo htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'api.sriinfyllc.com'); ?></span>
        </div>
        <div class="row">
            <span class="label">PHP Version</span>
            <span class="val"><?php echo $phpVersion; ?></span>
        </div>
        <div class="row">
            <span class="label">PDO MySQL Extension</span>
            <span class="val"><?php echo $hasPdoMysql ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-error">Missing</span>'; ?></span>
        </div>
        <div class="row">
            <span class="label">PDO SQLite Extension</span>
            <span class="val"><?php echo $hasPdoSqlite ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-error">Missing</span>'; ?></span>
        </div>
        <div class="row">
            <span class="label">Environment File (.env)</span>
            <span class="val"><?php echo $envExists ? '<span class="badge badge-success">Loaded (.env)</span>' : '<span class="badge badge-warning">Using Defaults</span>'; ?></span>
        </div>
        <div class="row">
            <span class="label">Active Database Driver</span>
            <span class="val">
                <?php if ($activeDriver === 'mysql'): ?>
                    <span class="badge badge-success">MySQL (<?php echo htmlspecialchars($dbName); ?>)</span>
                <?php elseif ($activeDriver === 'sqlite'): ?>
                    <span class="badge badge-warning">SQLite Fallback (data/playcast.db)</span>
                <?php else: ?>
                    <span class="badge badge-error">Not Connected</span>
                <?php endif; ?>
            </span>
        </div>
        <div class="row">
            <span class="label">Database Connection Status</span>
            <span class="val">
                <?php if ($db): ?>
                    <span class="badge badge-success"><?php echo $dbStatus; ?></span>
                <?php else: ?>
                    <span class="badge badge-error"><?php echo htmlspecialchars($dbMessage); ?></span>
                <?php endif; ?>
            </span>
        </div>

        <div style="margin-top: 18px;">
            <div class="label" style="margin-bottom: 6px;">Database Tables Verification:</div>
            <div class="table-list">
                <?php foreach ($tableStatus as $table => $info): ?>
                    <div class="table-item">
                        <?php if ($info['ok']): ?>
                            <span style="color: #34d399;">✓</span> <strong><?php echo htmlspecialchars($table); ?></strong> (<?php echo $info['count']; ?> rows)
                        <?php else: ?>
                            <span style="color: #f87171;">✕</span> <strong><?php echo htmlspecialchars($table); ?></strong>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="hint">
            <strong>Next Steps:</strong>
            <ul style="margin: 6px 0 0 16px; padding: 0;">
                <li>To test the live JSON health endpoint: <a href="/health" target="_blank">/health</a> or <a href="/api/health" target="_blank">/api/health</a></li>
                <li>To test the worship songs API: <a href="/songs" target="_blank">/songs</a> or <a href="/api/songs" target="_blank">/api/songs</a></li>
                <li>To test real-time broadcast state: <a href="/live" target="_blank">/live</a> or <a href="/api/live" target="_blank">/api/live</a></li>
            </ul>
        </div>
    </div>
</body>
</html>
