# Kelas Etalase — Squeeze Page Workshop (Portfolio Nauval Dev)

Contoh **Squeeze Page**: halaman satu tujuan untuk mengumpulkan pendaftar workshop gratis
"Foto Produk Pakai HP" bagi UMKM Bandung. Acara, penyelenggara, dan pemateri fiktif.
HTML/CSS/JS biasa, tanpa build tool. Buka `index.html` langsung di browser.

## Fitur
- Tanpa menu navigasi: semua isi mengarah ke satu form
- Form singkat (nama, WhatsApp, jenis usaha, sudah jualan online, persetujuan dihubungi) dengan validasi
- Sisa kuota & "N hari lagi" dihitung dari tanggal acara (teks biasa, tanpa countdown berdetak)
- Setelah daftar: kode peserta, file kalender `.ics` (dengan pengingat H-1), ajak teman (salin link),
  dan konfirmasi WhatsApp ke panitia. Status terdaftar tersimpan di browser
- Di HP, form muncul tepat setelah judul dan detail acara

## Menyimpan pendaftar ke Google Sheets
1. Buat Google Sheet, buka **Extensions → Apps Script**, isi:
   ```js
   function doPost(e) {
     const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     const p = e.parameter;
     sh.appendRow([new Date(), p.name, p.wa, p.biz, p.online]);
     return ContentService.createTextOutput('ok');
   }
   ```
2. **Deploy → Web app**, akses **Anyone**, salin URL `/exec`.
3. Tempel ke `SHEET_URL` di `assets/js/app.js`, isi `WA_NUMBER`, lalu set `DEMO: false`.

## Kredit
Foto “Photographing Donuts” (CC0, via rawpixel).
