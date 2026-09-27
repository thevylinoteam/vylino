CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(50) NULL,
  company VARCHAR(190) NULL,
  source VARCHAR(100) NULL,
  service VARCHAR(190) NULL,
  status ENUM('New','Contacted','Qualified','Proposal Sent','Negotiation','Won','Lost') NOT NULL DEFAULT 'New',
  notes TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_status(status),
  INDEX idx_leads_email(email),
  INDEX idx_leads_phone(phone),
  CONSTRAINT fk_leads_user FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  lead_id INT UNSIGNED NULL,
  due_at DATETIME NULL,
  priority ENUM('Low','Normal','High') NOT NULL DEFAULT 'Normal',
  status ENUM('Open','Done','Cancelled') NOT NULL DEFAULT 'Open',
  created_by INT UNSIGNED NULL,
  reminder_sent_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tasks_due(status,due_at),
  CONSTRAINT fk_tasks_lead FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_user FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id INT UNSIGNED NULL,
  name VARCHAR(190) NOT NULL,
  status ENUM('Planning','In Progress','Waiting','Review','Completed','Cancelled') NOT NULL DEFAULT 'Planning',
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_lead FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
