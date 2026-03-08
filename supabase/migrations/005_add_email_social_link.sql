-- Add email social link
INSERT INTO social_links (platform, name, url, icon_url, sort_order) VALUES
('email', 'Email', 'https://mail.google.com/mail/?view=cm&to=ugmanjem@gmail.com', '/images/logo-email.svg', 3)
ON CONFLICT (platform) DO NOTHING;
