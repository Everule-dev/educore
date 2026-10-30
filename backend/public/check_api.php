<?php
/**
 * EDUCORE Subdomain API Diagnostic
 * Access via: https://api.yourdomain.com/check_api.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$response = [
    'status' => 'ONLINE',
    'service' => 'EDUCORE Universal Ledger API',
    'php_version' => PHP_VERSION,
    'php_compatible' => version_compare(PHP_VERSION, '8.2.0', '>='),
    'storage_writable' => is_writable(__DIR__ . '/../storage'),
    'cache_writable' => is_writable(__DIR__ . '/../bootstrap/cache'),
    'env_exists' => file_exists(__DIR__ . '/../.env'),
];

try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $pdo = Illuminate\Support\Facades\DB::connection()->getPdo();
    $response['database_connected'] = true;
    $response['database_name'] = Illuminate\Support\Facades\DB::connection()->getDatabaseName();
} catch (Throwable $e) {
    $response['database_connected'] = false;
    $response['database_error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
