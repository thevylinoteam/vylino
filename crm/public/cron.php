<?php
require __DIR__ . '/../app/bootstrap.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

$now = date('Y-m-d H:i:s');

$st = $pdo->prepare(
    'SELECT t.id,t.title,t.due_at,l.name lead_name,l.email,l.phone
     FROM tasks t
     LEFT JOIN leads l ON l.id=t.lead_id
     WHERE t.status="Open"
       AND t.due_at IS NOT NULL
       AND t.due_at <= ?
       AND t.reminder_sent_at IS NULL
     ORDER BY t.due_at ASC
     LIMIT 100'
);
$st->execute([$now]);
$items = $st->fetchAll();

foreach ($items as $item) {
    // Provider adapters for email/WhatsApp will be attached here.
    $u = $pdo->prepare('UPDATE tasks SET reminder_sent_at=NOW() WHERE id=?');
    $u->execute([$item['id']]);

    echo sprintf(
        "Reminder queued: #%d %s (%s)\n",
        $item['id'],
        $item['title'],
        $item['lead_name'] ?? 'No lead'
    );
}
