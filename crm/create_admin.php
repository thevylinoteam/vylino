<?php
if (PHP_SAPI !== 'cli') {
    exit("Run from SSH/CLI only.\n");
}

require __DIR__ . '/app/bootstrap.php';

$email = trim((string)($argv[1] ?? ''));
$name = trim((string)($argv[2] ?? 'Administrator'));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    exit("Usage: php create_admin.php admin@example.com \"Admin Name\"\n");
}

echo "Password: ";
$password = trim((string)fgets(STDIN));

if (strlen($password) < 10) {
    exit("Use at least 10 characters.\n");
}

$st = $pdo->prepare(
    'INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,"admin")'
);
$st->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);

echo "Admin created. Delete create_admin.php from production after use.\n";
