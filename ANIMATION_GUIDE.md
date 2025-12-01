# 🎨 Panduan Animasi & Interaktivitas Website UNS Anjem

## 📋 Ringkasan

Website UNS Anjem sekarang dilengkapi dengan animasi modern dan interaktif menggunakan **Framer Motion**. Semua animasi dirancang untuk:

- ✅ **Ringan & Smooth** - Tidak membebani performa
- ✅ **Modern & Elegan** - Tidak norak atau berlebihan
- ✅ **User-Friendly** - Meningkatkan pengalaman pengguna

---

## 🚀 Fitur yang Telah Ditambahkan

### 1. **Preloader Animation** ⏳

- Logo animasi di tengah layar dengan background putih
- Efek pulse yang smooth pada logo
- Loading dots dengan animasi berurutan
- Fade-out transition setelah 1.5 detik
- **Lokasi**: `components/preloader.tsx`

### 2. **Navigation Bar Animations** 🧭

- Slide down dari atas saat pertama kali load
- Hover effect pada logo (scale up)
- Animasi staggered pada menu items
- Button hover dengan scale & shadow effect

### 3. **Hero Section Animations** 🎯

- Title fade-in dengan slide dari kiri dan kanan
- Search bar dengan animated search button
- Smooth scroll indicator animations

### 4. **Scroll-Based Animations** 📜

Menggunakan komponen `FadeIn` dengan berbagai direction:

- **Fade Up**: Stats cards, service cards, review cards
- **Fade Left**: Section titles
- **Fade Right**: Tutorial steps
- **Intersection Observer** untuk trigger saat scroll

### 5. **Parallax Effects** 🌊

Menggunakan komponen `ParallaxSection`:

- Tutorial mockup image dengan parallax
- Pricelist image dengan subtle movement
- Smooth scroll-based transform

### 6. **Interactive Cards** 🃏

- **Hover Effects**:
  - Scale up (1.05x) saat hover
  - Lift up (translateY: -8px)
  - Shadow enhancement
- **Service Cards**: Image zoom on hover
- **Stats Cards**: Icon rotation on hover
- **Review Cards**: Smooth lift animation

### 7. **Micro-interactions** ✨

- Button press effects (scale down on click)
- Price calculator dengan animated price update
- Social media icons dengan slide effect
- Arrow icons dengan bouncing animation

---

## 📁 Struktur File

```
components/
├── preloader.tsx           # Komponen preloader utama
├── fade-in.tsx            # Komponen scroll animation
└── parallax-section.tsx   # Komponen parallax effect

app/
├── layout.tsx            # Integrated dengan Preloader
└── page.tsx              # Semua section dengan animasi
```

---

## 🎯 Cara Menggunakan Komponen

### 1. FadeIn Component

```tsx
import FadeIn from "@/components/fade-in";

// Basic usage
<FadeIn direction="up">
  <h1>Your Content</h1>
</FadeIn>

// With delay
<FadeIn direction="left" delay={0.2} duration={0.8}>
  <div>Content with delay</div>
</FadeIn>

// Available directions: "up" | "down" | "left" | "right"
```

**Props:**

- `direction`: "up" | "down" | "left" | "right" (default: "up")
- `delay`: number (default: 0) - Delay in seconds
- `duration`: number (default: 0.6) - Animation duration
- `once`: boolean (default: true) - Animate only once
- `className`: string - Additional CSS classes

### 2. ParallaxSection Component

```tsx
import ParallaxSection from "@/components/parallax-section";

<ParallaxSection offset={50}>
  <Image src="/your-image.png" />
</ParallaxSection>;
```

**Props:**

- `offset`: number (default: 50) - Parallax movement range
- `className`: string - Additional CSS classes

### 3. Motion Components (Framer Motion)

```tsx
import { motion } from "framer-motion";

// Hover effects
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>

// Scroll animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

---

## 🎨 Customisasi Tema & Warna

Semua warna menggunakan Tailwind CSS classes yang mudah diubah:

### Primary Color (Biru Anjem)

- `bg-[#39BFDF]` - Background
- `text-[#39BFDF]` - Text color
- `border-[#39BFDF]` - Border color

### Untuk mengubah warna:

1. Cari & replace `#39BFDF` dengan warna baru Anda
2. Atau tambahkan ke `tailwind.config`:

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: '#39BFDF',    // Ganti dengan warna Anda
      secondary: '#89DCED',  // Ganti dengan warna Anda
    }
  }
}
```

Kemudian gunakan: `bg-primary`, `text-primary`, dll.

---

## ⚙️ Konfigurasi Animasi

### Mengubah Durasi Preloader

Edit `components/preloader.tsx`:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 1500); // ← Ubah angka ini (dalam milliseconds)

  return () => clearTimeout(timer);
}, []);
```

### Mengubah Kecepatan Animasi

Edit transition duration di komponen:

```tsx
transition={{
  duration: 0.6,  // ← Ubah ini (dalam detik)
  ease: "easeOut"
}}
```

### Disable Preloader (Untuk Development)

Edit `app/layout.tsx`:

```tsx
// Comment atau hapus baris ini:
// <Preloader />
```

---

## 📱 Responsive Design

Semua animasi sudah responsive:

- Mobile: Animasi lebih sederhana
- Tablet: Animasi medium
- Desktop: Full animasi dengan parallax

Test di berbagai device untuk memastikan performa optimal.

---

## 🐛 Troubleshooting

### Animasi Terlalu Lambat

1. Kurangi `duration` di transition
2. Kurangi jumlah animasi simultan
3. Disable parallax di mobile

### Animasi Tidak Muncul

1. Pastikan Framer Motion terinstall: `npm install framer-motion --legacy-peer-deps`
2. Check console untuk errors
3. Pastikan komponen dibungkus dengan proper tags

### Performance Issues

1. Gunakan `viewport={{ once: true }}` untuk animasi scroll
2. Reduce `offset` value di ParallaxSection
3. Disable unnecessary animations di mobile

---

## 🚀 Tips Optimasi

1. **Lazy Load Images**: Gunakan `loading="lazy"` pada Image components
2. **Reduce Motion**: Respect user preferences
3. **GPU Acceleration**: Framer Motion otomatis menggunakan GPU
4. **Bundle Size**: Framer Motion sudah tree-shakeable

---

## 📦 Dependencies

```json
{
  "framer-motion": "^latest"
}
```

Install dengan:

```bash
npm install framer-motion --legacy-peer-deps
```

---

## 🎓 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Next.js Docs](https://nextjs.org)

---

## ✅ Checklist Implementation

- [x] Install Framer Motion
- [x] Buat Preloader Component
- [x] Buat FadeIn Component
- [x] Buat ParallaxSection Component
- [x] Integrate ke Layout
- [x] Tambahkan animasi di Hero Section
- [x] Tambahkan animasi di Why Us Section
- [x] Tambahkan animasi di Stats Section
- [x] Tambahkan animasi di Tutorial Section
- [x] Tambahkan animasi di Services Section
- [x] Tambahkan animasi di Pricelist Section
- [x] Tambahkan animasi di Review Section
- [x] Tambahkan animasi di Join Driver Section
- [x] Tambahkan animasi di Footer
- [x] Fix linter errors
- [x] Test responsive design

---

## 🎉 Selesai!

Website Anda sekarang memiliki animasi yang modern, smooth, dan interaktif!

Untuk pertanyaan atau customisasi lebih lanjut, silakan modifikasi komponen sesuai kebutuhan Anda.

**Happy Coding! 🚀**
