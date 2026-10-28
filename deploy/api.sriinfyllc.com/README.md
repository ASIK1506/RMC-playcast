# PlayCast Backend - Deployment Guide for MilesWeb
**Subdomain:** `api.sriinfyllc.com`  
**Document Root:** `api.sriinfyllc.com`  

---

## 🚀 Quick 3-Step Setup on MilesWeb

### Step 1: Upload Files to MilesWeb File Manager
1. Log into your **MilesWeb Control Panel**.
2. Click **Files > File Manager**.
3. Open the folder: **`Root > api.sriinfyllc.com`**.
4. Click the **Upload** button at the top right.
5. Select and upload the file: **`playcast-backend-milesweb.zip`**.
6. Once uploaded, right-click `playcast-backend-milesweb.zip` in File Manager and select **Extract**.
   *(Make sure the files extract directly into `api.sriinfyllc.com` so that `index.php` and `.htaccess` are in the root of the subdomain).*

---

### Step 2: Configure Database Password
1. In File Manager under `Root > api.sriinfyllc.com`, locate the **`.env`** file.
   *(If hidden, ensure "Show Hidden Files" is enabled in File Manager settings).*
2. Right-click `.env` and click **Edit**.
3. Find the line:
   ```env
   DB_PASS=YOUR_MYSQL_PASSWORD_HERE
   ```
4. Replace `YOUR_MYSQL_PASSWORD_HERE` with the password you set for user **`velloreh1_Playcast`**.
5. Save the file.

> **Note on Database:**
> The database name `Velloreh1_Playcast` and username `velloreh1_Playcast` are already configured for you.
> Tables will be **automatically created** upon your first request. You can also import `schema.sql` via phpMyAdmin if you prefer.

---

### Step 3: Verify Your API in Browser
Open these URLs in your web browser:

1. **Diagnostic Dashboard:**  
   `https://api.sriinfyllc.com/test_db.php`  
   *(Shows green checkmarks for PHP, MySQL connection, and database tables)*

2. **JSON Health Check:**  
   `https://api.sriinfyllc.com/health` or `https://api.sriinfyllc.com/api/health`  
   *(Should return: `{"status":"online","service":"PlayCast PHP API","database":"mysql",...}`)*

3. **Worship Songs API:**  
   `https://api.sriinfyllc.com/api/songs`

4. **Live Broadcast State:**  
   `https://api.sriinfyllc.com/api/live`

---

## 🔒 Security Notes
- Direct browser access to `.env`, `.db`, `data/`, and `schema.sql` is automatically blocked by `.htaccess`.
- CORS is enabled so your OBS Studio browser sources and web clients can communicate smoothly across domains.
- Once you have verified your database using `test_db.php`, you may delete `test_db.php` if desired.
