# Menjalankan GemaSuara online

## Mengapa login di Vercel gagal?

Build Vite hanya menghasilkan frontend. `server/index.js` adalah server Node yang berjalan terus-menerus; Vercel tidak otomatis menjalankannya. Akibatnya `/api/health` dan `/api/login` mengembalikan 404 teks, bukan JSON.

## Pilihan utama: frontend dan backend pada satu server Node

1. Hubungkan repository ke hosting Node/container yang mendukung proses persisten, HTTPS, dan disk persisten.
2. Build: `npm ci && npm run build`.
3. Start: `npm start`.
4. Set `HOST=0.0.0.0`, `COOKIE_SECURE=true`, dan `DATA_DIR` ke mount disk persisten. Hosting biasanya menyediakan `PORT`.
5. Gunakan satu instance. File JSON dan koneksi live tidak dibagikan antar-replika.
6. Cek `/api/health`: harus mengembalikan `{"ok":true}`.

Dockerfile tersedia sebagai alternatif. Mount volume persisten pada `/app/.data`. Jangan memasukkan folder `.data` atau cookie sesi ke Git.

## Mempertahankan frontend di Vercel

Backend tetap harus dipasang terlebih dahulu di server Node yang disebutkan di atas.

Pada environment backend:

```text
ALLOWED_ORIGINS=https://gema-suara.vercel.app
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
HOST=0.0.0.0
```

Pada environment Vercel, set `VITE_API_BASE_URL` ke origin HTTPS backend yang sebenarnya (tanpa akhiran `/api`), lalu redeploy frontend. Jangan menggunakan URL frontend itu sendiri sebagai alamat backend.

API dan EventSource live memakai alamat ini dan mengirim cookie sesi. Origin diizinkan secara eksplisit, bukan wildcard. Browser yang memblokir cookie lintas situs mungkin menolak sesi; untuk kompatibilitas terbaik gunakan frontend dan backend pada origin yang sama.

Upload ke GitHub tidak menjalankan backend, membuat disk, atau mengisi environment hosting secara otomatis. Jangan menganggap masalah deployment selesai sebelum health endpoint, login, dan kelas live diuji di alamat publik.

## Lokal

Jalankan `npm run dev`, bukan Vite langsung. Untuk hasil build gunakan `npm run build` lalu `npm start` agar API juga aktif. Mikrofon memerlukan HTTPS atau localhost.
