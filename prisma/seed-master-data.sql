-- Seed Master Data
-- Insert Status Leads "Customer" jika belum ada

INSERT INTO "status_leads" (nama, "createdAt", "updatedAt")
SELECT 'Customer', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "status_leads" WHERE nama = 'Customer'
);

-- Verifikasi
SELECT * FROM "status_leads" ORDER BY id;
