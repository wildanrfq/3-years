# Panduan Website Anniversary (3-years)

Website statis bertema soft sage untuk merayakan hari jadi, siap dijalankan secara lokal maupun dihost di GitHub Pages (`https://wildanrfq.github.io/3-years/`).

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Lalu buka alamat yang muncul di terminal (bawaan: `http://localhost:5173/3-years/`).

Untuk menguji hasil build produksi di bawah sub-path GitHub Pages:

```bash
npm run build
npm run preview
```

## 1. Mengubah REPO_NAME

Buka file `vite.config.ts` dan ubah konstanta `REPO_NAME` di baris paling atas agar sama persis dengan nama repository GitHub kamu:

```ts
export const REPO_NAME = '3-years';
```

Cukup ubah di satu tempat ini saja. Semua URL aset di aplikasi sudah memakai `import.meta.env.BASE_URL`.

## 2. Mengedit Semua Teks & Foto (`src/config/content.ts`)

Semua teks, label tombol, jadwal, foto, dan surat berada di satu file yaitu `src/config/content.ts` (lengkap dengan komentar penjelas untuk masing-masing menu):

- `partnerName`, `myName`, `siteTitle`, `startDate`: identitas dan tanggal jadian (`+07:00`).
- `SECTION_META`, `pinGate`, `intro`, `hub`, `navigation`, `musicPlayer`: seluruh teks antarmuka, tombol, dan pesan maskot di tiap layar.
- `timeline` & `timelineUi`: momen horizontal dan label di menu **Jejak Kita**.
- `counterUi`: label waktu dan pencapaian di menu **Waktu Bersama**.
- `rewind`: daftar slide cerita (`intro`, `countup`, `photo`, `stat`, `carousel`, `ranking`, `song`, `outro`) di menu **Kilas Balik**.
- `photoCards` & `photoCardsUi`: foto polaroid dan catatan di menu **Kartu Foto**.
- `letter` & `letterUi`: judul, paragraf surat, tanda tangan, dan tombol di menu **Surat Untukmu**.

## 3. Mengganti PIN Rahasia

PIN tidak pernah disimpan sebagai angka asli di kode, melainkan dalam bentuk hash SHA-256. Untuk membuat hash PIN baru, jalankan:

```bash
npm run hash-pin 021223
```

Salin hash yang tercetak di terminal ke field `pin.hash` di `src/config/content.ts`, lalu sesuaikan `pin.length` dan `pin.hint`.

## 4. Menambahkan Lagu MP3 dan Lirik LRC

Saat ini sudah tersedia file audio dan lirik contoh agar alur pemutar lagu langsung bisa diuji. Ganti kedua file berikut dengan file aslimu:

- Audio lagu: `public/audio/sorak-sorai.mp3`
- Lirik tersinkronisasi: `public/lyrics/sorak-sorai.lrc`

Jika ingin memakai nama file lain, sesuaikan `song.audioSrc` dan `song.lrcSrc` di `src/config/content.ts` (tanpa garis miring di depan). Apabila lirik telat atau terlalu cepat, atur `song.lyricsOffsetMs` (dalam milidetik, positif atau negatif). Jika file `.lrc` gagal dimuat atau kosong, bar pemutar hanya akan menampilkan judul lagu dan nama artis.

## 5. Menambahkan dan Mengompres Foto

Simpan foto-fotomu di dalam folder `public/photos/`, lalu perbarui path-nya di `src/config/content.ts` (misalnya `'photos/foto-1.webp'`).

Agar website tetap ringan dan cepat dibuka di HP, disarankan:

- Gunakan format `.webp`.
- Ubah ukuran lebar maksimal menjadi `1600px`.

Jika memiliki `ffmpeg` di komputer, kamu bisa mengompres foto langsung lewat terminal:

```bash
ffmpeg -i input.jpg -vf "scale='min(1600,iw)':-2" -c:v libwebp -quality 82 public/photos/foto-1.webp
```

Atau gunakan layanan kompresi online seperti Squoosh untuk mengekspor ke WebP dengan lebar maksimal `1600px`.

## 6. Deploy ke GitHub Pages

Repository ini sudah dilengkapi workflow otomatis di `.github/workflows/deploy.yml` yang berjalan setiap kali kamu push ke branch `main`.

Langkah pertama kali di GitHub:

1. Pastikan branch `main` sudah ter-push ke repository `wildanrfq/3-years`.
2. Buka repository di GitHub, masuk ke menu **Settings > Pages**.
3. Pada bagian **Build and deployment > Source**, pilih **GitHub Actions**.
4. Buka tab **Actions** dan pastikan workflow **Deploy ke GitHub Pages** berjalan sampai hijau.
5. Setelah selesai, website bisa dibuka di `https://wildanrfq.github.io/3-years/`.
