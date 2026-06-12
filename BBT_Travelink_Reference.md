# Black Box Testing – Sistem Marketplace Travelink
**Program Studi Teknik Informatika – Universitas Bina Nusantara – 2026**

> File ini digunakan sebagai referensi pengujian otomatis oleh Claude Code.
> Total: **76 Test Case** mencakup UC-01 s.d. UC-21.
> Kolom **Actual Output** dan **Status** diisi setelah pengujian dilakukan.
> Status: `PASS` = sesuai expected | `FAIL` = tidak sesuai

---

## GRUP 1 – AUTENTIKASI (UC-01, UC-02, UC-10)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 1 | TC-001 | Register akun Wisatawan – data valid (UC-01) | Pengguna belum memiliki akun | Username: "ahmad_fauzi"; Email: "ahmad@mail.com"; Password: "Ahmad1234!"; Konfirmasi Password: "Ahmad1234!" | Akun berhasil dibuat; pesan konfirmasi sukses tampil; pengguna diarahkan ke halaman login |
| 2 | TC-002 | Register Wisatawan – email sudah terdaftar (UC-01 A1) | Email sudah ada di database | Email: "ahmad@mail.com" (duplikat); data lain valid | Sistem menampilkan pesan: "Email sudah digunakan oleh akun lain" |
| 3 | TC-003 | Register Wisatawan – format email tidak valid (UC-01 A2) | Form registrasi terbuka | Email: "testtanpaarroba.com"; data lain valid | Sistem menampilkan pesan validasi: "Format email tidak valid" |
| 4 | TC-004 | Register Wisatawan – password terlalu pendek (UC-01 A2) | Form registrasi terbuka | Password: "abc123" (6 karakter) | Sistem menampilkan pesan: "Password minimal 8 karakter" |
| 5 | TC-005 | Register Wisatawan – password & konfirmasi tidak cocok (UC-01 A2) | Form registrasi terbuka | Password: "Ahmad1234!"; Konfirmasi Password: "Ahmad9999!" | Sistem menampilkan pesan validasi: "Password dan konfirmasi password tidak cocok" |
| 6 | TC-006 | Login – kredensial valid sebagai Wisatawan (UC-02) | Akun wisatawan terdaftar dan aktif | Email: "ahmad@mail.com"; Password: "Ahmad1234!" | Login berhasil; diarahkan ke Dashboard Wisatawan |
| 7 | TC-007 | Login – kredensial valid sebagai Pemandu Wisata (UC-02) | Akun pemandu terdaftar dan status Aktif | Email: "pemandu@mail.com"; Password: "Pemandu123!" | Login berhasil; diarahkan ke Dashboard Pemandu dengan akses penuh |
| 8 | TC-008 | Login – kredensial valid sebagai Administrator (UC-02) | Akun admin tersedia | Email: "admin@travelink.id"; Password: "Admin2024!" | Login berhasil; diarahkan ke Panel Administrator |
| 9 | TC-009 | Login – password salah (UC-02 A1) | Akun "ahmad@mail.com" terdaftar | Email: "ahmad@mail.com"; Password: "SalahSemua99" | Sistem menampilkan pesan: "Email atau kata sandi tidak valid"; tetap di halaman login |
| 10 | TC-010 | Logout – konfirmasi keluar (UC-10) | Pengguna sudah login | Klik tombol "Logout"; pada dialog konfirmasi klik "Ya" | Sesi berakhir; token dihapus; diarahkan ke halaman login |
| 11 | TC-011 | Logout – batalkan logout (UC-10 A1) | Pengguna sudah login; dialog konfirmasi tampil | Klik tombol "Logout"; pada dialog klik "Tidak" | Dialog ditutup; pengguna tetap di halaman saat ini; sesi tidak berakhir |

---

## GRUP 2 – PROFIL WISATAWAN (UC-03)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 12 | TC-012 | Edit profil Wisatawan – data valid (UC-03) | Wisatawan login; di halaman Profil | Klik "Edit Profil"; update informasi; klik "Simpan Perubahan" | Data profil berhasil diperbarui; pesan "Profil berhasil diperbarui" tampil |
| 13 | TC-013 | Edit profil – format data tidak valid (UC-03 A2) | Wisatawan login; mode edit profil | Isi field dengan format tidak valid; klik "Simpan" | Sistem menampilkan pesan validasi yang sesuai; data tidak tersimpan |
| 14 | TC-014 | Edit profil – klik Batal tidak menyimpan (UC-03 A1) | Wisatawan login; mode edit profil | Ubah beberapa field; klik tombol "Batal" | Sistem kembali ke halaman profil tanpa menyimpan; data tetap seperti sebelum edit |

---

## GRUP 3 – REGISTRASI PEMANDU WISATA (UC-11)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 15 | TC-015 | Register sebagai Pemandu Wisata – data valid (UC-11) | Pengguna belum punya akun; di halaman autentikasi | Klik "Daftar sebagai Pemandu Wisata" > "Sign Up"; isi nama lengkap, email, password, konfirmasi password; klik "Daftar" | Akun dibuat dengan status "Belum Diverifikasi"; pesan sukses tampil; diarahkan ke **halaman login untuk masuk manual** (TIDAK auto-login) |
| 16 | TC-016 | Register Pemandu – email sudah terdaftar (UC-11 A1) | Email sudah digunakan akun lain | Isi form dengan email yang sudah terdaftar; klik "Daftar" | Sistem menampilkan pesan: "Email sudah digunakan oleh akun lain" |
| 17 | TC-017 | Register Pemandu – format data tidak valid (UC-11 A2) | Form registrasi pemandu terbuka | Email: "emailtanpaarroba"; password terlalu pendek | Sistem menampilkan pesan validasi; pendaftaran tidak diproses |
| 18 | TC-018 | Pemandu baru login – dashboard akses terbatas & banner KYC (UC-11 catatan) | Pemandu berhasil daftar; belum selesaikan UC-12 | Login manual dengan kredensial pemandu baru | Login berhasil; masuk Dashboard Pemandu; banner "Lengkapi profil dan verifikasi dokumen" tampil; menu Paket Wisata/Pesanan/Keuangan tidak dapat diakses |

---

## GRUP 4 – KYC & VERIFIKASI PEMANDU (UC-12, UC-18)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 19 | TC-019 | Isi profil profesional pemandu – data valid (UC-12 S-1) | Pemandu login; status "Belum Diverifikasi"; akses halaman Verifikasi Akun | Isi Tahap 1: foto profil, bio, bahasa yang dikuasai, spesialisasi destinasi, tahun pengalaman, **tarif dasar**; klik "Simpan & Lanjut" | Data profil profesional tersimpan; sistem mengarahkan ke Tahap 2 (Upload Dokumen KYC) |
| 20 | TC-020 | Upload dokumen KYC – semua dokumen diunggah (UC-12 S-2) | Pemandu selesai Tahap 1; di Tahap 2 | Upload foto KTP (JPG, valid); upload foto selfie bersama KTP (JPG, valid); upload **portofolio trip** (opsional); klik "Kirim untuk Diverifikasi" | Dokumen terupload; status akun berubah "Menunggu Verifikasi"; notifikasi ke Administrator |
| 21 | TC-021 | KYC – format atau ukuran file tidak sesuai (UC-12 A2) | Pemandu di Tahap 2 upload dokumen | Upload file PDF atau ukuran melebihi batas sebagai foto KTP | Sistem menampilkan pesan error format/ukuran; file tidak diterima; tombol "Kirim" tetap terkunci |
| 22 | TC-022 | Pemandu belum terverifikasi mencoba akses fitur terbatas | Pemandu login; status "Menunggu Verifikasi" atau "Belum Diverifikasi" | Akses menu "Paket Wisata" atau "Pesanan" atau "Keuangan" | Sistem menampilkan pesan bahwa fitur tidak dapat diakses sebelum diverifikasi |
| 23 | TC-023 | Admin menyetujui verifikasi KYC pemandu (UC-18) | Admin login; ada pengajuan KYC "Menunggu Verifikasi" | Admin akses "Verifikasi KYC"; buka detail; klik "Setujui Verifikasi" | Status akun pemandu berubah **"Aktif"**; pemandu mendapat notifikasi; semua fitur dapat diakses |
| 24 | TC-024 | Admin menolak verifikasi KYC + alasan (UC-18 A1) | Admin login; ada KYC dengan dokumen tidak valid | Admin klik "Tolak"; isi alasan: "Foto KTP tidak terbaca"; kirim | Status berubah "Ditolak"; notifikasi + alasan dikirim ke pemandu; pemandu dapat ajukan ulang |

---

## GRUP 5 – PROFIL PEMANDU WISATA (UC-13)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 25 | TC-025 | Edit profil pemandu – data valid (UC-13) | Pemandu login status "Aktif"; akses menu "Profil Saya" | Klik "Edit Profil"; update bio, bahasa, spesialisasi, tarif dasar, rekening bank; klik "Simpan" | Perubahan tersimpan; pesan "Profil berhasil diperbarui" tampil |
| 26 | TC-026 | Edit profil pemandu – klik Batal tidak menyimpan (UC-13 A1) | Pemandu login; mode edit profil | Ubah beberapa field; klik "Batal" | Sistem kembali ke profil tanpa menyimpan; data tetap seperti sebelumnya |
| 27 | TC-027 | Edit profil pemandu – data tidak valid (UC-13 A2) | Pemandu login; mode edit profil | Isi rekening bank dengan karakter tidak valid; klik "Simpan" | Sistem menampilkan pesan validasi yang sesuai; perubahan tidak tersimpan |

---

## GRUP 6 – MANAJEMEN PAKET WISATA (UC-14)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 28 | TC-028 | Buat paket wisata baru – semua data valid termasuk jadwal (UC-14) | Pemandu login status "Aktif" | Nama, Deskripsi, Destinasi, Kapasitas: 10, Harga: Rp750.000, Tipe: Reguler, **Jadwal ketersediaan: Senin/Kamis/Sabtu**, Foto; klik "Terbitkan Paket" | Paket berhasil diterbitkan dengan jadwal; tampil di katalog; pesan "Paket berhasil diterbitkan" muncul |
| 29 | TC-029 | Buat paket wisata – field harga dikosongkan (UC-14 A1) | Pemandu terverifikasi; form terbuka | Isi semua field kecuali Harga; klik "Terbitkan" | Sistem menampilkan pesan: "Harga paket wajib diisi" |
| 30 | TC-030 | Buat paket wisata – tidak ada hari ketersediaan dipilih (UC-14 A1) | Pemandu terverifikasi; form terbuka | Isi semua field lengkap tapi tidak pilih hari ketersediaan; klik "Terbitkan" | Sistem menampilkan pesan: "Pilih minimal satu hari ketersediaan paket" |
| 31 | TC-031 | Edit paket wisata yang sudah ada (UC-14 S-1) | Pemandu terverifikasi; paket sudah terdaftar | Klik "Edit"; ubah harga Rp750.000 → Rp850.000; tambah hari Jumat; klik "Simpan" | Perubahan tersimpan; data dan jadwal ketersediaan diperbarui di platform |
| 32 | TC-032 | Hapus paket wisata – tidak ada booking aktif (UC-14 S-2) | Paket tidak punya booking aktif | Klik "Hapus"; pada dialog konfirmasi klik "Ya, Hapus" | Paket berhasil dihapus; tidak tampil di katalog; pesan "Paket berhasil dihapus" muncul |
| 33 | TC-033 | Hapus paket wisata – ada booking aktif (UC-14 A2) | Paket punya pesanan aktif | Klik "Hapus" pada paket dengan booking aktif | Sistem menampilkan **peringatan** bahwa paket tidak dapat dihapus dan **menyarankan nonaktifkan** paket terlebih dahulu |

---

## GRUP 7 – PENCARIAN & EKSPLORASI (UC-04)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 34 | TC-034 | Tampilan beranda – featured content tampil (UC-04) | Wisatawan login; ada data paket dan pemandu | Akses halaman utama Travelink | Beranda tampil dengan featured destinations, paket trending, dan pemandu top-rated |
| 35 | TC-035 | Pencarian paket berdasarkan keyword valid (UC-04) | Wisatawan login; ada data paket | Masukkan keyword "Bali"; klik "Cari" | Daftar paket wisata relevan tampil; info ringkas tiap paket ada |
| 36 | TC-036 | Filter paket berdasarkan rentang harga (UC-04) | Wisatawan login; halaman explore terbuka | Set filter harga: Rp200.000 – Rp500.000 | Hanya paket dalam rentang harga tersebut yang tampil |
| 37 | TC-037 | Pencarian – tidak ada hasil ditemukan (UC-04 A1) | Wisatawan login | Keyword: "xxxxxxxxxzzzz" | Sistem tampilkan pesan: "Tidak ada hasil yang cocok"; saran filter alternatif muncul |
| 38 | TC-038 | Lihat detail paket via profil pemandu (UC-04 S-1) | Wisatawan login; ada profil pemandu dengan paket | Klik profil pemandu dari hasil pencarian; pilih satu paket | Halaman detail paket lengkap tampil: deskripsi, harga, durasi, **jadwal ketersediaan**, info pemandu, ulasan |

---

## GRUP 8 – PEMESANAN TUR REGULER (UC-05, UC-15)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 39 | TC-039 | Kalender ketersediaan – pilih tanggal tersedia (UC-05) | Wisatawan login; halaman detail paket dengan jadwal tersedia | Klik "Pesan Tur Reguler (Private)"; pilih tanggal tersedia di kalender | Tanggal berhasil dipilih; lanjut ke form detail pesanan |
| 40 | TC-040 | Kalender ketersediaan – tidak ada tanggal tersedia (UC-05 A1) | Paket tidak punya jadwal tersedia dalam waktu dekat | Klik "Pesan Tur Reguler (Private)" | Sistem tampilkan pesan: "Tidak ada jadwal tersedia"; saran coba paket lain |
| 41 | TC-041 | Booking Regular Trip – data pesanan valid (UC-05) | Wisatawan login; tanggal sudah dipilih | Isi jumlah peserta: 2; klik "Konfirmasi Pesanan" | Pesanan dibuat status **"Menunggu Konfirmasi Pemandu"**; notifikasi ke pemandu; wisatawan dapat konfirmasi terkirim |
| 42 | TC-042 | Booking Regular Trip – data tidak lengkap (UC-05 A2) | Wisatawan login; tanggal dipilih | Kosongkan field jumlah peserta; klik "Konfirmasi Pesanan" | Sistem menampilkan pesan validasi; pesanan tidak diproses |
| 43 | TC-043 | Pemandu menerima pesanan → status Menunggu Pembayaran (UC-15) | Pemandu login; ada pesanan "Menunggu Konfirmasi Pemandu" | Pemandu akses detail pesanan; klik "Terima Pesanan" | Status berubah **"Menunggu Pembayaran"**; notifikasi + batas waktu bayar dikirim ke wisatawan |
| 44 | TC-044 | Pemandu menolak pesanan + alasan wajib (UC-15 A1) | Pemandu login; ada pesanan "Menunggu Konfirmasi Pemandu" | Klik "Tolak Pesanan"; isi alasan: "Jadwal penuh"; klik "Kirim" | Status berubah "Ditolak"; notifikasi + alasan dikirim ke wisatawan |
| 45 | TC-045 | Batas 24 jam konfirmasi pemandu terlewat – auto-cancel (UC-15 A2) | Pesanan "Menunggu Konfirmasi"; 24 jam berlalu tanpa aksi | Simulasi: waktu 24 jam terlewat | Sistem otomatis ubah status "Dibatalkan Otomatis"; notifikasi pembatalan ke wisatawan |
| 46 | TC-046 | Wisatawan batalkan booking status pending (UC-08) | Wisatawan login; booking "Menunggu Konfirmasi Pemandu" | My Bookings > Upcoming; klik "Batalkan"; konfirmasi | Status booking berubah "Dibatalkan" |

---

## GRUP 9 – PEMBAYARAN MIDTRANS (UC-07)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 47 | TC-047 | Pembayaran via Midtrans Snap – berhasil (UC-07) | Booking "Menunggu Pembayaran"; wisatawan di Upcoming Bookings | Klik "Bayar Sekarang" > "Bayar via Midtrans"; pilih Transfer Bank di Snap; selesaikan pembayaran | Midtrans kirim **webhook callback**; status berubah **"Terkonfirmasi"**; notifikasi ke wisatawan dan pemandu; halaman sukses tampil |
| 48 | TC-048 | Midtrans Snap ditutup tanpa menyelesaikan pembayaran (UC-07 A1) | Wisatawan di halaman Midtrans Snap | Tutup Midtrans Snap popup tanpa selesaikan pembayaran | Snap ditutup; status tetap "Menunggu Pembayaran"; wisatawan dapat coba bayar lagi |
| 49 | TC-049 | Batas waktu pembayaran 24 jam terlewat – auto-cancel (UC-07 A2) | Pesanan "Menunggu Pembayaran"; 24 jam berlalu | Simulasi: batas 24 jam terlewat | Sistem batalkan otomatis; notifikasi ke wisatawan; status "Dibatalkan Otomatis" |
| 50 | TC-050 | Lihat Past Bookings – riwayat perjalanan selesai (UC-08 S-1) | Wisatawan punya minimal 1 perjalanan "Selesai" | Akses "My Bookings"; pilih tab "Past Bookings" | Daftar perjalanan selesai tampil; tersedia tombol "Tulis Ulasan" per perjalanan |

---

## GRUP 10 – SMART OPEN TRIP (UC-06, UC-08 S-3)

> **PENTING – Alur SOT yang benar:**
> 1. Wisatawan buka detail paket → klik "Bergabung Smart Open Trip"
> 2. Pilih tanggal dari kalender
> 3. Isi preferensi SOT (umur, minat wisata, preferensi destinasi, budget)
> 4. Klik "Join Smart Open Trip" → masuk **Waiting Room Kosong** (Profile Matching mulai)
> 5. Sistem temukan match → pindah ke **Waiting Room Countdown** (ada timer)
> 6. Countdown habis → tampil info peserta + tombol "Konfirmasi Keikutsertaan" + **6 jam** window
> 7. Wisatawan klik konfirmasi dalam 6 jam
> 8. Setelah 6 jam: yang tidak konfirmasi dikeluarkan → pesanan dikirim ke pemandu via UC-15
> 9. Pemandu terima/tolak via UC-15 → wisatawan bayar via UC-07

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 51 | TC-051 | Bergabung Smart OT – isi preferensi & masuk Waiting Room Kosong (UC-06) | Wisatawan login; paket SOT tersedia; buka halaman detail paket | Klik "Bergabung Smart Open Trip"; pilih tanggal dari kalender; isi preferensi (umur, minat wisata, preferensi destinasi, budget); klik "Join Smart Open Trip" | Preferensi tervalidasi; wisatawan masuk Waiting Room Kosong; status "Mencari Kecocokan"; Profile Matching mulai berjalan di background |
| 52 | TC-052 | Keluar dari Waiting Room Kosong secara manual (UC-06 A2) | Wisatawan di Waiting Room Kosong; status "Mencari Kecocokan" | Akses detail pesanan SOT; klik "Keluar dari Smart Open Trip" | Wisatawan dihapus dari antrian; konfirmasi tampil; status berubah "Dibatalkan" |
| 53 | TC-053 | Sistem temukan match → masuk Waiting Room Countdown (UC-06 step 6-8) | Wisatawan di Waiting Room Kosong; Profile Matching temukan match | Simulasi: sistem temukan minimal 1 kecocokan | Wisatawan pindah ke Waiting Room Countdown; countdown timer tampil; status "Dalam Smart Open Trip – Menunggu Countdown" |
| 54 | TC-054 | Wisatawan tidak dapat keluar saat Waiting Room Countdown (UC-08 S-3 step 4) | Wisatawan di fase Waiting Room Countdown | Akses detail pesanan SOT saat status "Menunggu Countdown" | Halaman tampilkan info peserta dan countdown timer; **tombol "Keluar" tidak tersedia** |
| 55 | TC-055 | Countdown berakhir – tampil info peserta & tombol Konfirmasi (UC-06 step 9-10) | Countdown timer habis | Simulasi: countdown berakhir | Sistem tampilkan info lengkap semua peserta (umur, minat, preferensi, budget); tombol "Konfirmasi Keikutsertaan" muncul + countdown 6 jam; status "Menunggu Konfirmasi Keikutsertaan" |
| 56 | TC-056 | Wisatawan klik Konfirmasi Keikutsertaan dalam 6 jam (UC-06 step 12-13) | Status "Menunggu Konfirmasi Keikutsertaan"; 6 jam belum habis | Tinjau info peserta; klik "Konfirmasi Keikutsertaan" | Konfirmasi tercatat; pesan konfirmasi tampil; status pesanan diperbarui |
| 57 | TC-057 | Batas 6 jam habis – ada yang konfirmasi → kirim ke pemandu (UC-06 step 14-18) | Minimal 1 peserta konfirmasi; 6 jam habis | Simulasi: 6 jam berakhir dengan ada peserta yang konfirmasi | Peserta yang tidak konfirmasi dikeluarkan; Hasil Akhir dibuat; pesanan dikirim ke pemandu via UC-15; status "Menunggu Konfirmasi Pemandu" |
| 58 | TC-058 | Batas 6 jam habis – tidak ada yang konfirmasi → SOT dibatalkan (UC-06 A3) | Tidak ada yang konfirmasi; 6 jam habis | Simulasi: 6 jam berakhir tanpa ada konfirmasi | Smart OT dibatalkan; notifikasi pembatalan ke seluruh peserta; status "Dibatalkan" |

---

## GRUP 11 – ULASAN & RATING (UC-09, UC-16)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 59 | TC-059 | Submit ulasan – rating + teks untuk Pemandu DAN Paket Wisata (UC-09) | Wisatawan login; booking "Selesai"; klik "Tulis Ulasan" di Past Bookings | Rating bintang 5 + teks untuk Pemandu; rating bintang 4 + teks untuk **Paket Wisata**; klik "Kirim Ulasan" | **Kedua ulasan** tersimpan; rating rata-rata Pemandu diperbarui; rating rata-rata Paket Wisata diperbarui; tampil di halaman detail pemandu DAN halaman detail paket |
| 60 | TC-060 | Submit ulasan – hanya rating bintang tanpa teks (UC-09) | Wisatawan login; booking "Selesai" | Rating 4 untuk Pemandu; rating 3 untuk Paket; teks dikosongkan; klik "Kirim" | Ulasan rating-only tersimpan untuk kedua entitas; teks ulasan bersifat opsional |
| 61 | TC-061 | Submit ulasan – field rating dikosongkan (UC-09 A1) | Wisatawan login; booking "Selesai" | Isi rating Pemandu tapi kosongkan rating Paket Wisata; klik "Kirim" | Sistem menampilkan validasi: semua field rating wajib diisi; ulasan tidak tersimpan |
| 62 | TC-062 | Tombol Tulis Ulasan tidak tampil jika status bukan Selesai (UC-09 A2) | Wisatawan punya booking "Terkonfirmasi" (bukan Selesai) | Akses detail booking di Past Bookings | Tombol "Tulis Ulasan" **tidak ditampilkan** |
| 63 | TC-063 | Pemandu akses Ulasan & Rating – ada ulasan (UC-16) | Pemandu login; ada minimal 1 ulasan | Akses menu "Ulasan & Rating" dari dashboard pemandu | Ringkasan rating tampil (rata-rata + distribusi 1-5); daftar ulasan tampil dengan rating, teks, nama wisatawan, tanggal |
| 64 | TC-064 | Pemandu Ulasan & Rating – belum ada ulasan (UC-16 A1) | Pemandu login; belum ada ulasan | Akses menu "Ulasan & Rating" | Sistem tampilkan pesan: "Belum ada ulasan untuk profil Anda" |

---

## GRUP 12 – PESANAN & KEUANGAN PEMANDU (UC-20, UC-21, UC-17)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 65 | TC-065 | Pemandu akses Pesanan Aktif – daftar dengan status tampil (UC-20 S-1) | Pemandu login "Aktif"; ada pesanan aktif | Akses menu "Pesanan"; pilih tab "Pesanan Aktif" | Daftar pesanan aktif tampil dengan status: Menunggu Konfirmasi / Menunggu Pembayaran / Terkonfirmasi |
| 66 | TC-066 | Pemandu akses Riwayat Pesanan (UC-20 S-2) | Pemandu login; ada pesanan selesai | Akses "Pesanan"; pilih tab "Riwayat Pesanan" | Daftar pesanan selesai tampil dengan info: tanggal, paket, wisatawan, nominal |
| 67 | TC-067 | Tab Pesanan Aktif kosong – pesan kosong tampil (UC-20 A1) | Pemandu login; tidak ada pesanan aktif | Akses "Pesanan"; pilih tab "Pesanan Aktif" | Sistem tampilkan pesan: "Belum ada pesanan aktif" |
| 68 | TC-068 | Pemandu akses Dashboard Keuangan – data lengkap tampil (UC-21) | Pemandu login "Aktif"; ada riwayat transaksi | Akses menu "Keuangan" dari dashboard | Dashboard tampil: (a) Saldo Available; (b) Total Penghasilan; (c) Riwayat Transaksi urut terbaru |
| 69 | TC-069 | Dashboard Keuangan – belum ada transaksi (UC-21 A1) | Pemandu login; belum ada transaksi masuk | Akses menu "Keuangan" | Saldo = Rp 0; Total = Rp 0; Riwayat tampilkan pesan "Belum ada transaksi" |
| 70 | TC-070 | Dashboard Keuangan – saldo Rp 0 → tombol Ajukan Pencairan nonaktif (UC-21 A2) | Pemandu login; saldo = Rp 0 | Akses menu "Keuangan"; lihat tombol "Ajukan Pencairan" | Tombol **disabled**; keterangan "Saldo tidak mencukupi untuk pencairan" tampil |
| 71 | TC-071 | Ajukan pencairan dana – saldo mencukupi (UC-17) | Pemandu login; saldo > 0; rekening bank sudah diisi di profil | Klik "Ajukan Pencairan"; isi jumlah; pilih rekening; klik "Ajukan" | Record pencairan dibuat status "Menunggu Verifikasi"; notifikasi ke Admin; konfirmasi pengajuan tampil |
| 72 | TC-072 | Ajukan pencairan – saldo tidak mencukupi (UC-17 A1) | Pemandu login; saldo < jumlah yang diinput | Input jumlah melebihi saldo; klik "Ajukan" | Sistem tampilkan pesan error + info saldo saat ini; pencairan tidak diproses |

---

## GRUP 13 – FITUR ADMINISTRATOR (UC-18, UC-19)

| No | ID | Deskripsi | Precondition | Data Input | Expected Output |
|----|----|-----------|--------------|------------|-----------------|
| 73 | TC-073 | Admin lihat daftar akun Pemandu Wisata | Admin login | Akses menu manajemen pengguna di panel admin | Tabel daftar akun **pemandu wisata saja** (bukan wisatawan) tampil dengan kolom: nama, email, status (Belum Diverifikasi / Menunggu Verifikasi / Aktif / Ditolak) |
| 74 | TC-074 | Admin lihat daftar pengajuan KYC pending (UC-18) | Admin login; ada pemandu "Menunggu Verifikasi" | Akses menu "Verifikasi KYC" | Daftar pengajuan KYC pending tampil; ada tombol detail, setujui, tolak |
| 75 | TC-075 | Admin proses pencairan dana pemandu – valid (UC-19) | Admin login; ada permintaan pencairan "Menunggu Verifikasi" | Akses "Pencairan Dana"; pilih permintaan; verifikasi rekening; klik "Proses Pencairan" | Saldo pemandu berkurang; transaksi dicatat; status "Selesai"; notifikasi ke pemandu |
| 76 | TC-076 | Admin tolak pencairan – data rekening tidak valid (UC-19 A1) | Admin login; ada permintaan pencairan rekening tidak valid | Akses detail permintaan; klik "Tolak"; isi alasan; kirim | Permintaan ditolak; notifikasi + alasan ke pemandu; pemandu diminta perbarui rekening di profil |

---

## Catatan Implementasi untuk Claude Code

### Fitur yang memerlukan Laravel Queue/Scheduler:
- **TC-045**: Auto-cancel pesanan jika pemandu tidak respons 24 jam → `CancelUnconfirmedBookingJob`
- **TC-049**: Auto-cancel pembayaran jika 24 jam tidak dibayar → `CancelUnpaidBookingJob`
- **TC-057/058**: Proses hasil akhir SOT setelah 6 jam window → `ProcessSmartOTResultJob`

### Fitur yang memerlukan perhatian khusus:
- **TC-015**: Register pemandu → redirect ke halaman **login**, BUKAN auto-login
- **TC-043**: Status setelah pemandu terima pesanan = **"Menunggu Pembayaran"** (bukan "Confirmed")
- **TC-047**: Pembayaran via Midtrans Snap → status berubah via **webhook callback**, bukan manual
- **TC-051**: Preferensi SOT diisi saat **join flow**, bukan di halaman profil
- **TC-059**: Form ulasan punya **dua bagian terpisah**: untuk Pemandu DAN untuk Paket Wisata
- **TC-073**: Admin manajemen pengguna hanya tampilkan akun **role pemandu**, bukan wisatawan

### Status Verifikasi Pemandu yang valid:
`Belum Diverifikasi` → `Menunggu Verifikasi` → `Aktif` atau `Ditolak`
