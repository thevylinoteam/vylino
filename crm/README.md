# Vylino CRM

Lightweight CRM and operations hub for `crm.vylino.com`, designed to run reliably on PHP + MySQL shared/cloud hosting.

## Current scope
- Secure staff login
- Responsive dashboard
- Lead create/edit/search
- Sales stages
- Follow-up/task management
- Project data foundation
- JSON lead webhook endpoint
- CLI cron foundation for reminders
- PDO prepared statements, CSRF protection and secure session defaults

## Requirements
- PHP 8.1+
- PDO MySQL
- MySQL 5.7+ / MariaDB equivalent
- HTTPS

## Local / hosting setup
1. Point `crm.vylino.com` document root to `crm/public/`.
2. Create a MySQL database and user.
3. Import `crm/sql/schema.sql`.
4. Copy `crm/app/config.example.php` to `crm/app/config.php`.
5. Add database credentials and a long random webhook key.
6. From SSH/Terminal:
   `php crm/create_admin.php you@example.com "Admin Name"`
7. Delete `create_admin.php` from the production server after the initial admin is created.
8. Optional cron every 5–10 minutes:
   `php /FULL/PATH/TO/crm/public/cron.php`

## Lead webhook
POST JSON to:
`https://crm.vylino.com/api/lead-webhook.php`

Header:
`X-Vylino-Key: YOUR_SECRET_KEY`

Example:
```json
{
  "name": "Aarav Chauhan",
  "email": "client@example.com",
  "phone": "+91...",
  "company": "AAK Production",
  "source": "Hostinger Lead",
  "service": "SEO",
  "notes": "High-intent enquiry"
}
```

## Security
- Never commit `app/config.php`.
- Keep credentials outside the public web root.
- Use a unique database user and strong password.
- Rotate webhook secrets periodically.
- Enable hosting backups.
- Add rate limiting/WAF rules before exposing API integrations publicly.

## Development branch
Active CRM development is kept on `crm-development` until production-ready changes are reviewed.
