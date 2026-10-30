<?php
// PlayCast Backend Database & Configuration (Universal MySQL + SQLite PDO)

// 1. Native .env loader
function loadEnvFile($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            $len = strlen($val);
            if ($len >= 2 && (($val[0] === '"' && $val[$len - 1] === '"') || ($val[0] === "'" && $val[$len - 1] === "'"))) {
                $val = substr($val, 1, -1);
            }
            if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                putenv("$key=$val");
                $_ENV[$key] = $val;
                $_SERVER[$key] = $val;
            }
        }
    }
}

loadEnvFile(__DIR__ . '/.env');

// 2. Configuration Parameters
$dbDriver = strtolower(getenv('DB_DRIVER') ?: 'sqlite');
$dbHost   = getenv('DB_HOST') ?: 'localhost';
$dbPort   = getenv('DB_PORT') ?: '3306';
$dbName   = getenv('DB_NAME') ?: 'Velloreh1_Playcast';
$dbUser   = getenv('DB_USER') ?: 'velloreh1_Playcast';
$dbPass   = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$fallbackSqlite = getenv('DB_FALLBACK_SQLITE') !== 'false';

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$sqlitePath = $dataDir . '/playcast.db';

$db = null;
$activeDriver = 'none';
$mysqlError = null;
$mysqlAttempted = false;

// 3. Connect to Database (MySQL with SQLite Fallback)
$shouldTryMysql = ($dbDriver === 'mysql' || (!empty($dbPass) && $dbPass !== 'YOUR_MYSQL_PASSWORD_HERE'));

if ($shouldTryMysql) {
    $mysqlAttempted = true;
    $dbNamesToTry = array_unique(array_filter([
        $dbName,
        strtolower($dbName),
        'velloreh1_Playcast',
        'velloreh1_playcast'
    ]));
    $hostsToTry = array_unique(array_filter([$dbHost, 'localhost', '127.0.0.1']));

    foreach ($hostsToTry as $hostCandidate) {
        foreach ($dbNamesToTry as $nameCandidate) {
            try {
                $dsn = "mysql:host={$hostCandidate};port={$dbPort};dbname={$nameCandidate};charset=utf8mb4";
                $db = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]);
                $activeDriver = 'mysql';
                $dbName = $nameCandidate;
                $dbHost = $hostCandidate;
                $mysqlError = null;
                break 2;
            } catch (PDOException $e) {
                $mysqlError = $e->getMessage();
            }
        }
    }

    if (!$db && !$fallbackSqlite) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'error' => 'MySQL connection failed: ' . $mysqlError,
            'hint' => 'Check your DB_USER, DB_NAME, and DB_PASS in .env file.'
        ]);
        exit;
    }
}

// Fallback to SQLite if MySQL not connected
if (!$db) {
    try {
        $db = new PDO("sqlite:" . $sqlitePath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $activeDriver = 'sqlite';
    } catch (PDOException $e) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode(['error' => 'SQLite connection failed: ' . $e->getMessage()]);
        exit;
    }
}

// 4. Auto-create tables if they don't exist
try {
    if ($activeDriver === 'mysql') {
        $db->exec("CREATE TABLE IF NOT EXISTS `services` (
            `id` VARCHAR(128) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `is_active` TINYINT(1) DEFAULT 0,
            `sections_json` LONGTEXT NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS `songs` (
            `id` VARCHAR(128) NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `tamil_title` VARCHAR(255) DEFAULT NULL,
            `author` VARCHAR(255) DEFAULT NULL,
            `song_key` VARCHAR(32) DEFAULT NULL,
            `sections_json` LONGTEXT NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS `settings` (
            `setting_key` VARCHAR(128) NOT NULL,
            `value_json` LONGTEXT NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`setting_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS `live_state` (
            `id` INT NOT NULL,
            `state_json` LONGTEXT NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS `bible_verses` (
            `id` INT AUTO_INCREMENT NOT NULL,
            `book_id` INT NOT NULL,
            `book_name` VARCHAR(64) NOT NULL,
            `book_tamil` VARCHAR(64) NOT NULL,
            `chapter` INT NOT NULL,
            `verse` INT NOT NULL,
            `verse_text` LONGTEXT NOT NULL,
            PRIMARY KEY (`id`),
            INDEX `idx_bk_ch` (`book_id`, `chapter`),
            INDEX `idx_bk_ch_vs` (`book_id`, `chapter`, `verse`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS `backgrounds` (
            `id` VARCHAR(128) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `type` VARCHAR(32) NOT NULL,
            `gradient_from` VARCHAR(32) DEFAULT NULL,
            `gradient_to` VARCHAR(32) DEFAULT NULL,
            `color` VARCHAR(32) DEFAULT NULL,
            `image_url` TEXT DEFAULT NULL,
            `video_url` TEXT DEFAULT NULL,
            `is_default` TINYINT(1) DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS `templates` (
            `id` VARCHAR(128) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `description` VARCHAR(255) DEFAULT NULL,
            `layout_type` VARCHAR(64) NOT NULL,
            `config_json` LONGTEXT NOT NULL,
            `is_default` TINYINT(1) DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS `media` (
            `id` VARCHAR(128) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `type` VARCHAR(32) NOT NULL,
            `file_url` TEXT NOT NULL,
            `file_path` TEXT NOT NULL,
            `file_size` INT DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 9. Users Table (Centrally Managed SaaS Accounts)
        $db->exec("CREATE TABLE IF NOT EXISTS `users` (
            `id` VARCHAR(64) NOT NULL,
            `username` VARCHAR(64) NOT NULL,
            `email` VARCHAR(191) NOT NULL,
            `name` VARCHAR(128) NOT NULL,
            `phone` VARCHAR(32) DEFAULT NULL,
            `password_hash` VARCHAR(255) NOT NULL,
            `role` VARCHAR(32) NOT NULL DEFAULT 'USER',
            `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
            `must_change_password` TINYINT(1) DEFAULT 0,
            `expires_at` DATETIME DEFAULT NULL,
            `notes` TEXT DEFAULT NULL,
            `created_by` VARCHAR(64) DEFAULT NULL,
            `last_login_at` DATETIME DEFAULT NULL,
            `last_login_ip` VARCHAR(64) DEFAULT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_u_username` (`username`),
            UNIQUE KEY `idx_u_email` (`email`),
            INDEX `idx_u_status` (`status`),
            INDEX `idx_u_role` (`role`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 10. Server-Managed Sessions Table (Tokens hashed with SHA-256)
        $db->exec("CREATE TABLE IF NOT EXISTS `user_sessions` (
            `id` VARCHAR(64) NOT NULL,
            `user_id` VARCHAR(64) NOT NULL,
            `token_hash` VARCHAR(64) NOT NULL,
            `ip_address` VARCHAR(64) DEFAULT NULL,
            `user_agent` TEXT DEFAULT NULL,
            `expires_at` DATETIME NOT NULL,
            `last_activity_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_us_token` (`token_hash`),
            INDEX `idx_us_user` (`user_id`),
            INDEX `idx_us_exp` (`expires_at`),
            CONSTRAINT `fk_us_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 11. Security & Administrative Audit Logs Table
        $db->exec("CREATE TABLE IF NOT EXISTS `audit_logs` (
            `id` BIGINT AUTO_INCREMENT NOT NULL,
            `user_id` VARCHAR(64) DEFAULT NULL,
            `username` VARCHAR(64) DEFAULT NULL,
            `action` VARCHAR(64) NOT NULL,
            `details_json` LONGTEXT DEFAULT NULL,
            `ip_address` VARCHAR(64) DEFAULT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_al_act` (`action`),
            INDEX `idx_al_uid` (`user_id`),
            INDEX `idx_al_time` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    } else {
        $db->exec("CREATE TABLE IF NOT EXISTS services (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            is_active INTEGER DEFAULT 0,
            sections_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            tamil_title TEXT,
            author TEXT,
            song_key TEXT,
            sections_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS settings (
            setting_key TEXT PRIMARY KEY,
            value_json TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS live_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            state_json TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS bible_verses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            book_name TEXT NOT NULL,
            book_tamil TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            verse_text TEXT NOT NULL
        )");
        $db->exec("CREATE INDEX IF NOT EXISTS idx_bv_bk_ch ON bible_verses (book_id, chapter)");
        $db->exec("CREATE INDEX IF NOT EXISTS idx_bv_bk_ch_vs ON bible_verses (book_id, chapter, verse)");

        $db->exec("CREATE TABLE IF NOT EXISTS backgrounds (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            gradient_from TEXT,
            gradient_to TEXT,
            color TEXT,
            image_url TEXT,
            video_url TEXT,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            layout_type TEXT NOT NULL,
            config_json TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS media (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            file_url TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // SQLite Users Table
        $db->exec("CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            must_change_password INTEGER DEFAULT 0,
            expires_at DATETIME,
            notes TEXT,
            created_by TEXT,
            last_login_at DATETIME,
            last_login_ip TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // SQLite User Sessions Table
        $db->exec("CREATE TABLE IF NOT EXISTS user_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token_hash TEXT UNIQUE NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            expires_at DATETIME NOT NULL,
            last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // SQLite Audit Logs Table
        $db->exec("CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            username TEXT,
            action TEXT NOT NULL,
            details_json TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
    }

    // Ensure uploads directory exists
    $uploadsDir = __DIR__ . '/uploads';
    if (!is_dir($uploadsDir)) {
        @mkdir($uploadsDir, 0755, true);
    }

    // 1. Seed default songs if table is empty
    $count = (int) $db->query("SELECT COUNT(*) FROM songs")->fetchColumn();
    if ($count === 0) {
        $defaultSongs = [
            [
                'id' => 'song-ag',
                'title' => 'Amazing Grace',
                'tamil_title' => 'அற்புத கிருபை என்னை மீட்டதே',
                'author' => 'John Newton',
                'song_key' => 'G',
                'sections' => [
                    [
                        'tag' => 'Verse 1',
                        'tamilText' => "அற்புத கிருபை என்னையே மீட்டதே,\nநான் தொலைந்தேன், இப்போது கண்டேன்,\nகுருடனாயிருந்தேன், பார்க்கிறேன்.",
                        'englishText' => "Amazing grace how sweet the sound that saved a wretch like me!\nI once was lost, but now am found;\nwas blind, but now I see."
                    ],
                    [
                        'tag' => 'Verse 2',
                        'tamilText' => "பயப்படக் கற்பித்தது கிருபையே,\nஎன் பயங்களை நீக்கியதும் கிருபையே;\nவிசுவாசித்த முதல் நாழிகையிலே,\nஅந்தக் கிருபை எவ்வளவு விலையேறப்பெற்றது!",
                        'englishText' => "'Twas grace that taught my heart to fear, and grace my fears relieved;\nHow precious did that grace appear the hour I first believed."
                    ],
                    [
                        'tag' => 'Chorus',
                        'tamilText' => "என் விலங்குகள் உடைந்தன, நான் விடுதலையானேன்,\nஎன் தேவன், என் மீட்பர் என்னை மீட்டாரே;\nவெள்ளம் போல அவருடைய இரக்கம் பாய்கிறது,\nமுடிவில்லா அன்பு, அற்புத கிருபை.",
                        'englishText' => "My chains are gone, I have been set free,\nMy God, my Savior has ransomed me;\nAnd like a flood His mercy reigns,\nUnending love, amazing grace."
                    ],
                    [
                        'tag' => 'Verse 3',
                        'tamilText' => "கர்த்தர் எனக்கு நன்மையை வாக்களித்தார்,\nஅவருடைய வார்த்தை என் நம்பிக்கையை உறுதிப்படுத்துகிறது;\nஎன் கேடகமும் பங்கும் அவரே,\nஆயுள் உள்ள வரை என்னோடிருப்பார்.",
                        'englishText' => "The Lord has promised good to me, His word my hope secures;\nHe will my shield and portion be as long as life endures."
                    ]
                ]
            ],
            [
                'id' => 'song-10000',
                'title' => '10,000 Reasons',
                'tamil_title' => 'என் ஆத்துமாவே கர்த்தரை ஸ்தோத்திரி',
                'author' => 'Matt Redman',
                'song_key' => 'G',
                'sections' => [
                    [
                        'tag' => 'Chorus',
                        'tamilText' => "என் ஆத்துமாவே கர்த்தரை ஸ்தோத்திரி,\nஅவருடைய பரிசுத்த நாமத்தை பாடு;\nமுன்பெப்போதும் இல்லாதபடி பாடு,\nஉம் பரிசுத்த நாமத்தை தொழுதிடுவேன்.",
                        'englishText' => "Bless the Lord O my soul, O my soul, worship His holy name.\nSing like never before, O my soul, I will worship Your holy name."
                    ],
                    [
                        'tag' => 'Verse 1',
                        'tamilText' => "சூரியன் உதிக்கும் புது நாள் இது,\nமீண்டும் உம்மைப் பாட நேரம் இது;\nஎன்ன நேரிடினும், என் முன் என்ன வரினும்,\nமாலை வேளையிலும் நான் பாடுவேன்.",
                        'englishText' => "The sun comes up, it's a new day dawning; it's time to sing Your song again.\nWhatever may pass, and whatever lies before me, let me be singing when the evening comes."
                    ]
                ]
            ],
            [
                'id' => 'song-in-christ-alone',
                'title' => 'In Christ Alone',
                'tamil_title' => 'கிறிஸ்துவுக்குள் மட்டுமே என் நம்பிக்கை',
                'author' => 'Keith Getty, Stuart Townend',
                'song_key' => 'D',
                'sections' => [
                    [
                        'tag' => 'Verse 1',
                        'tamilText' => "கிறிஸ்துவுக்குள் மட்டுமே என் நம்பிக்கை உள்ளது,\nஅவரே என் ஒளி, என் பலன், என் பாடல்;",
                        'englishText' => "In Christ alone my hope is found, He is my light, my strength, my song;\nThis Cornerstone, this solid Ground, firm through the fiercest drought and storm."
                    ],
                    [
                        'tag' => 'Chorus',
                        'tamilText' => "என் பயங்கள் நீங்கின, கிறிஸ்து என் இரட்சகர்,\nஅவருடைய அன்பில் நான் நிலைத்திருப்பேன்.",
                        'englishText' => "No guilt in life, no fear in death, this is the power of Christ in me;\nFrom life’s first cry to final breath, Jesus commands my destiny."
                    ]
                ]
            ]
        ];

        $stmt = $db->prepare("REPLACE INTO songs (id, title, tamil_title, author, song_key, sections_json) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($defaultSongs as $s) {
            $stmt->execute([
                $s['id'],
                $s['title'],
                $s['tamil_title'],
                $s['author'],
                $s['song_key'],
                json_encode($s['sections'], JSON_UNESCAPED_UNICODE)
            ]);
        }
    }

    // 2. Seed default backgrounds if table is empty
    $bgCount = (int) $db->query("SELECT COUNT(*) FROM backgrounds")->fetchColumn();
    if ($bgCount === 0) {
        $defaultBgs = [
            ['id' => 'bg-charcoal', 'name' => 'Charcoal Dark', 'type' => 'gradient', 'gradient_from' => '#080811', 'gradient_to' => '#1a1829', 'color' => null, 'is_default' => 1],
            ['id' => 'bg-royal-purple', 'name' => 'Royal Purple', 'type' => 'gradient', 'gradient_from' => '#120b22', 'gradient_to' => '#43135c', 'color' => null, 'is_default' => 0],
            ['id' => 'bg-midnight-blue', 'name' => 'Midnight Blue', 'type' => 'gradient', 'gradient_from' => '#061325', 'gradient_to' => '#0f3156', 'color' => null, 'is_default' => 0],
            ['id' => 'bg-deep-crimson', 'name' => 'Deep Crimson', 'type' => 'gradient', 'gradient_from' => '#200810', 'gradient_to' => '#4f1425', 'color' => null, 'is_default' => 0],
            ['id' => 'bg-emerald', 'name' => 'Emerald Green', 'type' => 'gradient', 'gradient_from' => '#071d18', 'gradient_to' => '#124337', 'color' => null, 'is_default' => 0],
            ['id' => 'bg-obs-transparent', 'name' => 'OBS Transparent Key', 'type' => 'transparent', 'gradient_from' => null, 'gradient_to' => null, 'color' => 'transparent', 'is_default' => 0],
        ];
        $stmtBg = $db->prepare("REPLACE INTO backgrounds (id, name, type, gradient_from, gradient_to, color, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($defaultBgs as $b) {
            $stmtBg->execute([$b['id'], $b['name'], $b['type'], $b['gradient_from'], $b['gradient_to'], $b['color'], $b['is_default']]);
        }
    }

    // 3. Seed default templates if table is empty
    $tplCount = (int) $db->query("SELECT COUNT(*) FROM templates")->fetchColumn();
    if ($tplCount === 0) {
        $defaultTpls = [
            [
                'id' => 'fullscreen',
                'name' => 'Fullscreen Sanctuary',
                'description' => 'Standard clean centered presentation with bilingual stacking',
                'layout_type' => 'fullscreen',
                'config_json' => json_encode(['align' => 'center', 'style' => 'standard', 'bilingual' => true]),
                'is_default' => 1
            ],
            [
                'id' => 'lower-third',
                'name' => 'OBS Lower-Third Banner',
                'description' => 'Broadcast overlay for church cameras with alpha channel',
                'layout_type' => 'lower-third',
                'config_json' => json_encode(['position' => 'bottom', 'alpha' => true, 'accentBar' => true]),
                'is_default' => 0
            ],
            [
                'id' => 'box',
                'name' => 'Frosted Glass Box',
                'description' => 'Modern frosted glass backdrop for scripture & prayer',
                'layout_type' => 'box',
                'config_json' => json_encode(['backdropBlur' => 'md', 'card' => true]),
                'is_default' => 0
            ],
            [
                'id' => 'trendy',
                'name' => 'Trendy Accent Modern',
                'description' => 'Contemporary youth worship layout with accent pill badges',
                'layout_type' => 'trendy',
                'config_json' => json_encode(['badges' => true, 'accentColor' => 'fuchsia']),
                'is_default' => 0
            ],
            [
                'id' => 'minimal',
                'name' => 'Minimalist Clean',
                'description' => 'Subtle typography-first layout with high legibility',
                'layout_type' => 'minimal',
                'config_json' => json_encode(['padding' => 'loose', 'font' => 'serif']),
                'is_default' => 0
            ]
        ];
        $stmtTpl = $db->prepare("REPLACE INTO templates (id, name, description, layout_type, config_json, is_default) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($defaultTpls as $t) {
            $stmtTpl->execute([$t['id'], $t['name'], $t['description'], $t['layout_type'], $t['config_json'], $t['is_default']]);
        }
    }

    // 4. Seed initial Super Administrator if users table is empty
    $userCount = (int) $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($userCount === 0) {
        $initUser = getenv('INITIAL_ADMIN_USER') ?: 'admin';
        $initPass = getenv('INITIAL_ADMIN_PASS') ?: 'Admin@PlayCast2026!';
        $initEmail = getenv('INITIAL_ADMIN_EMAIL') ?: 'admin@playcast.local';
        $initName = getenv('INITIAL_ADMIN_NAME') ?: 'Super Administrator';

        $hash = password_hash($initPass, PASSWORD_BCRYPT);
        $adminId = 'usr-admin-initial';

        $stmtAdmin = $db->prepare("INSERT INTO users (id, username, email, name, password_hash, role, status, must_change_password) VALUES (?, ?, ?, ?, ?, 'SUPER_ADMIN', 'ACTIVE', 0)");
        $stmtAdmin->execute([$adminId, $initUser, $initEmail, $initName, $hash]);

        try {
            $stmtAudit = $db->prepare("INSERT INTO audit_logs (user_id, username, action, details_json, ip_address) VALUES (?, ?, 'SYSTEM_BOOTSTRAP', ?, '127.0.0.1')");
            $stmtAudit->execute([$adminId, $initUser, json_encode(['note' => 'Initial Super Administrator account provisioned'])]);
        } catch (Exception $ae) {}
    }

    // 5. Seed default system_license capacity setting if missing
    $licenseStmt = $db->prepare("SELECT value_json FROM settings WHERE setting_key = 'system_license'");
    $licenseStmt->execute();
    if (!$licenseStmt->fetch()) {
        $defaultLicense = json_encode([
            'max_users' => 0, // 0 = unlimited capacity
            'license_tier' => 'Enterprise Unlimited',
            'configured_at' => date('Y-m-d H:i:s')
        ]);
        $initLic = $db->prepare("INSERT INTO settings (setting_key, value_json) VALUES ('system_license', ?)");
        $initLic->execute([$defaultLicense]);
    }
} catch (Exception $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['error' => 'Database initialization error: ' . $e->getMessage()]);
    exit;
}
