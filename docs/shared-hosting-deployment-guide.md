# EDUCORE - Shared Hosting Deployment Guide (cPanel / Apache / DirectAdmin / Plesk)

This production runbook details the exact steps to deploy the full **EDUCORE Universal Credential Verification & Trust Infrastructure** on standard Linux shared hosting environments with cPanel or similar control panels.

---

## 1. Architecture Overview on Shared Hosting

In shared hosting, web traffic lands in the `public_html/` (or `www/`, `httpdocs/`) directory. For maximum security and compliance with enterprise security standards:

- **Private Application Core (`educore_backend/`):** Placed **outside** and **above** `public_html/` in your user home root (`/home/username/educore_backend/`). This ensures that `.env` files, database credentials, source code, and internal cache cannot be accessed by public web scrapers.
- **Public Entry Point (`public_html/`):** Contains the compiled React 18 production bundle, public media assets, the Laravel API router bridge (`index.php`), and Apache routing engine (`.htaccess`).

```
/home/your_cpanel_username/
│
├── educore_backend/                    <-- PRIVATE (Uploaded one level above public_html)
│   ├── app/
│   ├── bootstrap/
│   │   └── cache/                      (Permissions: 775)
│   ├── config/
│   ├── database/
│   │   ├── educore_database.sql        (Full MySQL Schema & Seed Dump)
│   │   └── migrations/
│   ├── routes/
│   ├── storage/                        (Permissions: 775)
│   │   ├── app/public/
│   │   ├── framework/cache/data/
│   │   ├── framework/sessions/
│   │   ├── framework/views/
│   │   └── logs/
│   ├── vendor/                         (Complete Composer vendor pre-packaged)
│   ├── .env                            (Permissions: 600 - DB credentials & settings)
│   ├── artisan
│   └── set_permissions.sh              (One-click Linux permission hardener)
│
└── public_html/                        <-- PUBLIC (Mapped to https://yourdomain.com)
    ├── assets/                         (Compiled React 18 JS/CSS chunks)
    ├── index.html                      (React Single Page Application entry)
    ├── index.php                       (Laravel Bridge Router)
    ├── .htaccess                       (Apache URL Rewrite Engine)
    ├── robots.txt
    ├── check_educore.php               (Deployment verification diagnostic)
    └── [brand images & favicons]
```

---

## 2. Pre-Packaged Deployment Archives

All required files have been compiled, hardened, and placed in the directory `shared_hosting_ready/`:

| File / Folder | Destination on Server | Purpose |
| :--- | :--- | :--- |
| **`educore_backend.zip`** (or `educore_backend/`) | `/home/username/` | Private backend core (Laravel 11, dependencies, storage) |
| **`public_html.zip`** (or `public_html/`) | `/home/username/public_html/` | Public web assets (React SPA, bridge router, .htaccess) |
| **`educore_database.sql`** | phpMyAdmin Import | Complete database schema, roles, and initial administrator |

---

## 3. Step-by-Step Deployment Process

### Step 1: Create MySQL Database & User in cPanel
1. Log in to your **cPanel**.
2. Navigate to **Databases** &rarr; **MySQL® Database Wizard** (or **MySQL® Databases**).
3. **Step 1 - Create Database:** e.g., `educoredb` (Full name will look like `username_educoredb`). Click *Next Step*.
4. **Step 2 - Create Database User:** e.g., `educoreuser` (Full name will look like `username_educoreuser`).
   - Generate a strong password (copy and save this password). Click *Create User*.
5. **Step 3 - Assign Privileges:** Check the box **ALL PRIVILEGES** and click *Make Changes*.

---

### Step 2: Import the Database Schema
1. In cPanel, click **phpMyAdmin**.
2. In the left panel, select your newly created database (`username_educoredb`).
3. Click the **Import** tab in the top navigation.
4. Click **Choose File** and select `educore_database.sql` (found in `shared_hosting_ready/` or `educore_backend/database/`).
5. Ensure Character Set is `utf-8` and click **Go** (or **Import**) at the bottom.
6. Verify that all 25 tables are created successfully (e.g., `users`, `tenants`, `credentials`, `roles`, `permissions`, etc.).

---

### Step 3: Upload the Backend Core
1. In cPanel, open **File Manager**.
2. Make sure you are in your home root directory (`/home/username/`, the directory that contains `public_html/`, `etc/`, `mail/`).
3. Click **Upload** in the toolbar.
4. Upload `educore_backend.zip`.
5. Once uploaded, right-click `educore_backend.zip` and select **Extract**.
   - Destination path: `/home/username/`
   - This creates `/home/username/educore_backend/`.
6. Enter `educore_backend/`:
   - Locate `.env` (or copy `.env.example` to `.env`).
   - Right-click `.env` &rarr; **Edit**.
   - Update the following lines with your cPanel details:
     ```dotenv
     APP_NAME=EDUCORE
     APP_ENV=production
     APP_DEBUG=false
     APP_URL=https://yourdomain.com

     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=username_educoredb
     DB_USERNAME=username_educoreuser
     DB_PASSWORD=YourDatabasePasswordHere
     ```
   - Click **Save Changes**.

---

### Step 4: Upload the Public Frontend & Web Entry
1. In File Manager, enter your `public_html/` folder.
   - *(Optional: If `public_html` contains default placeholder files like `default.html` or `index.html`, remove or backup them).*
2. Click **Upload** and upload `public_html.zip`.
3. Right-click `public_html.zip` &rarr; **Extract** directly into `/home/username/public_html/`.
4. Ensure the `.htaccess` file is visible:
   - In File Manager, click **Settings** (top right) &rarr; Check **Show Hidden Files (dotfiles)** &rarr; Click **Save**.
   - Verify that `.htaccess`, `index.html`, `index.php`, and the `assets/` folder are inside `public_html/`.

---

### Step 5: Configure Permissions

Shared hosting web servers (Apache/LiteSpeed with suPHP/suExec or PHP-FPM) require strict permission standards:

| Path | Required Permission | Description |
| :--- | :---: | :--- |
| All Directories (`public_html/`, `educore_backend/`, etc.) | **755** (`drwxr-xr-x`) | Readable and executable by web service |
| All Files (`index.php`, `.htaccess`, `.js`, `.css`) | **644** (`-rw-r--r--`) | Readable by web service |
| `educore_backend/storage/` (recursive) | **775** (`drwxrwxr-x`) | Application write access for logs/cache |
| `educore_backend/bootstrap/cache/` (recursive) | **775** (`drwxrwxr-x`) | Application write access for config cache |
| `educore_backend/.env` | **600** (`-rw-------`) | Read/write strictly by your user account |

#### Automated Permission Hardener:
- **If you have cPanel Terminal / SSH access:**
  ```bash
  cd /home/$USER/educore_backend
  bash set_permissions.sh
  ```
- **If you do NOT have SSH access:**
  In cPanel File Manager:
  1. Right-click `educore_backend/storage` &rarr; **Change Permissions** &rarr; Set to **775**.
  2. Right-click `educore_backend/bootstrap/cache` &rarr; **Change Permissions** &rarr; Set to **775**.
  3. Right-click `educore_backend/.env` &rarr; **Change Permissions** &rarr; Set to **600**.

---

### Step 6: Test & Verify Live Deployment

1. Open your browser and navigate to:
   `https://yourdomain.com/check_educore.php`
2. This runs an automatic diagnostic checking:
   - PHP Version (&ge; 8.2)
   - Backend Directory connectivity
   - Storage write access
   - Database connection and table verification
3. If all checks show **OK** in green, your system is fully functional!
4. **Security Cleanup:** Return to cPanel File Manager and delete `public_html/check_educore.php`.

---

## 4. Default Production Credentials

The initial database seed pre-provisions the Platform Regulatory Officer:

| Role | Email | Default Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Platform Super Admin** | `root@educore.gov.ng` | `AdminPassword123!` | `https://yourdomain.com/admin` |

> [!IMPORTANT]
> Immediately log in to the Platform Governance portal at `https://yourdomain.com/admin`, navigate to Security Settings, and change the root administrator password.

---

## 5. Troubleshooting & FAQ

### Issue: 500 Internal Server Error
- **Cause 1:** Storage directory is not writable. Ensure `educore_backend/storage` has permission **775**.
- **Cause 2:** Missing PHP extensions. Ensure your cPanel **Select PHP Version** has the following extensions enabled:
  `pdo_mysql`, `openssl`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `curl`, `fileinfo`.
- **Cause 3:** Error in `.env` database password (special characters like `#` should be enclosed in quotes: `DB_PASSWORD="p#ssword"`).

### Issue: 401 Unauthorized on API requests
- **Cause:** Apache stripped the `Authorization` header.
- **Solution:** Verify that your `public_html/.htaccess` contains:
  ```apache
  RewriteCond %{HTTP:Authorization} .
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
  ```
  *(This is already included by default in our pre-packaged `.htaccess`).*

### Issue: Page Reloads give 404 (e.g. `/verify` or `/admin`)
- **Cause:** `.htaccess` is missing or `mod_rewrite` is not active.
- **Solution:** Make sure `.htaccess` is in `public_html/`. In cPanel File Manager, turn on "Show Hidden Files" to confirm `.htaccess` exists.
