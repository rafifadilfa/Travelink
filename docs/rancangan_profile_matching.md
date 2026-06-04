# Rancangan Algoritma Profile Matching — Smart Open Trip (Travelink)

Dokumen ini menjelaskan rancangan algoritma pencocokan peserta Smart Open Trip
menggunakan metode **Profile Matching (Gap Analysis)**. Dipakai sebagai acuan
penulisan Bab 3 skripsi DAN acuan implementasi kode.

> Catatan: angka bobot, persentase, dan ambang batas di bawah adalah USULAN
> awal yang masuk akal. Nilai final harus kamu tetapkan dan TULIS di laporan,
> lalu kode HARUS mengikuti laporan (jangan sampai beda).

---

## 1. Ringkasan Metode

Profile Matching membandingkan **profil aktual** dengan **profil target**, lalu
menghitung **selisih (gap)**. Makin kecil gap, makin cocok. Hasil akhirnya berupa
**skor kecocokan** yang bisa diranking.

Karena ini pencocokan sesama wisatawan (bukan ke profil tetap), profil target
ditentukan secara dinamis: **target = profil rata-rata/acuan grup yang sedang
terbentuk** (lihat Bagian 4). Dengan begitu tidak ada satu orang istimewa
sebagai patokan, namun metode tetap memiliki "target" sehingga sah disebut
Profile Matching.

---

## 2. Alur Smart Open Trip (Dua Tahap Waiting Room)

1. Wisatawan memilih destinasi + tanggal yang tersedia untuk Smart Open Trip.
2. Wisatawan mengisi profil preferensi (4 kriteria di Bagian 3).
3. **Waiting Room Tahap 1 (tanpa countdown):** peserta masuk "pool" dan
   menunggu. Sistem menjalankan Profile Matching antara peserta ini dengan
   peserta lain di pool destinasi+tanggal yang sama.
4. Saat ditemukan **minimal 2 peserta yang saling kompatibel** (aturan di
   Bagian 6), grup terbentuk.
5. **Waiting Room Tahap 2 (dengan countdown):** anggota grup difinalisasi.
   Selama countdown, anggota bisa melihat profil satu sama lain.
6. Setelah countdown selesai: tampil daftar anggota grup + harga per orang
   (harga paket dibagi jumlah anggota) + proses pembayaran.
7. Halaman grup menampilkan status pembayaran tiap anggota.

---

## 3. Kriteria Penilaian (4 Kriteria)

| No | Kriteria | Tipe | Cara Input | Cara Hitung "Cocok" |
|----|----------|------|------------|---------------------|
| 1 | **Umur** | Numerik | Angka (tahun) | Selisih umur kecil (mis. ≤ 5 tahun) |
| 2 | **Minat** | Kategori | Pilih kategori (pantai, gunung, sejarah, kuliner, dll) | Berbagi minimal 1 kategori yang sama |
| 3 | **Preference** | Set aktivitas | Pilih aktivitas dalam minat (surfing, berenang, naik perahu, dll) | Berbagi minimal 1 aktivitas yang sama |
| 4 | **Budget** | Level/Ordinal | Pilih rentang budget | Selisih level kecil (mis. gap ≤ 1) |

**Contoh level budget:** 1 = <500rb, 2 = 500rb–1jt, 3 = 1–2jt, 4 = 2–5jt, 5 = >5jt.

---

## 4. Profil Target = Acuan Grup (Tanpa Anchor)

Target dihitung dari anggota grup yang sedang terbentuk, bukan satu orang tetap:

- **Umur & Budget (numerik):** target = nilai **rata-rata** anggota grup saat ini.
- **Minat & Preference (kategori/set):** target = **kumpulan kategori/aktivitas
  bersama** grup (irisan atau yang paling umum).

Saat peserta baru ingin bergabung, gap-nya dihitung terhadap acuan grup ini.
Jika pool masih kosong, peserta pertama otomatis menjadi acuan awal; setiap
peserta berikutnya memperbarui rata-rata. Semua peserta setara.

---

## 5. Langkah Perhitungan Profile Matching

### 5a. Pemetaan Gap
Untuk kriteria numerik: `Gap = nilai peserta − nilai acuan grup`.
Untuk kriteria kategori: gap direpresentasikan sebagai cocok / tidak cocok
(berbagi item atau tidak), lalu diberi bobot nilai.

### 5b. Konversi Gap ke Bobot Nilai
Tabel konversi (skala 0–5; gap 0 = paling cocok):

| Selisih Gap | Bobot Nilai |
|-------------|-------------|
| 0 | 5.0 |
| 1 | 4.5 |
| -1 | 4.0 |
| 2 | 3.5 |
| -2 | 3.0 |
| 3 | 2.5 |
| -3 | 2.0 |
| ≥4 / ≤-4 | 1.5 atau kurang |

Untuk kriteria kategori (minat/preference): berbagi item → bobot 5 (cocok),
tidak berbagi → bobot rendah (mis. 1–2).

### 5c. Core Factor & Secondary Factor (USULAN — bisa diubah)
Kriteria dikelompokkan berdasarkan kepentingannya:

- **Core Factor (60%)** — paling menentukan kecocokan grup:
  **Minat + Preference** (kecocokan aktivitas paling memengaruhi kenyamanan grup)
- **Secondary Factor (40%)** — pendukung:
  **Umur + Budget**

Rumus:
- `NCF` (Nilai Core Factor) = rata-rata bobot nilai kriteria core
- `NSF` (Nilai Secondary Factor) = rata-rata bobot nilai kriteria secondary

### 5d. Nilai Total (Skor Kecocokan)
```
Skor = (60% × NCF) + (40% × NSF)
```
Skor ini dipakai untuk ranking & menampilkan "persentase kecocokan".

---

## 6. Aturan Pembentukan Grup

Dua lapis, supaya intuitif sekaligus sah secara metode:

1. **Syarat kompatibel:** peserta dianggap kompatibel dengan grup jika
   **minimal 2 dari 4 kriteria "cocok"** (sesuai kolom terakhir Bagian 3).
   Tidak perlu semua kriteria sama.
2. **Pembentukan grup:** countdown (Tahap 2) dimulai ketika ada **≥ 2 peserta
   yang saling kompatibel** di pool destinasi+tanggal yang sama.
3. **Skor Profile Matching** (Bagian 5d) dipakai untuk mengurutkan & menampilkan
   tingkat kecocokan — peserta dengan skor tertinggi diprioritaskan.

---

## 7. Contoh Perhitungan

**Peserta A (acuan awal):** umur 25, minat {pantai}, preference {surfing, berenang}, budget level 3.

**Peserta B ingin bergabung:** umur 27, minat {pantai}, preference {surfing, snorkeling}, budget level 3.

Hitung terhadap acuan (= profil A):
- Umur: gap = |27−25| = 2 → bobot 3.5 → (≤5 thn) **COCOK**
- Minat: berbagi {pantai} → bobot 5 → **COCOK**
- Preference: berbagi {surfing} → bobot 5 → **COCOK**
- Budget: level 3 vs 3, gap 0 → bobot 5 → **COCOK**

→ 4 kriteria cocok (≥2) ⇒ **B kompatibel**, grup terbentuk → countdown mulai.

Skor:
- NCF = (minat 5 + preference 5) / 2 = 5.0
- NSF = (umur 3.5 + budget 5) / 2 = 4.25
- Skor = (60% × 5.0) + (40% × 4.25) = 3.0 + 1.7 = **4.7 / 5** (≈ 94% cocok)

Setelah B masuk, acuan grup diperbarui: umur rata-rata 26, budget level 3,
minat {pantai}, preference {surfing} (irisan). Peserta C berikutnya dihitung
terhadap acuan baru ini.

---

## 8. Catatan untuk Skripsi (Poin Pertahanan Sidang)

- Tegaskan target profile = **profil acuan/rata-rata grup**, sehingga metode
  tetap Profile Matching meski mencocokkan sesama wisatawan.
- Jelaskan pembagian **Core (Minat+Preference) vs Secondary (Umur+Budget)**
  beserta ALASANNYA (kenapa aktivitas lebih penting dari umur/budget).
- Siapkan jawaban: "kenapa bobot 60/40?", "kenapa ambang ≥2 kriteria?",
  "bagaimana gap dihitung untuk data kategori?".
- Pastikan tabel konversi gap, bobot %, dan ambang batas yang DITULIS di laporan
  SAMA PERSIS dengan yang diimplementasikan di kode.

---

## 9. Catatan Implementasi (untuk tahap kode nanti)

Yang akan dibangun (BELUM dikerjakan di dokumen ini):
- Backend: penyimpanan profil preferensi (4 kriteria), logika pool waiting room,
  fungsi perhitungan Profile Matching, endpoint untuk join pool / cek status grup.
- Frontend: form preferensi, Waiting Room Tahap 1 (status menunggu), Waiting Room
  Tahap 2 (countdown + daftar anggota + profil), halaman harga & pembayaran.
- Pembayaran: ditunda dulu (fokus matching). Saat siap, gunakan Midtrans Sandbox
  atau simulasi sesuai keputusan nanti.
