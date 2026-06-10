<?php

// --- Allowed referers
$allowed_referers = [
    'https://rss.tuanphung.com',
    'http://localhost:3000',
];

$referer = $_SERVER['HTTP_REFERER'] ?? '';
$allowed = false;

foreach ($allowed_referers as $allowed_referer) {
    if (str_starts_with($referer, $allowed_referer)) {
        $allowed = true;
        break;
    }
}

if (!$allowed) {
    http_response_code(403);
    die('Forbidden');
}

// --- Get and validate the target URL
$url = $_GET['url'] ?? '';
if (empty($url)) {
    http_response_code(400);
    die('Missing ?url= parameter');
}

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    die('Invalid URL');
}

$scheme = parse_url($url, PHP_URL_SCHEME);
if (!in_array($scheme, ['http', 'https'])) {
    http_response_code(400);
    die('Invalid scheme');
}

// --- Fetch the remote URL
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 5,
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; CORSProxy/1.0)',
    CURLOPT_HEADER         => true,
]);

$response   = curl_exec($ch);
$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$body       = substr($response, $headerSize);
$rawHeaders = substr($response, 0, $headerSize);
curl_close($ch);

// --- Detect content-type from upstream
$contentType = 'application/octet-stream';
foreach (explode("\r\n", $rawHeaders) as $line) {
    if (stripos($line, 'Content-Type:') === 0) {
        $contentType = trim(substr($line, 13));
    }
}

// --- Send CORS + response headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header("Content-Type: $contentType");
http_response_code($httpCode);

echo $body;