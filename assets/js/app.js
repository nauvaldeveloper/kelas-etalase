/* =========================================================
   KELAS ETALASE — squeeze page pendaftaran workshop
   ========================================================= */
(function () {
  'use strict';

  const CFG = {
    name: 'Kelas Etalase',
    title: 'Workshop Foto Produk Pakai HP',
    venue: 'Ruang serbaguna, Jl. Cihampelas No. 45, Bandung (alamat contoh)',
    start: '09.00', end: '12.00',
    capacity: 40,
    registered: 31,                 // contoh jumlah pendaftar
    DEMO: true,
    WA_NUMBER: '',                  // nomor panitia, format 62…
    SHEET_URL: '',                  // URL Web App Google Apps Script untuk menyimpan pendaftar (lihat README)
    DEV_CONTACT_URL: 'https://ig.me/m/nauval_dev',
    FAQ: [
      ['Benar-benar gratis?', 'Ya, tidak ada biaya pendaftaran maupun biaya tersembunyi. Workshop ini didukung komunitas UMKM setempat.'],
      ['Harus bawa apa?', 'HP dengan kamera yang masih berfungsi baik, baterai penuh, dan satu atau dua produk yang biasa kamu jual.'],
      ['HP saya bukan HP mahal, bisa ikut?', 'Bisa. Semua teknik di kelas memakai kamera bawaan HP biasa, tanpa lensa tambahan atau aplikasi berbayar.'],
      ['Kalau berhalangan hadir?', 'Kabari panitia lewat WhatsApp paling lambat H-1, supaya kursimu bisa diberikan ke peserta daftar tunggu.'],
    ],
  };

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'etalase_reg_v1';
  const pad = (n) => String(n).padStart(2, '0');

  // Tanggal acara contoh: Sabtu pertama yang jaraknya minimal 14 hari dari hari ini.
  const eventDate = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 14); while (d.getDay() !== 6) d.setDate(d.getDate() + 1); return d; })();
  const daysLeft = Math.round((eventDate - new Date(new Date().setHours(0, 0, 0, 0))) / 864e5);
  const dateText = eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (_) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) { /* ignore */ } }

  function seatsLeft(reg) { return Math.max(0, CFG.capacity - CFG.registered - (reg ? 1 : 0)); }

  function renderMeta(reg) {
    $('#eventLine').textContent = `Workshop gratis · ${dateText.split(',')[0]}, ${eventDate.getDate()} ${eventDate.toLocaleDateString('id-ID', { month: 'long' })} · ${daysLeft} hari lagi`;
    $('#meta').innerHTML = [
      `<b>${esc(dateText)}</b>`, `${CFG.start}–${CFG.end} WIB`, 'Bandung, tatap muka', `Kuota ${CFG.capacity} orang`, '<b>Gratis</b>',
    ].map((x) => `<li>${x}</li>`).join('');
    const left = seatsLeft(reg), s = $('#seats');
    s.className = 'seats' + (left <= 10 ? ' seats--low' : '');
    s.innerHTML = left ? `Sisa <b>${left} dari ${CFG.capacity} kursi</b> · ${esc(dateText.split(',')[0])}, ${eventDate.getDate()} ${eventDate.toLocaleDateString('id-ID', { month: 'short' })}` : '<b>Kuota penuh.</b> Daftar untuk masuk daftar tunggu.';
  }

  function code(reg) {
    let h = 0; for (const c of reg.name + reg.wa) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return `KE-${pad(eventDate.getDate())}${pad(eventDate.getMonth() + 1)}-${String(h % 10000).padStart(4, '0')}`;
  }

  function icsUrl() {
    const ymd = `${eventDate.getFullYear()}${pad(eventDate.getMonth() + 1)}${pad(eventDate.getDate())}`;
    const [sh, sm] = CFG.start.split('.'), [eh, em] = CFG.end.split('.');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kelas Etalase//ID', 'BEGIN:VEVENT',
      `UID:${ymd}-kelas-etalase`, `DTSTAMP:${ymd}T000000Z`,
      `DTSTART;TZID=Asia/Jakarta:${ymd}T${sh}${sm}00`, `DTEND;TZID=Asia/Jakarta:${ymd}T${eh}${em}00`,
      `SUMMARY:${CFG.title}`, `LOCATION:${CFG.venue.replace(/,/g, '\\,')}`,
      'DESCRIPTION:Bawa HP dan 1-2 produk. Datang 15 menit lebih awal.',
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Besok workshop foto produk', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  }

  function waMessage(reg) {
    return [`Halo panitia ${CFG.name}, saya sudah daftar ${CFG.title}.`, '',
      `Kode: ${code(reg)}`, `Nama: ${reg.name}`, `Usaha: ${reg.biz}`, `Jualan online: ${reg.online}`, `Tanggal: ${dateText}, ${CFG.start} WIB`, '',
      'Mohon dimasukkan ke grup peserta ya, terima kasih!'].join('\n');
  }

  function renderDone(reg) {
    $('#formWrap').hidden = true;
    const wrap = $('#doneWrap'); wrap.hidden = false;
    const msg = waMessage(reg);
    wrap.innerHTML = `
      <div class="done">
        <h2>Kursimu aman, ${esc(reg.name.split(' ')[0])}.</h2>
        <div class="ticket"><small>Kode peserta</small><b>${code(reg)}</b><span>${esc(dateText)} · ${CFG.start}–${CFG.end} WIB</span></div>
        <ol>
          <li>Simpan jadwal ke kalender HP-mu.</li>
          <li>Kirim konfirmasi ke panitia untuk masuk grup peserta.</li>
          <li>Bawa HP dan 1–2 produk yang biasa kamu jual.</li>
        </ol>
        <div class="done__actions">
          <a class="btn btn--ink btn--sm" href="${icsUrl()}" download="kelas-etalase.ics">Simpan ke kalender</a>
          <button class="btn btn--line btn--sm" type="button" id="copyLink">Ajak teman</button>
        </div>
        ${CFG.DEMO || !CFG.WA_NUMBER
          ? `<p class="label" style="margin:6px 0 0">Mode demo · konfirmasi yang akan terkirim ke panitia</p><div class="wa-preview"><div>${esc(msg)}</div></div>`
          : `<a class="btn btn--yellow btn--block" target="_blank" rel="noopener" href="https://wa.me/${CFG.WA_NUMBER}?text=${encodeURIComponent(msg)}">Kirim konfirmasi via WhatsApp</a>`}
        <button class="linkbtn" type="button" id="reset">Bukan kamu? Daftarkan orang lain</button>
      </div>`;
  }

  function bind() {
    $('#form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const reg = {
        name: $('#f-name').value.trim(), wa: $('#f-wa').value.trim(), biz: $('#f-biz').value,
        online: (document.querySelector('input[name=online]:checked') || {}).value || '', at: new Date().toISOString(),
      };
      const err = $('#err');
      const fail = (m) => { err.textContent = m; err.hidden = false; };
      if (reg.name.length < 3) return fail('Tulis nama lengkapmu.');
      if (!/^(\+?62|0)8\d{7,12}$/.test(reg.wa.replace(/[\s-]/g, ''))) return fail('Nomor WhatsApp belum valid, contoh 0812xxxxxxx.');
      if (!reg.biz) return fail('Pilih jenis usahamu.');
      if (!$('#f-ok').checked) return fail('Centang persetujuan supaya panitia bisa mengirim info acara.');
      err.hidden = true;
      if (CFG.SHEET_URL) {
        const fd = new FormData(); Object.entries(reg).forEach(([k, v]) => fd.append(k, v));
        try { await fetch(CFG.SHEET_URL, { method: 'POST', mode: 'no-cors', body: fd }); } catch (_) { /* tetap lanjut, data ada di WA */ }
      }
      save(reg); renderMeta(reg); renderDone(reg);
      $('#daftar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#doneWrap').addEventListener('click', async (e) => {
      if (e.target.id === 'reset') { save(null); $('#doneWrap').hidden = true; $('#formWrap').hidden = false; $('#form').reset(); renderMeta(null); return; }
      if (e.target.id === 'copyLink') {
        const text = `Ada workshop gratis foto produk pakai HP buat UMKM, ${dateText}. Daftar di sini: ${location.href.split('#')[0]}`;
        try { await navigator.clipboard.writeText(text); e.target.textContent = 'Link tersalin'; }
        catch (_) { e.target.textContent = 'Salin manual dari address bar'; }
      }
    });
  }

  $('#faqList').innerHTML = CFG.FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  if (CFG.DEMO) { $('#demoBar').hidden = false; $('#demoLink').href = CFG.DEV_CONTACT_URL; }
  const reg = load();
  renderMeta(reg);
  if (reg) renderDone(reg);
  bind();
})();
