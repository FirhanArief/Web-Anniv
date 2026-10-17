# Design Direction: 7 Years Journey Anniversary Web

> Dokumen acuan arah desain (Design Direction Document) resmi proyek Web Anniversary 7 Tahun, sesuai standar **Anti-Slop: Rules for AI Coding Agents** (https://github.com/miqdadbadjuber/anti-slop).

---

## 1. Konteks & Tujuan Produk
- **Judul Web**: *Happy 7th Anniversary, Sayang! ❤️💙*
- **Pasangan**: Firhan & Pasangan Tercinta
- **Tonggak Tanggal Jadian**: 16 Desember 2019 — Menuju 16 Desember 2026 (7 Tahun Kisah Cinta)
- **Tujuan Emosional**: Menghadirkan perayaan digital yang hangat, intim, penuh kenangan nyata, dan berkesan mendalam tanpa kesan template AI buatan mesin.

---

## 2. Identitas Warna & Simbolisme
Web ini menggunakan palet dualitas warna yang memiliki makna personal:
- **Merah Cinta (`#e63946`, `#ff758f`, `#d90429`)**:
  Melambangkan cinta mendalam, ketulusan, kehangatan rasa, dan komitmen tanpa batas.
- **Biru Keceriaan (`#0096c7`, `#48cae4`, `#023e8a`)**:
  Melambangkan kedamaian, tawa, ketenangan jiwa, dan senyuman yang selalu mewarnai hari-hari berdua.
- **Kanvas Gelap Bertabur Bintang (`#070914`, `#121022`, `#141728`)**:
  Menciptakan suasana malam romantis di bawah langit berbintang (starlit night ambient).
- **Aturan Dosis (Dose Cap - R-10, R-13)**:
  - Efek *glow* dan *glassmorphism* hanya diberikan sebagai aksen pada elemen aktif/fokal (misalnya tombol musik saat diputar, kartu foto sorotan utama, dan tombol PIN aktif).
  - Elemen sekunder tetap berpenampilan matte agar hierarki visual tetap jernih dan tidak silau.

---

## 3. Sistem Tipografi
1. **Font Script**: `'Dancing Script', cursive`
   - Digunakan untuk aksen personal, judul logo navbar, dan tanda tangan cinta.
2. **Font Serif Display**: `'Playfair Display', serif`
   - Digunakan untuk judul perayaan utama dan heading section (elegan, abadi, berkelas).
3. **Font Sans Interface**: `'Poppins', sans-serif`
   - Digunakan untuk angka countdown, tombol navigasi, teks cerita, dan kontrol galeri (jelas, modern, mudah dibaca).

---

## 4. Parameter Kehidupan Desain (Liveliness Dials)
- **ENERGY: 2** (Kehangatan Emosional Intim):
  Bukan situs pemasaran korporat yang agresif, melainkan ruang kenangan pribadi yang menenangkan dan menyentuh hati.
- **RHYTHM: 2** (Variasi Struktur Berirama):
  Setiap bagian memiliki bentuk visual unik yang disesuaikan dengan fungsinya:
  - *Gate PIN*: Amplop cinta 3D interaktif.
  - *Hero*: Showcase foto polaroid dengan pita washi tape nyata.
  - *Countdown*: Kotak metrik 4 kolom kompak (Hari, Jam, Menit, Detik).
  - *Lagu Kita*: Vinyl retro berputar dengan pemutar musik interaktif.
  - *7 Alasan Cinta*: Kartu flip 3D bolak-balik yang interaktif.
  - *Galeri Kenangan*: Grid polaroid 2 kolom di smartphone dan fluid multi-kolom di laptop/PC.
  - *Surat Cinta*: Surat bergaya kertas klasik dengan stempel lilin cinta.
- **MOTION: 2** (Animasi Fisik Halus):
  - Menggunakan kurva easing halus `cubic-bezier(0.16, 1, 0.3, 1)` untuk transisi kartu dan lightbox.
  - Mendukung `prefers-reduced-motion` untuk kenyamanan mata dan aksesibilitas.

---

## 5. Standar Anti-Slop & Kualitas (Quality Locks)
- **C-1 & R-16 (Anti-AI Copywriting)**: Bebas dari jargon template AI (seperti "Unlock...", "Elevate...", "Empower..."). Setiap kata menggunakan bahasa Indonesia yang tulus, personal, dan romantis dari hati.
- **C-2 (Fungsionalitas Penuh)**: Setiap tombol memiliki fungsi nyata (audio player, hitung mundur live, simpan foto IndexedDB offline, backup JSON, pemutar lightbox, tombol kamera langsung).
- **R-03 & R-35 (Resilience Responsif)**: Tampilan smartphone portrait bebas dari horizontal overflow (kartu tidak terpotong ke kanan), teruji rapi saat layar diperbesar/landscape/zoom, dan tampilan laptop/PC tetap 100% konsisten.
- **R-32 & WCAG AA**: Memiliki kontras warna teks di atas standar AA (rasio kontras > 4.5:1) dan indikator fokus keyboard `:focus-visible` yang tegas.
