-- ============================================
-- Seed Data - Migrasi dari /data/*.ts
-- Run this AFTER 001_initial_schema.sql
-- ============================================

-- Service Tabs
INSERT INTO service_tabs (tab_id, name, sort_order) VALUES
('all', 'All', 0),
('anjem', 'Anjem', 1),
('jastip', 'Jastip', 2),
('survei', 'Survei Kost', 3),
('berkas', 'Urus Berkas', 4)
ON CONFLICT (tab_id) DO NOTHING;

-- Services
INSERT INTO services (title, image_url, rating, trips, price, category, sort_order) VALUES
('Antar Jemput', '/images/service-anjem.jpg', 5, '2.500+', 'RP 5K', 'anjem', 0),
('Jasa Titip', '/images/service-jastip.jpg', 5, '350+', 'RP 6k', 'jastip', 1),
('Survei Kost', '/images/service-survei.jpg', 5, '50+', 'RP 15k', 'survei', 2),
('Urus Berkas Kampus', '/images/service-berkas.jpg', 5, '100+', 'RP 15k', 'berkas', 3);

-- Service Descriptions
INSERT INTO service_descriptions (slug, description) VALUES
('antar-jemput', 'Butuh dianter atau dijemput ke kampus? Kamu bisa pesan driver buat antar sampai tujuan kok!'),
('jastip', 'Mager keluar tapi pengen sesuatu? Kamu bisa titip driver buat beliin lhoo!')
ON CONFLICT (slug) DO NOTHING;

-- Reviews
INSERT INTO reviews (name, affiliation, review_text, rating, avatar_url, bg_image_url, sort_order) VALUES
('Arumi', 'Mahasiswa GEOGRAFI 25', 'anjem udh kaya ibarat kebutuhan pokok buat aku yg gapunya kendaraan pribadi. anjem ke kampus bisa, jastip juga bisa. big thanks buat orang yang nyiptain per-anjem-an inii', 5, '/images/pp-woman.png', '/images/review1.png', 0),
('Nisrina', 'Mahasiswa SV 23', 'Anjem udah kayak daily use buat aku yang gaada kendaraan di Jogja, good job buat Anjem UGM', 5, '/images/pp-woman.png', '/images/review2.png', 1),
('Rakha', 'Mahasiswa Fisipol 24 (Mitra Driver)', 'Makasih banyak udah kasih ruang buat nambah penghasilan lewat sini, jujur ngebantu banget buat sehari-hari.', 5, '/images/pp-man.png', '/images/review3.png', 2);

-- Stats
INSERT INTO stats (key, value, label, sort_order) VALUES
('driver_active', '20', 'Driver Active', 0),
('wa_group', '3', 'WA Group', 1),
('order_complete', '3000+', 'Order Complete', 2),
('members_group', '2000+', 'Members Group', 3)
ON CONFLICT (key) DO NOTHING;

-- Features
INSERT INTO features (title, description, sort_order) VALUES
('Driver Mahasiswa', 'Driver kami 100% mahasiswa UGM, jadi lebih paham wilayah dalam kampus, bonus dapet relasi deh..', 0),
('Aman, Satset, Fleksibel', 'Tinggal chat grup, kami bisa bantuin segala kebutuhanmu, penolong banget buat anak perantauan.', 1),
('Terjangkau & Mudah Diakses', 'Bantu kamu lebih irit di perantauan dengan tarif yang terjangkau.', 2);

-- Tutorial Steps
INSERT INTO tutorial_steps (step_number, title, description, link_text, link_url) VALUES
(1, 'Join WA Group', 'Join WA Group komunitas UGM Anjem bareng mahasiswa UGM lainnya dengan', 'klik disini', 'https://chat.whatsapp.com/KsDOcqlQ5y6LBGKvoH792S'),
(2, 'Chat Order via Group', 'Kirim pesan di group untuk dapat terhubung dengan driver ready dengan menyebutkan kebutuhanmu. Example: "Mau anjem dari FEB ke kos dong"', NULL, NULL),
(3, 'Driver Akan Take Order', 'Driver ready akan membales pesananmu via Personal Chat (PC) dan melanjutkan detail pemesanan via PC.', NULL, NULL),
(4, 'OTW! Bayar Langsung ke Driver', 'Shareloc dan driver kami siap menjemput, bayar dengan tunai atau QRIS.', NULL, NULL)
ON CONFLICT (step_number) DO NOTHING;

-- Pricelist
INSERT INTO pricelist (image_url, alt_text, sort_order) VALUES
('/images/POSTER-SENDOWO3.png', 'UGM Anjem Pricelist Sendowo', 0),
('/images/POSTER-KLEBENGAN3.png', 'UGM Anjem Pricelist Klebengan', 1),
('/images/POSTER-POGUNG3.png', 'UGM Anjem Pricelist Pogung', 2);

-- Navigation
INSERT INTO navigation (name, section_id, sort_order) VALUES
('Home', 'home', 0),
('Why Us', 'why-us', 1),
('Tutorial', 'tutorial', 2),
('Services', 'services', 3),
('Pricelist', 'pricelist', 4),
('Review', 'review', 5),
('Join Driver', 'join-driver', 6),
('Contact Us', 'contact-us', 7)
ON CONFLICT (section_id) DO NOTHING;

-- Footer Sections & Links
INSERT INTO footer_sections (id, title, sort_order) OVERRIDING SYSTEM VALUE VALUES
(1, 'Company', 0),
(2, 'Services', 1),
(3, 'Quick Links', 2),
(4, 'Get in touch', 3);

SELECT setval('footer_sections_id_seq', 4);

INSERT INTO footer_links (section_id, label, href, is_external, sort_order) VALUES
(1, 'About', '#why-us', false, 0),
(1, 'Products', '#services', false, 1),
(1, 'Blog', '#review', false, 2),
(2, 'Antar Jemput', '#services', false, 0),
(2, 'Jasa Titip', '#services', false, 1),
(2, 'Survei Kost', '#services', false, 2),
(2, 'Urus Berkas', '#services', false, 3),
(3, 'Tutorial', '#tutorial', false, 0),
(3, 'Pricelist', '#pricelist', false, 1),
(3, 'Join Driver', '#join-driver', false, 2),
(3, 'Review', '#review', false, 3),
(4, 'Help Center', 'https://chat.whatsapp.com/KsDOcqlQ5y6LBGKvoH792S', true, 0),
(4, 'Our Location', '#home', false, 1);

-- Social Links
INSERT INTO social_links (platform, name, url, icon_url, sort_order) VALUES
('whatsapp', 'WhatsApp', 'https://api.whatsapp.com/send?phone=6282123035583&text=haloo%20min%2C%20mau%20link%20grup%20UGM%20Anjem%20dong!', '/images/logo-wa.png', 0),
('instagram', 'Instagram', 'https://instagram.com/ugm.anjem', '/images/logo-instagram.png', 1),
('tiktok', 'TikTok', 'https://tiktok.com/@ugm.anjem', '/images/logo-tiktok.png', 2),
('email', 'Email', 'https://mail.google.com/mail/?view=cm&to=ugmanjem@gmail.com', '/images/logo-email.svg', 3)
ON CONFLICT (platform) DO NOTHING;

-- Driver Requirements
INSERT INTO driver_requirements (requirement, sort_order) VALUES
('Mahasiswa UGM', 0),
('Memiliki kendaraan bersurat lengkap', 1),
('Komitmen dan banyak waktu luang', 2);

-- Site Config
INSERT INTO site_config (key, value) VALUES
('whatsapp_order_url', 'https://chat.whatsapp.com/KsDOcqlQ5y6LBGKvoH792S'),
('whatsapp_admin_url', 'https://api.whatsapp.com/send?phone=6282123035583&text=haloo%20min%2C%20mau%20link%20grup%20UGM%20Anjem%20dong!'),
('driver_registration_url', 'https://docs.google.com/forms/d/e/1FAIpQLSfOiP7z21-m6B42Xi2107Zq6mWJwvzFOD2a1uuNjEtfPcOK5g/viewform?usp=send_form'),
('logo_url', '/images/logo-anjem-putih.png'),
('hero_background_url', '/images/background.png')
ON CONFLICT (key) DO NOTHING;
