-- Database Setup untuk Lead Management System
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. Table untuk menyimpan data leads/prospek
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  position VARCHAR(255),
  source VARCHAR(100), -- dari mana lead ini berasal (website, referral, ads, etc)
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table untuk tracking aktivitas/interaksi dengan leads
CREATE TABLE lead_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL, -- call, email, meeting, note, etc
  title VARCHAR(255) NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table untuk user management (jika diperlukan)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- admin, manager, user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table untuk ads spend tracking
CREATE TABLE ads_spend (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(100) NOT NULL, -- Google Ads, Facebook, LinkedIn, etc
  campaign_name VARCHAR(255) NOT NULL,
  spend_amount DECIMAL(10,2) NOT NULL,
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes untuk performa yang lebih baik
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_ads_spend_date ON ads_spend(spend_date);

-- 6. RLS (Row Level Security) - Opsional
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ads_spend ENABLE ROW LEVEL SECURITY;

-- 7. Sample data untuk testing
INSERT INTO leads (name, email, phone, company, position, source, status, notes) VALUES
('John Doe', 'john.doe@example.com', '+6281234567890', 'PT ABC', 'Marketing Manager', 'website', 'new', 'Interested in our services'),
('Jane Smith', 'jane.smith@example.com', '+6289876543210', 'CV XYZ', 'CEO', 'referral', 'contacted', 'Follow up in 3 days'),
('Bob Wilson', 'bob.wilson@example.com', '+6285555666777', 'UD Maju', 'Owner', 'ads', 'qualified', 'Ready for demo');

INSERT INTO lead_activities (lead_id, activity_type, title, description) 
SELECT id, 'note', 'Initial Contact', 'Lead created from website form' 
FROM leads WHERE email = 'john.doe@example.com';

INSERT INTO ads_spend (platform, campaign_name, spend_amount, leads_generated, conversions, spend_date) VALUES
('Google Ads', 'Lead Generation Campaign Q4', 2500000.00, 15, 3, CURRENT_DATE - INTERVAL '1 day'),
('Facebook Ads', 'Brand Awareness Campaign', 1800000.00, 8, 1, CURRENT_DATE - INTERVAL '2 days'),
('LinkedIn Ads', 'B2B Lead Generation', 3200000.00, 12, 4, CURRENT_DATE - INTERVAL '3 days');