from fpdf import FPDF
from fpdf.enums import XPos, YPos

class PanduanPDF(FPDF):
    COLOR_PRIMARY = (0, 102, 178)
    COLOR_SECONDARY = (0, 150, 136)
    COLOR_ACCENT = (255, 152, 0)
    COLOR_DARK = (33, 37, 41)
    COLOR_LIGHT_BG = (245, 247, 250)
    COLOR_WHITE = (255, 255, 255)
    COLOR_BORDER = (200, 210, 220)
    COLOR_WARNING = (220, 53, 69)

    def header(self):
        if self.page_no() > 1:
            self.set_fill_color(*self.COLOR_PRIMARY)
            self.rect(0, 0, 210, 12, 'F')
            self.set_font('Helvetica', 'B', 8)
            self.set_text_color(*self.COLOR_WHITE)
            self.set_y(3)
            self.cell(0, 6, 'Panduan Pengguna Resmi UGM Anjem', align='C')
            self.set_text_color(*self.COLOR_DARK)
            self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(140, 140, 140)
        if self.page_no() > 1:
            self.cell(0, 10, f'UGM Anjem  |  anjemugm.vercel.app  |  Halaman {self.page_no()}', align='C')

    def nl(self):
        self.set_x(self.l_margin)
        self.set_y(self.get_y() + self.font_size * 1.5)

    def cell_ln(self, w, h, txt, **kwargs):
        kwargs['new_x'] = XPos.LMARGIN
        kwargs['new_y'] = YPos.NEXT
        self.cell(w, h, txt, **kwargs)

    def section_title(self, title, icon=""):
        self.ln(4)
        self.set_fill_color(*self.COLOR_PRIMARY)
        self.rect(10, self.get_y(), 190, 10, 'F')
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(*self.COLOR_WHITE)
        self.set_x(15)
        display = f'{icon}  {title}' if icon else title
        self.cell_ln(0, 10, display)
        self.set_text_color(*self.COLOR_DARK)
        self.ln(3)

    def sub_title(self, title):
        self.ln(2)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*self.COLOR_SECONDARY)
        self.cell_ln(0, 7, title)
        self.set_draw_color(*self.COLOR_SECONDARY)
        self.line(10, self.get_y(), 80, self.get_y())
        self.set_text_color(*self.COLOR_DARK)
        self.ln(2)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self.COLOR_DARK)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def bullet_point(self, text, indent=15):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self.COLOR_DARK)
        self.set_x(indent)
        self.set_font('Helvetica', 'B', 10)
        self.cell(5, 6, '-')
        self.set_font('Helvetica', '', 10)
        self.multi_cell(170, 6, text)
        self.ln(0.5)

    def numbered_step(self, number, title, description):
        self.set_fill_color(*self.COLOR_PRIMARY)
        self.set_text_color(*self.COLOR_WHITE)
        self.set_font('Helvetica', 'B', 12)
        self.set_x(15)
        self.cell(10, 10, str(number), align='C', fill=True)

        self.set_x(28)
        self.set_text_color(*self.COLOR_DARK)
        self.set_font('Helvetica', 'B', 10)
        self.cell_ln(0, 6, title)
        self.set_x(28)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(100, 100, 100)
        self.multi_cell(165, 5, description)
        self.ln(3)

    def info_box(self, title, content, color=None):
        if color is None:
            color = self.COLOR_SECONDARY
        self.ln(2)

        start_y = self.get_y()
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*color)
        self.set_x(18)
        self.cell_ln(0, 6, title)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.COLOR_DARK)
        self.set_x(18)
        self.multi_cell(175, 5, content)
        end_y = self.get_y()

        self.set_fill_color(*color)
        self.rect(12, start_y, 2, end_y - start_y, 'F')
        self.set_fill_color(245, 250, 255)
        self.rect(14, start_y, 184, end_y - start_y, 'F')

        self.set_y(start_y)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*color)
        self.set_x(18)
        self.cell_ln(0, 6, title)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.COLOR_DARK)
        self.set_x(18)
        self.multi_cell(175, 5, content)
        self.ln(3)

    def price_row(self, label, price, bg=False):
        if bg:
            self.set_fill_color(*self.COLOR_LIGHT_BG)
        else:
            self.set_fill_color(*self.COLOR_WHITE)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self.COLOR_DARK)
        self.set_x(15)
        self.cell(120, 8, label, border=0, fill=True)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*self.COLOR_PRIMARY)
        self.cell(55, 8, price, border=0, fill=True, align='R',
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(*self.COLOR_DARK)

    def warning_box(self, content):
        self.ln(2)
        start_y = self.get_y()

        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*self.COLOR_WARNING)
        self.set_x(18)
        self.cell_ln(0, 6, 'PERINGATAN PENTING')
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.COLOR_DARK)
        self.set_x(18)
        self.multi_cell(175, 5, content)
        end_y = self.get_y()

        self.set_fill_color(*self.COLOR_WARNING)
        self.rect(12, start_y, 2, end_y - start_y, 'F')
        self.set_fill_color(255, 243, 243)
        self.rect(14, start_y, 184, end_y - start_y, 'F')

        self.set_y(start_y)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*self.COLOR_WARNING)
        self.set_x(18)
        self.cell_ln(0, 6, 'PERINGATAN PENTING')
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.COLOR_DARK)
        self.set_x(18)
        self.multi_cell(175, 5, content)
        self.ln(3)


def generate_panduan():
    pdf = PanduanPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_left_margin(10)
    pdf.set_right_margin(10)

    # ===== COVER PAGE =====
    pdf.add_page()
    pdf.set_fill_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.set_fill_color(0, 82, 148)
    pdf.rect(0, 80, 210, 140, 'F')

    pdf.set_text_color(*PanduanPDF.COLOR_WHITE)

    pdf.set_y(55)
    pdf.set_font('Helvetica', '', 14)
    pdf.cell_ln(0, 8, 'UNIVERSITAS GADJAH MADA', align='C')

    pdf.ln(20)
    pdf.set_font('Helvetica', 'B', 36)
    pdf.cell(0, 18, 'UGM ANJEM', align='C', ln=True)

    pdf.ln(2)
    pdf.set_draw_color(*PanduanPDF.COLOR_ACCENT)
    pdf.set_line_width(1)
    pdf.line(65, pdf.get_y(), 145, pdf.get_y())
    pdf.set_line_width(0.2)

    pdf.ln(8)
    pdf.set_font('Helvetica', '', 14)
    pdf.cell(0, 8, 'Antar Jemput & Jasa Titip Mahasiswa UGM', align='C', ln=True)

    pdf.ln(20)
    pdf.set_fill_color(*PanduanPDF.COLOR_ACCENT)
    pdf.set_x(40)
    pdf.set_font('Helvetica', 'B', 18)
    pdf.cell(130, 14, 'PANDUAN PENGGUNA RESMI', align='C', fill=True, ln=True)

    pdf.ln(30)
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(0, 7, 'Versi 1.0  |  Maret 2026', align='C', ln=True)
    pdf.cell(0, 7, 'anjemugm.vercel.app', align='C', ln=True)
    pdf.cell(0, 7, 'Instagram: @ugm.anjem', align='C', ln=True)

    pdf.set_y(265)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(180, 200, 220)
    pdf.cell(0, 5, 'Dokumen ini merupakan panduan resmi penggunaan layanan UGM Anjem.', align='C', ln=True)
    pdf.cell(0, 5, 'Seluruh informasi yang tercantum berlaku per Maret 2026.', align='C', ln=True)

    # ===== DAFTAR ISI =====
    pdf.add_page()
    pdf.set_text_color(*PanduanPDF.COLOR_DARK)
    pdf.ln(5)
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.cell(0, 12, 'DAFTAR ISI', align='C', ln=True)
    pdf.ln(3)
    pdf.set_draw_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.line(70, pdf.get_y(), 140, pdf.get_y())
    pdf.ln(10)

    toc_items = [
        ('1.', 'Tentang UGM Anjem', '3'),
        ('2.', 'Layanan yang Tersedia', '3'),
        ('3.', 'Cara Order (Pemesanan)', '4'),
        ('4.', 'Informasi Tarif & Harga', '5'),
        ('5.', 'Ketentuan Tarif Khusus', '7'),
        ('6.', 'Metode Pembayaran', '8'),
        ('7.', 'Keamanan & Keselamatan', '8'),
        ('8.', 'FAQ (Pertanyaan Umum)', '9'),
        ('9.', 'Kontak & Media Sosial', '10'),
        ('10.', 'Bergabung Sebagai Driver', '10'),
    ]

    for num, title, page in toc_items:
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(*PanduanPDF.COLOR_PRIMARY)
        pdf.set_x(25)
        pdf.cell(10, 9, num)
        pdf.set_font('Helvetica', '', 11)
        pdf.set_text_color(*PanduanPDF.COLOR_DARK)
        pdf.cell(130, 9, title)
        pdf.set_font('Helvetica', '', 11)
        pdf.set_text_color(140, 140, 140)
        pdf.cell(20, 9, page, align='R', ln=True)
        pdf.set_draw_color(*PanduanPDF.COLOR_BORDER)
        pdf.line(25, pdf.get_y(), 185, pdf.get_y())

    # ===== SECTION 1: TENTANG UGM ANJEM =====
    pdf.add_page()
    pdf.section_title('1. Tentang UGM Anjem')
    pdf.body_text(
        'UGM Anjem (Antar Jemput UGM) adalah layanan antar jemput dan jasa titip (jastip) berbasis '
        'komunitas yang dioperasikan oleh mahasiswa Universitas Gadjah Mada. Layanan ini hadir sebagai '
        'solusi mobilitas terpercaya bagi mahasiswa UGM yang membutuhkan transportasi di sekitar area '
        'kampus dan kos-kosan.'
    )
    pdf.body_text(
        'Seluruh driver UGM Anjem adalah mahasiswa UGM aktif yang telah terverifikasi, sehingga lebih '
        'memahami wilayah kampus dan sekitarnya. Dengan tarif yang terjangkau dan proses pemesanan yang '
        'mudah melalui grup WhatsApp, UGM Anjem menjadi pilihan utama mahasiswa untuk kebutuhan '
        'transportasi sehari-hari.'
    )

    pdf.sub_title('Keunggulan UGM Anjem')
    pdf.bullet_point('Driver 100% Mahasiswa UGM - Lebih paham wilayah dalam dan sekitar kampus, bonus mendapat relasi baru.')
    pdf.bullet_point('Aman, Cepat, dan Fleksibel - Cukup chat di grup WhatsApp, kami siap membantu segala kebutuhanmu.')
    pdf.bullet_point('Terjangkau - Tarif ramah kantong mahasiswa, mulai dari Rp5.000 saja.')
    pdf.bullet_point('Mudah Diakses - Pemesanan dilakukan langsung via grup WhatsApp tanpa perlu install aplikasi tambahan.')
    pdf.bullet_point('Keunggulan Mobilitas Area Kampus - Menguasai jalur-jalur dalam kampus UGM yang tidak terjangkau ojol biasa.')

    pdf.sub_title('Statistik UGM Anjem')
    stats = [
        ('Driver Aktif', '20 Driver'),
        ('Grup WhatsApp', '3 Grup'),
        ('Order Selesai', '3000+ Order'),
        ('Member Grup', '2000+ Member'),
    ]
    for i, (label, value) in enumerate(stats):
        pdf.price_row(f'   {label}', value, bg=(i % 2 == 0))

    # ===== SECTION 2: LAYANAN =====
    pdf.ln(5)
    pdf.section_title('2. Layanan yang Tersedia')

    pdf.sub_title('A. Antar Jemput (Anjem)')
    pdf.body_text(
        'Layanan utama UGM Anjem untuk mengantar dan menjemput mahasiswa dari/ke kampus, kos, atau '
        'lokasi lain di sekitar area UGM. Cocok untuk kebutuhan pergi kuliah, pulang ke kos, atau '
        'mobilitas harian lainnya.'
    )
    pdf.info_box('Tarif', 'Mulai dari Rp5.000 (tergantung jarak dan kondisi)')

    pdf.sub_title('B. Jasa Titip (Jastip)')
    pdf.body_text(
        'Butuh makanan, obat, atau barang lain tapi tidak bisa pergi sendiri? Driver kami siap '
        'membelikan dan mengantarkan pesananmu.'
    )
    pdf.bullet_point('Jastip Makanan (dengan menunggu): mulai dari Rp6.000')
    pdf.bullet_point('Jastip Barang (tanpa menunggu): mulai dari Rp5.000')

    pdf.sub_title('C. Survei Kost')
    pdf.body_text(
        'Layanan untuk mahasiswa yang ingin mencari kos-kosan. Driver kami akan mengantar dan menemani '
        'survei lokasi kos yang diinginkan.'
    )
    pdf.info_box('Tarif', 'Mulai dari Rp15.000, tergantung lokasi dan lama waktu tunggu.')

    pdf.sub_title('D. Urus Berkas Kampus')
    pdf.body_text(
        'Layanan bantuan untuk mengurus berkas-berkas di lingkungan kampus UGM, seperti legalisir, '
        'pengambilan surat, dan keperluan administrasi lainnya.'
    )
    pdf.info_box('Tarif', 'Mulai dari Rp15.000, tergantung kompleksitas dan lokasi.')

    # ===== SECTION 3: CARA ORDER =====
    pdf.add_page()
    pdf.section_title('3. Cara Order (Pemesanan)')

    pdf.body_text(
        'Pemesanan layanan UGM Anjem dilakukan melalui grup WhatsApp resmi. Berikut adalah langkah-langkah '
        'lengkap untuk melakukan pemesanan:'
    )
    pdf.ln(3)

    pdf.numbered_step(1, 'Join Grup WhatsApp Resmi',
        'Bergabung ke grup WhatsApp komunitas UGM Anjem melalui link yang tersedia di website '
        'anjemugm.vercel.app atau melalui bio Instagram @ugm.anjem.')

    pdf.numbered_step(2, 'Kirim Pesan Order di Grup',
        'Tulis pesan di grup dengan menyebutkan kebutuhanmu secara jelas. Sebutkan jenis layanan '
        '(anjem/jastip/dll) dan lokasi penjemputan serta tujuan.')

    pdf.numbered_step(3, 'Tunggu Respon Driver',
        'Driver (admin) yang sedang ready akan membalas pesananmu melalui Personal Chat (PC) dan '
        'me-react pesan ordermu di grup. Waktu tunggu maksimal 10 menit.')

    pdf.numbered_step(4, 'Konfirmasi Detail via Personal Chat',
        'Lanjutkan detail pemesanan melalui PC dengan driver pertama yang menghubungimu. '
        'Abaikan pesan dari driver lain dan tidak perlu dibalas.')

    pdf.numbered_step(5, 'Share Lokasi & Tunggu Driver',
        'Bagikan lokasi live-mu kepada driver dan tunggu driver menjemput. Pastikan kamu sudah siap '
        'di titik jemput yang telah disepakati.')

    pdf.numbered_step(6, 'Bayar Langsung ke Driver',
        'Setelah sampai di tujuan, lakukan pembayaran langsung kepada driver secara tunai atau melalui QRIS.')

    pdf.ln(2)
    pdf.info_box('Contoh Pesan Order',
        '"Ada yang bisa anjem dari Pogung ke Kampus SV?"\n'
        '"Mau jastip makanan dari Warmindo Sendowo dong"\n'
        '"Butuh anjem dari FEB ke kos Jakal, ada yang ready?"',
        PanduanPDF.COLOR_SECONDARY)

    pdf.warning_box(
        'Jika dalam 10 menit tidak ada respon dari driver, berarti semua driver sedang tidak aktif (off). '
        'Silakan coba lagi nanti atau di waktu yang berbeda.'
    )

    pdf.info_box('Catatan Keamanan',
        'Pastikan yang menghubungimu melalui PC adalah ADMIN GRUP RESMI. Jika yang menghubungi '
        'bukan admin, segera laporkan kepada admin grup. Hanya terima order dari admin grup demi keamananmu.',
        PanduanPDF.COLOR_WARNING)

    # ===== SECTION 4: INFORMASI TARIF & HARGA =====
    pdf.add_page()
    pdf.section_title('4. Informasi Tarif & Harga')

    pdf.body_text(
        'Berikut adalah informasi tarif resmi UGM Anjem. Tarif dapat berbeda tergantung pada hari, waktu, '
        'cuaca, dan jenis layanan. Pricelist harga juga dapat dilihat pada poster di bio WA Admin dan '
        'Instagram @ugm.anjem.'
    )

    pdf.sub_title('A. Tarif Antar Jemput (Anjem)')

    pdf.ln(2)
    pdf.set_fill_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.set_text_color(*PanduanPDF.COLOR_WHITE)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_x(15)
    pdf.cell(87.5, 8, '  WEEKDAYS', fill=True)
    pdf.cell(87.5, 8, '  WEEKEND / MALAM', fill=True, ln=True)
    pdf.set_text_color(*PanduanPDF.COLOR_DARK)

    pdf.set_font('Helvetica', '', 9)

    pdf.set_fill_color(*PanduanPDF.COLOR_LIGHT_BG)
    pdf.set_x(15)
    pdf.cell(87.5, 7, '  (Semua Gerbang Kampus TERBUKA)', fill=True)
    pdf.cell(87.5, 7, '  (Gerbang Kampus TERTUTUP)', fill=True, ln=True)

    rows_wd = [
        ('Rp5.000', 'Area dekat (Sendowo, Pogung, Klebengan)'),
        ('Rp6.000', 'Area kos >2.5 km'),
        ('Maks. Rp6.000', 'Jarak >3 km (sangat jarang)'),
    ]
    rows_we = [
        ('Rp5.000', 'Area dekat Pricelist'),
        ('Rp6.000', 'Area terdampak muter +/-2.5-3 km'),
        ('Rp7.000', 'Area terdampak muter +/-3-4 km'),
    ]

    for i in range(3):
        bg = (i % 2 == 0)
        if bg:
            pdf.set_fill_color(240, 248, 255)
        else:
            pdf.set_fill_color(*PanduanPDF.COLOR_WHITE)

        pdf.set_x(15)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(22, 14, f'  {rows_wd[i][0]}', fill=True)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.cell(65.5, 14, f'  {rows_wd[i][1]}', fill=True)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(22, 14, f'  {rows_we[i][0]}', fill=True)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.cell(65.5, 14, f'  {rows_we[i][1]}', fill=True, ln=True)

    pdf.ln(2)
    pdf.info_box('Catatan Tarif Weekdays',
        'Harga wajib berkisar antara Rp5.000 - Rp6.000 untuk weekdays. Jarak lebih dari 3 km sangat jarang terjadi, '
        'namun tetap maksimal Rp6.000.',
        PanduanPDF.COLOR_SECONDARY)

    pdf.info_box('Catatan Tarif Weekend/Malam',
        'Tarif weekend/malam berkisar Rp5.000 - Rp7.000. Tidak boleh lebih dari Rp7.000 jika jarak belum '
        'melebihi 4 km. Tarif lebih tinggi karena gerbang kampus tertutup sehingga jarak tempuh bertambah.',
        PanduanPDF.COLOR_ACCENT)

    pdf.sub_title('B. Tarif Di Luar Area Pricelist')
    pdf.body_text(
        'Untuk tujuan di luar area yang tercantum dalam pricelist, berlaku tarif per kilometer:'
    )

    pdf.ln(1)
    pdf.set_fill_color(*PanduanPDF.COLOR_LIGHT_BG)
    pdf.set_x(15)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.cell(175, 12, 'Rp2.500 / km  (Jarak x Rp2.500)', align='C', fill=True, ln=True)
    pdf.set_text_color(*PanduanPDF.COLOR_DARK)
    pdf.ln(2)

    pdf.info_box('Contoh Perhitungan',
        'Jarak 4,56 km:\n'
        '4,56 x Rp2.500 = Rp11.400\n'
        'Dibulatkan ke bawah menjadi: Rp11.000\n\n'
        'Catatan: Hasil perhitungan akan dibulatkan ke ribuan terdekat ke bawah.',
        PanduanPDF.COLOR_SECONDARY)

    pdf.sub_title('C. Tarif Layanan Lainnya')
    pdf.ln(1)

    services = [
        ('Jastip Makanan (dengan menunggu)', 'Mulai dari Rp6.000'),
        ('Jastip Barang (tanpa menunggu)', 'Mulai dari Rp5.000'),
        ('Survei Kost', 'Mulai dari Rp15.000'),
        ('Urus Berkas Kampus', 'Mulai dari Rp15.000'),
    ]

    pdf.set_fill_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.set_text_color(*PanduanPDF.COLOR_WHITE)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_x(15)
    pdf.cell(120, 8, '  Jenis Layanan', fill=True)
    pdf.cell(55, 8, 'Tarif', fill=True, align='C', ln=True)
    pdf.set_text_color(*PanduanPDF.COLOR_DARK)

    for i, (svc, price) in enumerate(services):
        pdf.price_row(f'   {svc}', price, bg=(i % 2 == 0))

    # ===== SECTION 5: KETENTUAN TARIF KHUSUS =====
    pdf.add_page()
    pdf.section_title('5. Ketentuan Tarif Khusus')

    pdf.sub_title('A. Fee Tambahan Dini Hari')
    pdf.body_text(
        'Untuk orderan yang dilakukan di atas pukul 22.00 WIB, dikenakan fee tambahan sebesar Rp1.000. '
        'Fee ini berlaku untuk semua jenis layanan.'
    )
    pdf.ln(1)
    pdf.set_fill_color(*PanduanPDF.COLOR_LIGHT_BG)
    pdf.set_x(15)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*PanduanPDF.COLOR_ACCENT)
    pdf.cell(175, 10, 'Order setelah pukul 22.00 WIB  =  + Rp1.000', align='C', fill=True, ln=True)
    pdf.set_text_color(*PanduanPDF.COLOR_DARK)

    pdf.sub_title('B. Tarif Hujan')
    pdf.body_text(
        'Saat kondisi hujan, terdapat fee tambahan yang bervariasi tergantung tingkat intensitas hujan '
        'dan perlengkapan yang digunakan:'
    )

    rain_data = [
        ('+Rp1.000', 'Driver pakai mantel, customer tidak memakai mantel'),
        ('+Rp2.000', 'Customer memakai mantel dari driver'),
        ('+Rp3.000', 'Keduanya pakai mantel DAN hujan deras + jarak jauh'),
    ]

    pdf.set_fill_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.set_text_color(*PanduanPDF.COLOR_WHITE)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_x(15)
    pdf.cell(35, 8, '  Fee Tambahan', fill=True)
    pdf.cell(140, 8, '  Kondisi', fill=True, ln=True)
    pdf.set_text_color(*PanduanPDF.COLOR_DARK)

    for i, (fee, condition) in enumerate(rain_data):
        bg = (i % 2 == 0)
        if bg:
            pdf.set_fill_color(*PanduanPDF.COLOR_LIGHT_BG)
        else:
            pdf.set_fill_color(*PanduanPDF.COLOR_WHITE)
        pdf.set_x(15)
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(35, 8, f'  {fee}', fill=True)
        pdf.set_font('Helvetica', '', 9.5)
        pdf.cell(140, 8, f'  {condition}', fill=True, ln=True)

    pdf.sub_title('C. Ketentuan Transit')
    pdf.body_text(
        'Jika dalam satu perjalanan penumpang ingin mampir ke lokasi lain (transit), berlaku ketentuan berikut:'
    )

    pdf.bullet_point('Transit searah / beda arah tetapi dekat, dengan waktu tunggu maksimal 7 menit: GRATIS (masih dihitung satu perjalanan)')
    pdf.bullet_point('Transit dengan waktu tunggu lebih dari 7 menit: dikenakan tambahan biaya Rp1.000 - Rp2.000')
    pdf.bullet_point('Transit beda arah (jauh): dihitung sebagai 2x orderan terpisah')

    pdf.info_box('Tips Transit',
        'Jika kamu perlu transit, sampaikan kepada driver sejak awal pemesanan agar driver bisa '
        'memperkirakan rute dan biaya dengan lebih baik. Transit searah dengan waktu singkat biasanya gratis!',
        PanduanPDF.COLOR_SECONDARY)

    # ===== SECTION 6: METODE PEMBAYARAN =====
    pdf.ln(3)
    pdf.section_title('6. Metode Pembayaran')

    pdf.body_text(
        'UGM Anjem menerima pembayaran langsung kepada driver setelah layanan selesai. '
        'Berikut metode pembayaran yang tersedia:'
    )

    pdf.sub_title('A. Tunai (Cash)')
    pdf.body_text(
        'Pembayaran langsung dengan uang tunai kepada driver. Disarankan untuk menyiapkan uang pas '
        'agar memudahkan transaksi.'
    )

    pdf.sub_title('B. QRIS')
    pdf.body_text(
        'Pembayaran melalui scan QRIS yang disediakan oleh masing-masing driver. Bisa menggunakan '
        'berbagai aplikasi e-wallet atau mobile banking yang mendukung QRIS.'
    )

    pdf.info_box('Catatan Pembayaran',
        'Pembayaran dilakukan langsung ke driver, bukan melalui admin atau transfer ke rekening tertentu. '
        'Jika ada pihak yang meminta transfer sebelum layanan, harap laporkan ke admin.',
        PanduanPDF.COLOR_ACCENT)

    # ===== SECTION 7: KEAMANAN & KESELAMATAN =====
    pdf.add_page()
    pdf.section_title('7. Keamanan & Keselamatan')

    pdf.body_text(
        'Keselamatan dan keamanan pengguna merupakan prioritas utama UGM Anjem. Berikut panduan '
        'keamanan yang perlu diperhatikan:'
    )

    pdf.sub_title('Panduan Keamanan Pengguna')
    pdf.bullet_point('Hanya terima order dari ADMIN GRUP resmi. Pastikan yang menghubungimu via PC adalah admin grup WhatsApp UGM Anjem.')
    pdf.bullet_point('Jika ada orang yang mengaku driver tetapi BUKAN admin grup, segera laporkan ke admin grup.')
    pdf.bullet_point('Jangan memberikan informasi pribadi yang sensitif (PIN, password, dll) kepada siapapun.')
    pdf.bullet_point('Selalu gunakan share location (lokasi live) untuk kemudahan dan keamanan penjemputan.')
    pdf.bullet_point('Kenakan helm selama perjalanan demi keselamatan bersama.')

    pdf.warning_box(
        'PENTING: Mohon untuk menerima order HANYA dari admin grup. Selain itu bukan driver resmi '
        'UGM Anjem dan di luar tanggung jawab kami. Jika menemukan pihak mencurigakan, segera lapor ke admin.'
    )

    pdf.sub_title('Kebijakan Keluhan & Masukan')
    pdf.body_text(
        'UGM Anjem menerima keluhan dan masukan dari pengguna untuk peningkatan kualitas layanan. '
        'Jika ada keluhan terkait layanan, tarif, atau perilaku driver, silakan langsung hubungi admin grup.'
    )
    pdf.bullet_point('Sampaikan keluhan dengan jelas dan sopan.')
    pdf.bullet_point('Sertakan bukti jika diperlukan (screenshot chat, foto, dll).')
    pdf.bullet_point('Admin akan menindaklanjuti keluhan dalam waktu yang wajar.')

    # ===== SECTION 8: FAQ =====
    pdf.ln(3)
    pdf.section_title('8. FAQ (Pertanyaan yang Sering Diajukan)')

    faqs = [
        ('Bagaimana cara bergabung ke grup WhatsApp UGM Anjem?',
         'Kamu bisa bergabung melalui link undangan yang tersedia di website anjemugm.vercel.app atau melalui bio Instagram @ugm.anjem.'),
        ('Apakah layanan UGM Anjem hanya untuk mahasiswa UGM?',
         'Layanan utama ditujukan untuk mahasiswa UGM, namun siapa saja yang tergabung di grup WhatsApp bisa menggunakan layanan kami.'),
        ('Bagaimana jika tidak ada driver yang merespon?',
         'Jika dalam 10 menit tidak ada respon, berarti semua driver sedang tidak aktif. Silakan coba lagi di waktu lain.'),
        ('Apakah bisa order untuk rute di luar area pricelist?',
         'Bisa! Untuk rute di luar area pricelist, berlaku tarif Rp2.500 per km. Silakan tanyakan langsung di grup.'),
        ('Apakah bisa bayar non-tunai?',
         'Ya, selain tunai kamu juga bisa membayar melalui QRIS yang disediakan oleh masing-masing driver.'),
        ('Bagaimana jika saya ingin transit selama perjalanan?',
         'Transit searah dengan waktu tunggu maksimal 7 menit gratis. Lebih dari itu akan dikenakan tambahan Rp1.000-2.000. Transit beda arah jauh dihitung 2x orderan.'),
        ('Mengapa tarif weekend lebih mahal?',
         'Karena saat weekend/malam beberapa gerbang kampus tertutup, sehingga driver harus memutar jalan yang lebih jauh. Perbedaan hanya Rp1.000-2.000.'),
        ('Apakah ada tarif tambahan saat hujan?',
         'Ya, saat hujan terdapat tambahan Rp1.000-3.000 tergantung intensitas hujan dan perlengkapan mantel yang digunakan.'),
    ]

    for q, a in faqs:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(*PanduanPDF.COLOR_PRIMARY)
        pdf.set_x(15)
        pdf.cell(5, 6, 'Q:')
        pdf.set_x(21)
        pdf.multi_cell(170, 6, q)

        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_text_color(*PanduanPDF.COLOR_DARK)
        pdf.set_x(15)
        pdf.cell(5, 6, 'A:')
        pdf.set_x(21)
        pdf.multi_cell(170, 5.5, a)
        pdf.ln(3)

    # ===== SECTION 9: KONTAK & MEDIA SOSIAL =====
    pdf.add_page()
    pdf.section_title('9. Kontak & Media Sosial')

    pdf.body_text(
        'Tetap terhubung dengan UGM Anjem melalui berbagai platform berikut:'
    )
    pdf.ln(2)

    contacts = [
        ('Website', 'anjemugm.vercel.app'),
        ('Instagram', '@ugm.anjem'),
        ('WhatsApp Grup', 'Link tersedia di website dan bio Instagram'),
    ]

    for label, value in contacts:
        pdf.set_fill_color(*PanduanPDF.COLOR_LIGHT_BG)
        pdf.set_x(15)
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(50, 10, f'  {label}', fill=True)
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(*PanduanPDF.COLOR_PRIMARY)
        pdf.cell(125, 10, f'  {value}', fill=True, ln=True)
        pdf.set_text_color(*PanduanPDF.COLOR_DARK)
        pdf.ln(1)

    # ===== SECTION 10: BERGABUNG SEBAGAI DRIVER =====
    pdf.ln(3)
    pdf.section_title('10. Bergabung Sebagai Driver')

    pdf.body_text(
        'Tertarik untuk bergabung menjadi driver UGM Anjem? Dapatkan kesempatan menghasilkan uang dengan '
        'fleksibel sambil membantu sesama mahasiswa UGM.'
    )

    pdf.sub_title('Persyaratan Driver')
    pdf.bullet_point('Merupakan mahasiswa aktif Universitas Gadjah Mada')
    pdf.bullet_point('Memiliki komitmen dan banyak waktu luang')
    pdf.bullet_point('Memiliki kendaraan bermotor dengan surat-surat lengkap (STNK, SIM)')

    pdf.info_box('Cara Mendaftar',
        'Untuk mendaftar sebagai driver, silakan isi formulir pendaftaran yang tersedia di website '
        'anjemugm.vercel.app pada bagian "Join As A Driver". Tim admin akan menghubungi kamu untuk '
        'proses selanjutnya.',
        PanduanPDF.COLOR_SECONDARY)

    # ===== PENUTUP =====
    pdf.ln(8)
    pdf.set_fill_color(*PanduanPDF.COLOR_PRIMARY)
    pdf.rect(10, pdf.get_y(), 190, 50, 'F')

    y_start = pdf.get_y()
    pdf.set_text_color(*PanduanPDF.COLOR_WHITE)
    pdf.ln(5)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 8, 'Terima Kasih Telah Menggunakan UGM Anjem!', align='C', ln=True)
    pdf.ln(2)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 6, 'Jangan sungkan buat order ya, Sobat Anjem!', align='C', ln=True)
    pdf.cell(0, 6, 'Kalau ada keluhan atau masukan, bisa langsung ke admin.', align='C', ln=True)
    pdf.ln(2)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(180, 200, 220)
    pdf.cell(0, 5, '#ChatKamiAja  |  anjemugm.vercel.app  |  @ugm.anjem', align='C', ln=True)

    pdf.set_text_color(*PanduanPDF.COLOR_DARK)

    output_path = "d:/TRI/TA/Chatbot AnjemUGM/Panduan_Pengguna_UGM_Anjem.pdf"
    pdf.output(output_path)
    print(f"PDF berhasil dibuat: {output_path}")
    return output_path


if __name__ == "__main__":
    generate_panduan()
