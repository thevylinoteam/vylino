<?php
require __DIR__ . '/../app/bootstrap.php';

$page = $_GET['page'] ?? (logged_in() ? 'dashboard' : 'login');

if ($page === 'logout') {
    session_destroy();
    redirect('/?page=login');
}

if ($page === 'login') {
    if (logged_in()) {
        redirect('/');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        verify_csrf();

        $email = trim((string)($_POST['email'] ?? ''));
        $password = (string)($_POST['password'] ?? '');

        $st = $pdo->prepare(
            'SELECT id,name,email,password_hash FROM users WHERE email=? AND active=1 LIMIT 1'
        );
        $st->execute([$email]);
        $user = $st->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['user_name'] = $user['name'];
            redirect('/');
        }

        flash('error', 'Invalid email or password.');
    }

    $flash = take_flash();
    ?>
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Vylino CRM Login</title>
        <link rel="stylesheet" href="/assets/style.css">
    </head>
    <body>
    <div class="login-wrap">
        <div class="login card">
            <div class="brand" style="color:#172033">Vylino <span>CRM</span></div>
            <p class="muted">Sign in to manage leads, follow-ups and projects.</p>
            <?php if ($flash): ?>
                <div class="flash <?= $flash[0] === 'error' ? 'error' : '' ?>"><?= e($flash[1]) ?></div>
            <?php endif; ?>
            <form method="post">
                <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                <div class="field">
                    <label>Email</label>
                    <input class="input" type="email" name="email" required autocomplete="email">
                </div>
                <br>
                <div class="field">
                    <label>Password</label>
                    <input class="input" type="password" name="password" required autocomplete="current-password">
                </div>
                <br>
                <button class="btn" style="width:100%">Sign in</button>
            </form>
        </div>
    </div>
    </body>
    </html>
    <?php
    exit;
}

require_login();

$leadStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
$taskPriorities = ['Normal', 'High', 'Low'];

if ($page === 'save_lead' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $id = (int)($_POST['id'] ?? 0);
    $name = trim((string)($_POST['name'] ?? ''));
    $email = trim((string)($_POST['email'] ?? ''));
    $phone = trim((string)($_POST['phone'] ?? ''));
    $company = trim((string)($_POST['company'] ?? ''));
    $source = trim((string)($_POST['source'] ?? 'Manual'));
    $service = trim((string)($_POST['service'] ?? ''));
    $status = trim((string)($_POST['status'] ?? 'New'));
    $notes = trim((string)($_POST['notes'] ?? ''));

    if ($name === '') {
        flash('error', 'Lead name is required.');
        redirect('/?page=leads');
    }

    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        flash('error', 'Please enter a valid email address.');
        redirect('/?page=leads');
    }

    if (!in_array($status, $leadStatuses, true)) {
        $status = 'New';
    }

    if ($id > 0) {
        $st = $pdo->prepare(
            'UPDATE leads
             SET name=?,email=?,phone=?,company=?,source=?,service=?,status=?,notes=?,updated_at=NOW()
             WHERE id=?'
        );
        $st->execute([$name, $email, $phone, $company, $source, $service, $status, $notes, $id]);
    } else {
        $st = $pdo->prepare(
            'INSERT INTO leads(name,email,phone,company,source,service,status,notes,created_by)
             VALUES(?,?,?,?,?,?,?,?,?)'
        );
        $st->execute([
            $name,
            $email,
            $phone,
            $company,
            $source,
            $service,
            $status,
            $notes,
            $_SESSION['user_id'],
        ]);
    }

    flash('ok', 'Lead saved.');
    redirect('/?page=leads');
}

if ($page === 'save_task' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $title = trim((string)($_POST['title'] ?? ''));
    $due = ($_POST['due_at'] ?? '') ?: null;
    $lead = (int)($_POST['lead_id'] ?? 0);
    $priority = trim((string)($_POST['priority'] ?? 'Normal'));

    if (!in_array($priority, $taskPriorities, true)) {
        $priority = 'Normal';
    }

    if ($title !== '') {
        $st = $pdo->prepare(
            'INSERT INTO tasks(title,lead_id,due_at,priority,status,created_by)
             VALUES(?,?,?,?,"Open",?)'
        );
        $st->execute([
            $title,
            $lead ?: null,
            $due,
            $priority,
            $_SESSION['user_id'],
        ]);
        flash('ok', 'Follow-up added.');
    }

    redirect('/?page=tasks');
}

if ($page === 'complete_task' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $id = (int)($_POST['id'] ?? 0);
    $st = $pdo->prepare('UPDATE tasks SET status="Done",completed_at=NOW() WHERE id=?');
    $st->execute([$id]);

    flash('ok', 'Follow-up completed.');
    redirect('/?page=tasks');
}

function layout_start(string $title, string $active): void
{
    $flash = take_flash();
    ?>
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title><?= e($title) ?> — Vylino CRM</title>
        <link rel="stylesheet" href="/assets/style.css">
    </head>
    <body>
    <div class="app">
        <aside class="sidebar">
            <div class="brand">Vylino <span>CRM</span></div>
            <nav class="nav">
                <?php foreach ([
                    'dashboard' => 'Dashboard',
                    'leads' => 'Leads',
                    'tasks' => 'Follow-ups',
                    'projects' => 'Projects',
                ] as $key => $label): ?>
                    <a class="<?= $active === $key ? 'active' : '' ?>" href="/?page=<?= $key ?>">
                        <?= e($label) ?>
                    </a>
                <?php endforeach; ?>
                <a href="/?page=logout">Logout</a>
            </nav>
        </aside>
        <main class="main">
            <div class="topbar">
                <div>
                    <strong><?= e($title) ?></strong>
                    <div class="muted">Welcome, <?= e($_SESSION['user_name'] ?? 'User') ?></div>
                </div>
            </div>
            <?php if ($flash): ?>
                <div class="flash <?= $flash[0] === 'error' ? 'error' : '' ?>"><?= e($flash[1]) ?></div>
            <?php endif;
}

function layout_end(): void
{
    echo '</main></div></body></html>';
}

if ($page === 'dashboard') {
    $counts = [];
    foreach ([
        'leads' => 'SELECT COUNT(*) FROM leads',
        'new' => 'SELECT COUNT(*) FROM leads WHERE status="New"',
        'tasks' => 'SELECT COUNT(*) FROM tasks WHERE status="Open"',
        'projects' => 'SELECT COUNT(*) FROM projects WHERE status NOT IN ("Completed","Cancelled")',
    ] as $key => $query) {
        $counts[$key] = (int)$pdo->query($query)->fetchColumn();
    }

    $recent = $pdo->query(
        'SELECT id,name,company,service,status,created_at
         FROM leads
         ORDER BY id DESC
         LIMIT 8'
    )->fetchAll();

    layout_start('Dashboard', 'dashboard');
    ?>
    <div class="grid">
        <div class="card stat"><strong><?= $counts['leads'] ?></strong><span>Total leads</span></div>
        <div class="card stat"><strong><?= $counts['new'] ?></strong><span>New leads</span></div>
        <div class="card stat"><strong><?= $counts['tasks'] ?></strong><span>Open follow-ups</span></div>
        <div class="card stat"><strong><?= $counts['projects'] ?></strong><span>Active projects</span></div>
    </div>
    <br>
    <div class="card">
        <div class="page-head">
            <h3 style="margin:0">Recent leads</h3>
            <a class="btn" href="/?page=leads">Manage leads</a>
        </div>
        <div class="table-wrap">
            <table class="table">
                <tr><th>Name</th><th>Company</th><th>Service</th><th>Status</th><th>Added</th></tr>
                <?php foreach ($recent as $row): ?>
                    <tr>
                        <td><?= e($row['name']) ?></td>
                        <td><?= e($row['company']) ?></td>
                        <td><?= e($row['service']) ?></td>
                        <td><span class="badge"><?= e($row['status']) ?></span></td>
                        <td><?= e($row['created_at']) ?></td>
                    </tr>
                <?php endforeach; ?>
            </table>
        </div>
    </div>
    <?php
    layout_end();
    exit;
}

if ($page === 'leads') {
    $q = trim((string)($_GET['q'] ?? ''));

    if ($q !== '') {
        $st = $pdo->prepare(
            'SELECT * FROM leads
             WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?
             ORDER BY id DESC'
        );
        $like = "%{$q}%";
        $st->execute([$like, $like, $like, $like]);
        $leads = $st->fetchAll();
    } else {
        $leads = $pdo->query('SELECT * FROM leads ORDER BY id DESC LIMIT 200')->fetchAll();
    }

    $edit = null;
    if (isset($_GET['edit'])) {
        $st = $pdo->prepare('SELECT * FROM leads WHERE id=?');
        $st->execute([(int)$_GET['edit']]);
        $edit = $st->fetch();
    }

    layout_start('Leads', 'leads');
    ?>
    <div class="page-head">
        <form method="get" style="display:flex;gap:8px">
            <input type="hidden" name="page" value="leads">
            <input class="input" name="q" placeholder="Search leads" value="<?= e($q) ?>">
            <button class="btn secondary">Search</button>
        </form>
    </div>

    <div class="card">
        <h3><?= $edit ? 'Edit lead' : 'Add lead' ?></h3>
        <form method="post" action="/?page=save_lead">
            <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
            <input type="hidden" name="id" value="<?= e((string)($edit['id'] ?? '')) ?>">

            <div class="form-grid">
                <?php foreach ([
                    ['name', 'Name *'],
                    ['email', 'Email'],
                    ['phone', 'Phone / WhatsApp'],
                    ['company', 'Company'],
                    ['source', 'Source'],
                    ['service', 'Interested service'],
                ] as [$name, $label]): ?>
                    <div class="field">
                        <label><?= e($label) ?></label>
                        <input
                            class="input"
                            name="<?= e($name) ?>"
                            value="<?= e($edit[$name] ?? '') ?>"
                            <?= $name === 'name' ? 'required' : '' ?>
                        >
                    </div>
                <?php endforeach; ?>

                <div class="field">
                    <label>Status</label>
                    <select class="select" name="status">
                        <?php foreach ($leadStatuses as $status): ?>
                            <option <?= ($edit['status'] ?? 'New') === $status ? 'selected' : '' ?>>
                                <?= e($status) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div></div>
            </div>

            <br>
            <div class="field">
                <label>Notes</label>
                <textarea class="textarea" name="notes"><?= e($edit['notes'] ?? '') ?></textarea>
            </div>
            <br>
            <button class="btn">Save lead</button>
        </form>
    </div>

    <br>

    <div class="card table-wrap">
        <table class="table">
            <tr><th>Lead</th><th>Contact</th><th>Service</th><th>Source</th><th>Status</th><th></th></tr>
            <?php foreach ($leads as $lead): ?>
                <tr>
                    <td>
                        <strong><?= e($lead['name']) ?></strong><br>
                        <span class="muted"><?= e($lead['company']) ?></span>
                    </td>
                    <td><?= e($lead['phone']) ?><br><?= e($lead['email']) ?></td>
                    <td><?= e($lead['service']) ?></td>
                    <td><?= e($lead['source']) ?></td>
                    <td><span class="badge"><?= e($lead['status']) ?></span></td>
                    <td><a class="btn secondary" href="/?page=leads&edit=<?= (int)$lead['id'] ?>">Edit</a></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>
    <?php
    layout_end();
    exit;
}

if ($page === 'tasks') {
    $tasks = $pdo->query(
        'SELECT t.*,l.name lead_name
         FROM tasks t
         LEFT JOIN leads l ON l.id=t.lead_id
         ORDER BY (t.status="Open") DESC, t.due_at IS NULL, t.due_at ASC, t.id DESC'
    )->fetchAll();

    $leads = $pdo->query('SELECT id,name FROM leads ORDER BY name LIMIT 300')->fetchAll();

    layout_start('Follow-ups', 'tasks');
    ?>
    <div class="card">
        <h3>Add follow-up</h3>
        <form method="post" action="/?page=save_task">
            <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
            <div class="form-grid">
                <div class="field">
                    <label>Task</label>
                    <input class="input" name="title" required placeholder="Call client / send proposal">
                </div>
                <div class="field">
                    <label>Lead</label>
                    <select class="select" name="lead_id">
                        <option value="0">No lead</option>
                        <?php foreach ($leads as $lead): ?>
                            <option value="<?= (int)$lead['id'] ?>"><?= e($lead['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="field">
                    <label>Due date/time</label>
                    <input class="input" type="datetime-local" name="due_at">
                </div>
                <div class="field">
                    <label>Priority</label>
                    <select class="select" name="priority">
                        <?php foreach ($taskPriorities as $priority): ?>
                            <option><?= e($priority) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <br>
            <button class="btn">Add follow-up</button>
        </form>
    </div>

    <br>

    <div class="card table-wrap">
        <table class="table">
            <tr><th>Task</th><th>Lead</th><th>Due</th><th>Priority</th><th>Status</th><th></th></tr>
            <?php foreach ($tasks as $task): ?>
                <tr>
                    <td><?= e($task['title']) ?></td>
                    <td><?= e($task['lead_name']) ?></td>
                    <td><?= e($task['due_at']) ?></td>
                    <td><?= e($task['priority']) ?></td>
                    <td><span class="badge"><?= e($task['status']) ?></span></td>
                    <td>
                        <?php if ($task['status'] === 'Open'): ?>
                            <form method="post" action="/?page=complete_task">
                                <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                                <input type="hidden" name="id" value="<?= (int)$task['id'] ?>">
                                <button class="btn secondary">Done</button>
                            </form>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>
    <?php
    layout_end();
    exit;
}

if ($page === 'projects') {
    $projects = $pdo->query(
        'SELECT p.*,l.name lead_name
         FROM projects p
         LEFT JOIN leads l ON l.id=p.lead_id
         ORDER BY p.id DESC'
    )->fetchAll();

    layout_start('Projects', 'projects');
    ?>
    <div class="card">
        <div class="page-head">
            <div>
                <h3 style="margin:0">Projects foundation</h3>
                <p class="muted">Lead conversion and project workflow are planned for Phase 2.</p>
            </div>
        </div>
        <div class="table-wrap">
            <table class="table">
                <tr><th>Project</th><th>Client</th><th>Status</th><th>Value</th><th>Deadline</th></tr>
                <?php foreach ($projects as $project): ?>
                    <tr>
                        <td><?= e($project['name']) ?></td>
                        <td><?= e($project['lead_name']) ?></td>
                        <td><span class="badge"><?= e($project['status']) ?></span></td>
                        <td>₹<?= e(number_format((float)$project['value'], 0)) ?></td>
                        <td><?= e($project['deadline']) ?></td>
                    </tr>
                <?php endforeach; ?>
            </table>
        </div>
    </div>
    <?php
    layout_end();
    exit;
}

http_response_code(404);
echo 'Not found';
