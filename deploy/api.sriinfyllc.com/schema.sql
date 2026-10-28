-- ==============================================================================
-- PlayCast Church Presentation & Broadcast System - MySQL Schema
-- Target Database: Velloreh1_Playcast
-- Character Set: utf8mb4 (Full Tamil & Multilingual Unicode Support)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Services Table (Sunday Service Playlists)
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(128) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 0,
  `sections_json` LONGTEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Worship Songs Table (Tamil & English Hymnal)
CREATE TABLE IF NOT EXISTS `songs` (
  `id` VARCHAR(128) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `tamil_title` VARCHAR(255) DEFAULT NULL,
  `author` VARCHAR(255) DEFAULT NULL,
  `song_key` VARCHAR(32) DEFAULT NULL,
  `sections_json` LONGTEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Global Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(128) NOT NULL,
  `value_json` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Live Broadcast State Table (Single-row real-time cache for OBS / Remote polling)
CREATE TABLE IF NOT EXISTS `live_state` (
  `id` INT NOT NULL,
  `state_json` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Seed Initial Worship Songs
REPLACE INTO `songs` (`id`, `title`, `tamil_title`, `author`, `song_key`, `sections_json`) VALUES
(
  'song-ag',
  'Amazing Grace',
  'அற்புத கிருபை என்னை மீட்டதே',
  'John Newton',
  'G',
  '[{"tag":"Verse 1","tamilText":"அற்புத கிருபை என்னையே மீட்டதே,\\nநான் தொலைந்தேன், இப்போது கண்டேன்,\\nகுருடனாயிருந்தேன், பார்க்கிறேன்.","englishText":"Amazing grace how sweet the sound that saved a wretch like me!\\nI once was lost, but now am found;\\nwas blind, but now I see."},{"tag":"Verse 2","tamilText":"பயப்படக் கற்பித்தது கிருபையே,\\nஎன் பயங்களை நீக்கியதும் கிருபையே;\\nவிசுவாசித்த முதல் நாழிகையிலே,\\nஅந்தக் கிருபை எவ்வளவு விலையேறப்பெற்றது!","englishText":"\'Twas grace that taught my heart to fear, and grace my fears relieved;\\nHow precious did that grace appear the hour I first believed."},{"tag":"Chorus","tamilText":"என் விலங்குகள் உடைந்தன, நான் விடுதலையானேன்,\\nஎன் தேவன், என் மீட்பர் என்னை மீட்டாரே;\\nவெள்ளம் போல அவருடைய இரக்கம் பாய்கிறது,\\nமுடிவில்லா அன்பு, அற்புத கிருபை.","englishText":"My chains are gone, I have been set free,\\nMy God, my Savior has ransomed me;\\nAnd like a flood His mercy reigns,\\nUnending love, amazing grace."},{"tag":"Verse 3","tamilText":"கர்த்தர் எனக்கு நன்மையை வாக்களித்தார்,\\nஅவருடைய வார்த்தை என் நம்பிக்கையை உறுதிப்படுத்துகிறது;\\nஎன் கேடகமும் பங்கும் அவரே,\\nஆயுள் உள்ள வரை என்னோடிருப்பார்.","englishText":"The Lord has promised good to me, His word my hope secures;\\nHe will my shield and portion be as long as life endures."}]'
),
(
  'song-10000',
  '10,000 Reasons',
  'என் ஆத்துமாவே கர்த்தரை ஸ்தோத்திரி',
  'Matt Redman',
  'G',
  '[{"tag":"Chorus","tamilText":"என் ஆத்துமாவே கர்த்தரை ஸ்தோத்திரி,\\nஅவருடைய பரிசுத்த நாமத்தை பாடு;\\nமுன்பெப்போதும் இல்லாதபடி பாடு,\\nஉம் பரிசுத்த நாமத்தை தொழுதிடுவேன்.","englishText":"Bless the Lord O my soul, O my soul, worship His holy name.\\nSing like never before, O my soul, I will worship Your holy name."},{"tag":"Verse 1","tamilText":"சூரியன் உதிக்கும் புது நாள் இது,\\nமீண்டும் உம்மைப் பாட நேரம் இது;\\nஎன்ன நேரிடினும், என் முன் என்ன வரினும்,\\nமாலை வேளையிலும் நான் பாடுவேன்.","englishText":"The sun comes up, it\'s a new day dawning; it\'s time to sing Your song again.\\nWhatever may pass, and whatever lies before me, let me be singing when the evening comes."}]'
),
(
  'song-in-christ-alone',
  'In Christ Alone',
  'கிறிஸ்துவுக்குள் மட்டுமே என் நம்பிக்கை',
  'Keith Getty, Stuart Townend',
  'D',
  '[{"tag":"Verse 1","tamilText":"கிறிஸ்துவுக்குள் மட்டுமே என் நம்பிக்கை உள்ளது,\\nஅவரே என் ஒளி, என் பலன், என் பாடல்;","englishText":"In Christ alone my hope is found, He is my light, my strength, my song;\\nThis Cornerstone, this solid Ground, firm through the fiercest drought and storm."},{"tag":"Chorus","tamilText":"என் பயங்கள் நீங்கின, கிறிஸ்து என் இரட்சகர்,\\nஅவருடைய அன்பில் நான் நிலைத்திருப்பேன்.","englishText":"No guilt in life, no fear in death, this is the power of Christ in me;\\nFrom life’s first cry to final breath, Jesus commands my destiny."}]'
);

SET FOREIGN_KEY_CHECKS = 1;
