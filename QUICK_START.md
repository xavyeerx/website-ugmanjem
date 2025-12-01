# ⚡ Quick Start - Animasi UNS Anjem

## 🎯 Yang Sudah Ditambahkan

### 1. Preloader (Logo Animation)

- Background putih dengan logo di tengah
- Animasi pulse + loading dots
- Auto fade-out setelah 1.5 detik

### 2. Animasi Interaktif

- ✅ Navbar slide down animation
- ✅ Hero section dengan staggered text
- ✅ Scroll-based fade animations
- ✅ Parallax effects
- ✅ Hover effects pada cards & buttons
- ✅ Micro-interactions

---

## 🚀 Cara Menjalankan

```bash
# Development
npm run dev

# Build untuk production
npm run build

# Start production server
npm start
```

Buka: `http://localhost:3000`

---

## 📝 Komponen Baru

```
components/
├── preloader.tsx          → Logo preloader
├── fade-in.tsx           → Scroll animations
└── parallax-section.tsx  → Parallax effects
```

---

## 🎨 Cara Menggunakan

### Fade In Animation

```tsx
<FadeIn direction="up" delay={0.1}>
  <div>Your content</div>
</FadeIn>
```

### Parallax Effect

```tsx
<ParallaxSection offset={50}>
  <Image src="..." />
</ParallaxSection>
```

### Button Hover

```tsx
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  Click Me
</motion.button>
```

---

## 🎨 Ubah Warna

Ganti semua `#39BFDF` dengan warna brand Anda:

- Cari: `#39BFDF`
- Replace dengan: `#YOUR_COLOR`

Atau edit Tailwind config untuk permanent changes.

---

## ⚙️ Ubah Durasi Preloader

Edit `components/preloader.tsx` line 12:

```tsx
setTimeout(() => setIsLoading(false), 1500); // ← Ubah angka ini
```

---

## 📱 Test Responsive

1. Buka DevTools (F12)
2. Toggle device toolbar
3. Test di iPhone, iPad, Desktop

---

## 🐛 Troubleshooting

**Animasi tidak muncul?**

```bash
npm install framer-motion --legacy-peer-deps
```

**Build error?**

```bash
npm run build
# Check console untuk errors
```

**Slow performance?**

- Reduce animation durations
- Disable parallax on mobile
- Use `viewport={{ once: true }}`

---

## 📚 Dokumentasi Lengkap

Lihat: `ANIMATION_GUIDE.md` untuk detail lengkap

---

## ✨ Tips

1. Semua animasi sudah optimized
2. GPU-accelerated by default
3. Respect prefers-reduced-motion
4. Responsive & mobile-friendly

---

Selamat! Website Anda sekarang lebih interaktif! 🎉
