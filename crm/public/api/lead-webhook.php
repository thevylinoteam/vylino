<?php
require __DIR__ . '/../../app/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$key = $_SERVER['HTTP_X_VYLINO_KEY'] ?? '';
$expected = (string)($config['app']['webhook_key'] ?? '');

if ($expected === '' || $expected === 'CHANGE_TO_A_LONG_RANDOM_SECRET' || !$key || !hash_equals($expected, (string)$key)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$name = trim((string)($payload['name'] ?? ''));
$email = trim((string)($payload['email'] ?? ''));
$phone = trim((string)($payload['phone'] ?? ''));

if ($name === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'name is required']);
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'invalid email']);
    exit;
}

$st = $pdo->prepare(
    'INSERT INTO leads(name,email,phone,company,source,service,status,notes,created_by)
     VALUES(?,?,?,?,?,?,"New",?,NULL)'
);
$st->execute([
    $name,
    $email,
    $phone,
    trim((string)($payload['company'] ?? '')),
    trim((string)($payload['source'] ?? 'Webhook')),
    trim((string)($payload['service'] ?? '')),
    trim((string)($payload['notes'] ?? '')),
]);

http_response_code(201);
echo json_encode(['ok' => true, 'lead_id' => (int)$pdo->lastInsertId()]);
