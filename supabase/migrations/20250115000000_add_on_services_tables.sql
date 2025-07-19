-- Create add_on_services table
CREATE TABLE IF NOT EXISTS add_on_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Support', 'Analytics', 'Domain', 'Integration', 'Mobile', 'Security')),
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Unavailable')),
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_service_requests table
CREATE TABLE IF NOT EXISTS client_service_requests (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES add_on_services(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    rejected_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_add_on_services_category ON add_on_services(category);
CREATE INDEX IF NOT EXISTS idx_add_on_services_status ON add_on_services(status);
CREATE INDEX IF NOT EXISTS idx_client_service_requests_client_id ON client_service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_service_requests_service_id ON client_service_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_client_service_requests_status ON client_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_service_requests_request_date ON client_service_requests(request_date);

-- Insert sample add-on services data
INSERT INTO add_on_services (name, description, category, price, status, features) VALUES
('Premium Support', '24/7 priority support with dedicated account manager', 'Support', 299.00, 'Available', '["24/7 Support", "Dedicated Account Manager", "Priority Response", "Phone Support", "Email Support"]'),
('Advanced Analytics', 'Detailed reporting and analytics dashboard', 'Analytics', 199.00, 'Available', '["Custom Reports", "Real-time Analytics", "Data Export", "Performance Metrics", "User Behavior Tracking"]'),
('Custom Domain', 'Use your own domain name with SSL certificate', 'Domain', 99.00, 'Available', '["Custom Domain", "SSL Certificate", "DNS Management", "Domain Transfer", "Email Setup"]'),
('API Integration', 'Connect with third-party services via API', 'Integration', 399.00, 'Available', '["API Access", "Webhook Support", "Third-party Integration", "Custom Endpoints", "Documentation"]'),
('Mobile App', 'Native mobile application for iOS and Android', 'Mobile', 999.00, 'Unavailable', '["iOS App", "Android App", "Push Notifications", "Offline Support", "App Store Publishing"]'),
('Advanced Security', 'Enhanced security features and monitoring', 'Security', 149.00, 'Available', '["Two-Factor Authentication", "Security Monitoring", "Backup Encryption", "Access Control", "Audit Logs"]');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_add_on_services_updated_at BEFORE UPDATE ON add_on_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_service_requests_updated_at BEFORE UPDATE ON client_service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 