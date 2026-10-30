# EDUCORE - Shared Hosting Deployment Guide: Domain Root Frontend + Subdomain Backend

This production guide details the exact process for hosting the **EDUCORE** system on shared hosting (cPanel / Apache / LiteSpeed / DirectAdmin) using:
- **Frontend (React 18 SPA):** Hosted on the **Primary Domain Root** (e.g., `https://yourdomain.com` pointing to `public_html/`).
- **Backend (Laravel 11 API):** Hosted on a dedicated **Subdomain** (e.g., `https://api.yourdomain.com` with Document Root pointing to `/home/username/educore_backend/public`).

---

## 1. Hosting Architecture Map

```
/home/your_cpanel_username/
│
├── educore_backend/                         <-- PRIVATE BACKEND (Above public_html)
│   ├── app/
│   ├── bootstrap/
│   │   └── cache/                           (Permissions: 775)
│   ├── config/                              (Includes cors.php for cross-subdomain access)
│   ├── database/
│   │   ├── educore_database.sql             (MySQL Dump with Super Admin tredzroyale@gmail.com)
│   │   └── migrations/
│   ├── public/                              <-- SUBDOMAIN DOCUMENT ROOT (api.yourdomain.com)
│   │   ├── index.php                        (Subdomain front controller)
│   │   ├── .htaccess                        (Apache rewrite & CORS headers)
│   │   ├── check_api.php                    (Subdomain diagnostic healthcheck)
│   │   └── robots.txt
│   ├── routes/
│   ├── storage/                             (Permissions: 775)
│   │   ├── app/public/
│   │   ├── framework/cache/data/
│   │   ├── framework/sessions/
│   │   ├── framework/views/
│   │   └── logs/
│   ├── vendor/                              (Pre-packaged Composer dependencies)
│   ├── .env                                 (Permissions: 600 - DB credentials & settings)
│   ├── artisan
│   └── set_permissions.sh                   (One-click Linux permission hardener)
│
└── public_html/                             <-- PRIMARY DOMAIN ROOT (https://yourdomain.com)
    ├── assets/                              (Compiled React 18 JS/CSS chunks)
    ├── env-config.js                        <-- Subdomain API endpoint configuration
    ├── index.html                           (Compiled React Single Page Application)
    ├── .htaccess                            (SPA client-side routing & compression)
    ├── robots.txt
    └── [brand images & favicons]
```

---

## 2. Pre-Packaged Deployment Archives

All required files are prepared in the local directory `shared_hosting_ready/`:

| Package Archive | Destination on Server | Document Root in cPanel | Purpose |
| :--- | :--- | :--- | :--- |
| **`educore_backend.zip`** | `/home/username/` | `educore_backend/public` | Subdomain Laravel API (`https://api.yourdomain.com`) |
| **`public_html.zip`** | `/home/username/public_html/` | `public_html` | Domain Root React Frontend (`https://yourdomain.com`) |
| **`educore_database.sql`** | phpMyAdmin Import | N/A | Complete MySQL schema & initial Platform Super Admin |

---

## 3. Step-by-Step Deployment Walkthrough

### Step 1: Create the Subdomain in cPanel
1. In cPanel, navigate to **Domains** &rarr; **Subdomains** (or **Domains**).
2. Enter your subdomain name:
   - **Subdomain:** `api`
   - **Domain:** select your primary domain (`yourdomain.com`)
3. **CRITICAL - Document Root:**
   - Change the default Document Root to:
     `educore_backend/public`
     *(Full path on disk: `/home/username/educore_backend/public`)*.
4. Click **Create**.

---

### Step 2: Create MySQL Database & User in cPanel
1. In cPanel, open **MySQL® Database Wizard**.
2. **Step 1 - Database Name:** e.g., `educoredb` &rarr; becomes `username_educoredb`. Click *Next Step*.
3. **Step 2 - Database User:** e.g., `educoreuser` &rarr; becomes `username_educoreuser`.
   - Enter/generate a strong password and save it securely. Click *Create User*.
4. **Step 3 - Privileges:** Check **ALL PRIVILEGES** and click *Make Changes*.

---

### Step 3: Import the Database Schema
1. In cPanel, open **phpMyAdmin**.
2. Select your newly created database (`username_educoredb`) in the left sidebar.
3. Click the **Import** tab at the top.
4. Click **Choose File** and select `educore_database.sql` (found in `shared_hosting_ready/` or `educore_backend/database/`).
5. Click **Go** (or **Import**).
6. Verify that all 25 tables are created.

---

### Step 4: Upload & Configure the Backend (`educore_backend.zip`)
1. In cPanel, open **File Manager**.
2. Go to your home root directory (`/home/username/`, one level above `public_html`).
3. Click **Upload** &rarr; Upload `educore_backend.zip`.
4. Right-click `educore_backend.zip` &rarr; **Extract** &rarr; confirm destination `/home/username/`.
   - This creates `/home/username/educore_backend/` with its own `public/` directory inside!
5. Enter `educore_backend/`:
   - Right-click `.env` &rarr; **Edit**.
   - Update with your live subdomain and database credentials:
     ```dotenv
     APP_NAME=EDUCORE
     APP_ENV=production
     APP_DEBUG=false
     APP_URL=https://api.yourdomain.com

     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=username_educoredb
     DB_USERNAME=username_educoreuser
     DB_PASSWORD=YourDatabasePasswordHere
     ```
   - Click **Save Changes**.

---

### Step 5: Upload the Frontend Dist (`public_html.zip`)
1. In File Manager, enter your `public_html/` folder.
   - *(Optional: Remove any default placeholder files like `default.html` or existing `index.html`).*
2. Click **Upload** &rarr; Upload `public_html.zip`.
3. Right-click `public_html.zip` &rarr; **Extract** directly into `public_html/`.
4. **Configure your API Subdomain in `env-config.js`:**
   - Locate `env-config.js` inside `public_html/`.
   - Right-click `env-config.js` &rarr; **Edit**.
   - Set line 9 to your backend subdomain:
     ```javascript
     window.__EDUCORE_API_URL__ = "https://api.yourdomain.com/api/v1";
     ```
   - Click **Save Changes**.
5. Enable hidden dotfiles:
   - In File Manager top right, click **Settings** &rarr; Check **Show Hidden Files (dotfiles)** &rarr; Click **Save**.
   - Confirm that `.htaccess` is present in `public_html/`.

---

### Step 6: Set Directory & File Permissions

| Target Path | Permission | How to Set |
| :--- | :---: | :--- |
| All Directories (`public_html/`, `educore_backend/`) | **`755`** (`drwxr-xr-x`) | Standard cPanel directory default |
| All Files (`.htaccess`, `.js`, `.css`, `index.php`) | **`644`** (`-rw-r--r--`) | Standard cPanel file default |
| `educore_backend/storage/` (recursive) | **`775`** (`drwxrwxr-x`) | Right-click in File Manager &rarr; Change Permissions |
| `educore_backend/bootstrap/cache/` | **`775`** (`drwxrwxr-x`) | Right-click in File Manager &rarr; Change Permissions |
| `educore_backend/.env` | **`600`** (`-rw-------`) | Right-click in File Manager &rarr; Change Permissions |

*(If you have SSH or cPanel Terminal access, you can simply run: `cd /home/$USER/educore_backend && bash set_permissions.sh`)*.

---

### Step 7: Verify Live System

1. **Verify Backend Subdomain:**
   Open: `https://api.yourdomain.com/check_api.php` (or `https://api.yourdomain.com/up`)
   - It will return a JSON response confirming:
     ```json
     {
         "status": "ONLINE",
         "service": "EDUCORE Universal Ledger API",
         "php_compatible": true,
         "storage_writable": true,
         "database_connected": true
     }
     ```
2. **Verify Frontend Application:**
   Open: `https://yourdomain.com/`
   - Test navigation: verify that the home page, `/verify`, and `/admin` portals load cleanly without 404 errors.
3. **Log in as Platform Super Admin:**
   - Navigate to: `https://yourdomain.com/admin` (or `https://yourdomain.com/#/admin`)
   - Enter your configured credentials:
     - **Email:** `tredzroyale@gmail.com`
     - **Password:** `TredzEducore2026`
   - You will be immediately welcomed into the Platform Super Admin Governance Dashboard!

---

## 4. Initial Platform Super Admin Credentials

| Parameter | Value |
| :--- | :--- |
| **Portal URL** | `https://yourdomain.com/admin` |
| **Email** | `tredzroyale@gmail.com` |
| **Password** | `TredzEducore2026` |
| **Authority Scope** | Platform Super Administrator (Governance, Accreditation, Cross-Tenant Ledger) |

---

## 5. Troubleshooting & FAQ

### CORS Error in Browser Console (`Access to fetch at ... has been blocked by CORS policy`)
- **Fix:** Both `backend/config/cors.php` and `educore_backend/public/.htaccess` include wildcards (`*`) for cross-subdomain access. Ensure your subdomain `.htaccess` is uploaded inside `educore_backend/public/`.

### 500 Internal Server Error on Subdomain
- **Check 1:** Check that `educore_backend/storage/` has permission `775`.
- **Check 2:** In cPanel **Select PHP Version**, ensure PHP is &ge; 8.2 and the following extensions are checked: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `bcmath`, `fileinfo`.

### Page Refresh on Frontend gives 404
- **Fix:** Ensure `.htaccess` exists in `public_html/`. In cPanel File Manager, check "Show Hidden Files" to confirm.
