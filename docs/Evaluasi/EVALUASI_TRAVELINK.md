# Evaluasi Travelink — Black Box Testing, 8 Golden Rules, 5 Faktor Manusia Terukur, SUS

> Sumber: Evaluasi_Travelink_BBT_UI_SUS.xlsx — Program Studi Teknik Informatika, Universitas Bina Nusantara, 2026.
> File ini adalah konversi 1:1 dari Excel agar dapat dibaca oleh Claude Code. Kolom "Actual Output" & "Status" diisi setelah pengujian (PASS / FAIL).

---

## SHEET 1 — BLACK BOX TESTING (TC-001 s/d TC-048)

Kolom: ID | Deskripsi | Precondition | Data Input | Expected Output

### GRUP 1 — AUTENTIKASI
- **TC-001** — Register akun Wisatawan, data lengkap & valid. Pre: belum punya akun. Input: Nama "Ahmad Fauzi"; Email "ahmad@mail.com"; Password "Ahmad1234!"; Telp "081234567890". Expected: Akun dibuat; pesan sukses tampil; diarahkan ke halaman login.
- **TC-002** — Register email sudah terdaftar. Pre: "ahmad@mail.com" sudah ada. Input: email duplikat, data lain valid. Expected: pesan "Email sudah digunakan oleh akun lain".
- **TC-003** — Register format email tidak valid. Input: Email "testtanpaarroba.com". Expected: pesan validasi "Format email tidak valid".
- **TC-004** — Register password < 8 karakter. Input: Password "abc123" (6 karakter). Expected: pesan "Password minimal 8 karakter".
- **TC-005** — Login kredensial valid sebagai Wisatawan. Input: "ahmad@mail.com" / "Ahmad1234!". Expected: login berhasil; diarahkan ke Dashboard Wisatawan.
- **TC-006** — Login valid sebagai Pemandu Wisata. Pre: akun pemandu terverifikasi admin. Input: "pemandu@mail.com" / "Pemandu123!". Expected: login berhasil; diarahkan ke Dashboard Pemandu.
- **TC-007** — Login valid sebagai Administrator. Input: "admin@travelink.id" / "Admin2024!". Expected: login berhasil; diarahkan ke Panel Administrator.
- **TC-008** — Login password salah. Input: "ahmad@mail.com" / "SalahSemua99". Expected: pesan "Email atau kata sandi tidak valid".
- **TC-009** — Logout dari sistem. Pre: sudah login. Input: klik "Logout". Expected: sesi berakhir; token dihapus; diarahkan ke halaman login.

### GRUP 2 — MANAJEMEN PROFIL WISATAWAN
- **TC-010** — Edit profil Wisatawan, data valid. Input: Nama "Ahmad Fauzi S."; Umur 25; Telp "081298765432"; Foto JPG valid. Expected: data diperbarui; pesan "Profil berhasil disimpan".
- **TC-011** — Edit profil, field nama dikosongkan. Expected: pesan validasi "Nama tidak boleh kosong".
- **TC-012** — Update preferensi wisata untuk Smart Open Trip. Input: Destinasi "Yogyakarta"; Budget Rp500.000; Minat Fotografi, Alam. Expected: preferensi tersimpan; siap dipakai Profile Matching.
- **TC-013** — Upload foto profil, format & ukuran valid. Input: foto.jpg, 1.2 MB. Expected: foto terupload & tampil di halaman profil.

### GRUP 3 — REGISTRASI & VERIFIKASI PEMANDU
- **TC-014** — Pemandu isi KYC, dokumen lengkap. Input: nama, no KTP, foto KTP (JPG <2MB), sertifikat, deskripsi diri. Expected: data tersimpan; status akun → "Menunggu Verifikasi Admin".
- **TC-015** — Pemandu isi KYC, foto KTP tidak diupload. Expected: pesan "Foto KTP wajib diupload".
- **TC-016** — Admin menyetujui verifikasi pemandu. Pre: ada 1 permohonan "Menunggu". Input: klik "Setujui". Expected: status pemandu → "Terverifikasi"; pemandu dapat membuat paket.
- **TC-017** — Admin menolak verifikasi pemandu. Input: klik "Tolak"; alasan "Dokumen KTP tidak terbaca". Expected: status → "Ditolak"; **notifikasi alasan penolakan dikirim ke pemandu**.
- **TC-018** — Pemandu belum terverifikasi mencoba buat paket. Pre: status "Menunggu Verifikasi". Expected: pesan "Akun Anda belum terverifikasi. Silakan tunggu proses verifikasi."

### GRUP 4 — MANAJEMEN PAKET WISATA (PEMANDU)
- **TC-019** — Buat paket baru, semua data valid. Input: Nama "Explore Bromo 2D1N"; Destinasi Probolinggo; Harga Rp750.000; Kapasitas 10; Tanggal valid; Foto valid. Expected: paket disimpan & tampil di halaman discover.
- **TC-020** — Buat paket, field harga dikosongkan. Expected: pesan "Harga paket wajib diisi".
- **TC-021** — Edit paket yang sudah ada. Input: harga Rp750.000 → Rp850.000; ubah deskripsi. Expected: perubahan tersimpan & diperbarui di platform.
- **TC-022** — Hapus paket, TIDAK ada booking aktif. Input: klik "Hapus" + konfirmasi. Expected: paket terhapus; tidak tampil lagi.
- **TC-023** — Hapus paket, ADA booking aktif (status "Confirmed"). Expected: pesan "Paket tidak dapat dihapus karena terdapat booking aktif".

### GRUP 5 — PENCARIAN & FILTER
- **TC-024** — Pencarian paket berdasarkan keyword valid. Input: Keyword "Bali". Expected: daftar paket relevan dengan "Bali" tampil.
- **TC-025** — Filter paket berdasarkan rentang harga. Input: Rp200.000 – Rp500.000. Expected: hanya paket dalam rentang itu tampil.
- **TC-026** — Pencarian keyword tidak ditemukan. Input: "xxxxxxxxxzzzz". Expected: pesan "Tidak ada hasil yang ditemukan".
- **TC-027** — Lihat detail paket wisata. Input: klik kartu "Explore Bromo 2D1N". Expected: halaman detail lengkap: deskripsi, harga, jadwal, lokasi, profil pemandu, ulasan.

### GRUP 6 — PEMESANAN REGULAR TRIP
- **TC-028** — Booking Regular Trip, data input valid. Input: pilih tanggal; jumlah peserta 2; tipe Regular; klik "Pesan Sekarang". Expected: request booking terkirim ke pemandu; status "Pending Konfirmasi Pemandu".
- **TC-029** — Pemandu menerima booking. Pre: ada booking "Pending". Input: klik "Terima Pesanan". Expected: status → "Confirmed"; **wisatawan dapat notifikasi** & diarahkan ke halaman pembayaran.
- **TC-030** — Pemandu menolak booking. Input: klik "Tolak Pesanan". Expected: status → "Ditolak"; **notifikasi penolakan dikirim ke wisatawan**.
- **TC-031** — Wisatawan membatalkan booking (status pending). Input: My Bookings → "Batalkan" + konfirmasi. Expected: status booking → "Dibatalkan".
- **TC-032** — Lihat riwayat booking selesai (Past Bookings). Input: My Bookings → tab "Riwayat/Past". Expected: daftar booking selesai tampil; tersedia opsi **"Pesan Lagi"**.

### GRUP 7 — FITUR SMART OPEN TRIP
- **TC-033** — Booking Smart Open Trip, input preferensi valid. Input: Destinasi Yogyakarta; Tanggal 15 Juli 2026; Budget Rp500.000; Minat Fotografi, Kuliner; Tipe Smart Open Trip. Expected: request OT diterima; masuk Waiting Room; sistem mulai matching.
- **TC-034** — Algoritma Profile Matching, perhitungan gap. Pre: WR punya ≥2 wisatawan dengan preferensi. Input: A (Budget 500K, Fotografi); B (Budget 450K, Fotografi+Kuliner). Expected: sistem menghitung nilai gap; menghasilkan compatibility score tiap pasangan.
- **TC-035** — Waiting Room, kuota peserta belum terpenuhi. Pre: 1 dari 4 peserta minimum. Expected: WR menampilkan "Menunggu 3 peserta lagi"; progress bar tampil.
- **TC-036** — Waiting Room, kuota minimum terpenuhi. Input: peserta ke-4 bergabung (kuota min = 4). Expected: **notifikasi dikirim ke pemandu**; pemandu dapat konfirmasi grup.
- **TC-037** — Pemandu mengkonfirmasi grup Smart Open Trip. Input: klik "Konfirmasi Grup". Expected: **semua peserta OT mendapat notifikasi** & diarahkan ke halaman pembayaran.
- **TC-038** — Pembayaran setelah konfirmasi grup. Pre: grup dikonfirmasi; di halaman pembayaran. Input: pilih metode; klik "Bayar Sekarang". Expected: simulasi pembayaran berhasil; status → "Confirmed & Paid".

### GRUP 8 — PEMBAYARAN (SIMULASI)
- **TC-039** — Proses pembayaran Regular Trip berhasil. Pre: status "Confirmed by Guide"; di halaman payment. Input: pilih metode; klik "Bayar Sekarang". Expected: simulasi sukses; status → "Paid"; halaman konfirmasi tampil.
- **TC-040** — Batalkan di halaman pembayaran. Input: klik "Batal". Expected: kembali ke My Bookings; status tetap "Confirmed (Menunggu Pembayaran)".
- **TC-041** — Lihat riwayat transaksi. Pre: punya ≥1 transaksi. Input: menu "Riwayat Transaksi". Expected: daftar transaksi tampil dengan detail nominal, tanggal, metode, status.

### GRUP 9 — ULASAN & RATING
- **TC-042** — Submit ulasan & rating, data lengkap. Pre: booking "Completed". Input: Rating 5 bintang; Teks "Pemandu sangat profesional dan ramah!". Expected: ulasan tersimpan; tampil di profil pemandu dengan rating bintang.
- **TC-043** — Submit ulasan, hanya rating tanpa teks. Input: Rating 4 bintang; teks dikosongkan. Expected: ulasan rating-only berhasil disimpan (teks opsional).
- **TC-044** — Lihat daftar ulasan di profil pemandu. Pre: ada ≥1 ulasan. Input: akses halaman profil pemandu. Expected: daftar ulasan tampil; rating rata-rata dihitung & ditampilkan.

### GRUP 10 — FITUR ADMINISTRATOR
- **TC-045** — Admin melihat daftar semua pengguna. Input: menu "Manajemen Pengguna". Expected: tabel semua pengguna (nama, email, peran, status).
- **TC-046** — Admin melihat daftar permohonan verifikasi pemandu. Pre: ada pemandu "Menunggu Verifikasi". Input: menu "Verifikasi Pemandu". Expected: daftar pemandu menunggu verifikasi; tombol "Setujui" & "Tolak".
- **TC-047** — Admin approve verifikasi (validasi tampilan). Input: klik "Setujui" pada "Budi Santoso". Expected: status → "Terverifikasi"; item hilang dari antrian; konfirmasi tampil.
- **TC-048** — Admin reject verifikasi dengan alasan. Input: klik "Tolak"; alasan "Foto KTP buram, harap upload ulang". Expected: status → "Ditolak"; alasan tercatat; **notifikasi dikirim ke pemandu**.

> TC yang menuntut sistem notifikasi: **TC-017, TC-029, TC-030, TC-036, TC-037, TC-048**.

---

## SHEET 2 — 8 GOLDEN RULES (Shneiderman, 2016) — Nilai 1–5
Skala: 1=Tidak Diterapkan, 2=Sangat Kurang, 3=Cukup, 4=Baik, 5=Sangat Baik.

1. **Konsistensi** — Tata letak navigasi (header/sidebar/footer) konsisten di seluruh halaman; warna tombol seragam (biru=aksi utama, merah=hapus/batal); tipografi & spacing satu design system. Dievaluasi: semua halaman (Dashboard Wisatawan/Pemandu, Detail Paket, My Bookings).
2. **Universal Usability / Shortcut** — Tombol "Pesan Lagi" di Past Bookings; filter tersimpan di sesi; search dengan autocomplete. Dievaluasi: My Bookings (Past), Explore/Search.
3. **Umpan Balik Informatif** — Tiap aksi (submit, booking, pembayaran) → notifikasi toast/alert spesifik; loading spinner saat proses; pesan error menjelaskan penyebab spesifik. Dievaluasi: registrasi, booking, pembayaran, upload KYC.
4. **Dialog Menghasilkan Penutupan** — Alur booking bertahap (Pilih Paket → Input Data → Konfirmasi → Pembayaran → Selesai) dengan halaman konfirmasi tiap akhir tahap; halaman sukses menampilkan ringkasan. Dievaluasi: alur Regular Trip, Smart Open Trip, registrasi KYC.
5. **Pencegahan & Penanganan Error** — Validasi form sebelum submit (format email, field wajib, batas karakter); dialog konfirmasi sebelum aksi destruktif (hapus paket, batalkan booking); pesan error spesifik per field. Dievaluasi: registrasi, buat paket, booking, hapus data.
6. **Pembalikan Aksi** — Booking "Pending" dapat dibatalkan wisatawan; perubahan profil dapat diurungkan via "Batal" sebelum disimpan; konfirmasi dua langkah untuk aksi permanen. Dievaluasi: My Bookings, edit profil, buat/edit paket.
7. **Pusat Kendali Internal** — Pemandu kendali penuh paket (buat/edit/hapus/terima/tolak booking); wisatawan memilih tipe trip, tanggal, membatalkan pesanan. Dievaluasi: Dashboard Pemandu & Wisatawan.
8. **Kurangi Beban Memori Jangka Pendek** — Info booking ditampilkan ulang di halaman konfirmasi; breadcrumb menunjukkan posisi; ikon dengan label teks. Dievaluasi: halaman konfirmasi booking, breadcrumb, Waiting Room OT.

---

## SHEET 3 — 5 FAKTOR MANUSIA TERUKUR (Shneiderman, 2016)

1. **Waktu Belajar (Time to Learn)** — Partisipan baru menyelesaikan 3 tugas: (1) cari paket di Bali; (2) booking Regular Trip; (3) gabung Smart Open Trip. Metode: observasi langsung, stopwatch per tugas, rata-rata ≥5 partisipan, tanpa panduan verbal.
2. **Kecepatan Kinerja (Speed of Performance)** — Partisipan yang sudah pakai ≥2 kali menyelesaikan alur: Login → Cari paket → Booking → Konfirmasi. Metode: waktu per sub-tugas (detik), dibandingkan dengan pengguna baru.
3. **Tingkat Kesalahan (Rate of Errors)** — Catat jumlah & jenis error: salah klik, salah isi form, navigasi salah, input ditolak, tindakan yang perlu diulang. Metode: pencatatan frekuensi error per tugas; kategorisasi slip/mistake/lapse.
4. **Retensi Seiring Waktu (Retention Over Time)** — Partisipan kembali 1 minggu kemudian tanpa pelatihan ulang, kerjakan tugas yang sama. Metode: pre-test vs post-test (jeda 1 minggu); bandingkan waktu & error; kuesioner self-assessment.
5. **Kepuasan Subjektif (Subjective Satisfaction)** — Setelah semua tugas, isi kuesioner SUS 10 item; skor 0–100. Kategori: Excellent ≥80.3 | Good 68–80.3 | OK 51–67 | Poor ≤50. Metode: kuesioner SUS + wawancara singkat.

---

## SHEET 4 — KUESIONER SUS
Skala 1–5 (1=Sangat Tidak Setuju … 5=Sangat Setuju). Ganjil (1,3,5,7,9) positif: skor = nilai − 1. Genap (2,4,6,8,10) negatif: skor = 5 − nilai. Total SUS = jumlah skor × 2,5 (rentang 0–100).

1. Saya rasa saya akan sering menggunakan sistem Travelink ini.
2. Saya merasa sistem ini terlalu kompleks tanpa alasan yang jelas.
3. Saya merasa sistem Travelink mudah digunakan.
4. Saya rasa memerlukan bantuan orang teknis untuk dapat menggunakan sistem ini.
5. Saya menemukan bahwa berbagai fitur sistem ini terintegrasi dengan baik.
6. Saya merasa terlalu banyak ketidakkonsistenan dalam sistem ini.
7. Saya bayangkan kebanyakan orang dapat mempelajari sistem ini dengan sangat cepat.
8. Saya merasa sistem ini sangat sulit dan tidak praktis untuk digunakan.
9. Saya merasa sangat percaya diri menggunakan sistem Travelink.
10. Saya perlu mempelajari banyak hal terlebih dahulu sebelum menggunakan sistem ini.

Interpretasi (Bangor, Kortum & Miller 2008): ≥80,3 Excellent (A) | 68–80,2 Good (B) | 51–67 OK (C) | ≤50 Poor (D/F).
