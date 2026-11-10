(() => {
  'use strict';

  // ====== Konfigurasi ======
  // Nomor WhatsApp pengantin untuk konfirmasi kehadiran (format internasional tanpa +, mis. 6281234567890).
  // Jika dikosongkan, WhatsApp akan terbuka dan tamu memilih sendiri kontak tujuannya.
  const WA_NUMBER = '';
  // Waktu akad (WIB = UTC+7)
  const EVENT_START = '2026-11-14T08:00:00+07:00';
  const EVENT_END = '2026-11-14T14:00:00+07:00';
  const EVENT_TITLE = 'Pernikahan Intan & Irul';
  const EVENT_PLACE = 'Hemangini Hotel, Jl. Dr. Setiabudi No.66, Hegarmanah, Kec. Cidadap, Kota Bandung, Jawa Barat 40141';

  const GALLERY = [
    ['p03', 'Intan dan Irul duduk berdekatan di lantai kayu'],
    ['p09', 'Berjalan bersama di dekat jendela lengkung besar'],
    ['p00', 'Intan dan Irul di balik kain tulle putih'],
    ['p11', 'Berdiri di depan ukiran kayu klasik'],
    ['p08', 'Siluet kebersamaan di depan jam besar'],
    ['p02', 'Irul menyentuh lembut wajah Intan'],
    ['p15', 'Irul memegang buket bunga'],
    ['p10', 'Mengintip dari balik pintu kayu'],
    ['p01', 'Berdampingan di bawah tulle'],
    ['p12', 'Irul mengambil foto Intan'],
    ['p06', 'Duduk di depan jendela bersama kamera'],
    ['p07', 'Siluet Intan dan Irul di depan jam'],
    ['c2', 'Intan dan Irul memegang kamera di depan dinding terakota'],
    ['p13', 'Berpose di depan dinding terakota'],
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast.id);
    toast.id = setTimeout(() => t.classList.remove('is-on'), 2200);
  };

  // ====== Nama tamu dari ?to= ======
  const to = new URLSearchParams(location.search).get('to');
  if (to && to.trim()) {
    $('#guestName').textContent = to.trim().slice(0, 60);
    $('#fNama').value = to.trim().slice(0, 60);
  }

  // ====== Buka undangan + musik ======
  const cover = $('#cover');
  const song = $('#song');
  const musicBtn = $('#musicBtn');
  const setMusicUI = (on) => musicBtn.setAttribute('aria-pressed', String(on));

  $('#openBtn').addEventListener('click', () => {
    cover.classList.add('is-open');
    document.body.classList.remove('is-locked');
    cover.setAttribute('inert', '');
    musicBtn.hidden = false;
    song.volume = 0.7;
    song.play().then(() => setMusicUI(true)).catch(() => setMusicUI(false));
    window.scrollTo(0, 0);
  });
  musicBtn.addEventListener('click', () => {
    if (song.paused) song.play().then(() => setMusicUI(true)).catch(() => {});
    else { song.pause(); setMusicUI(false); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !song.paused) { song.pause(); song.dataset.resume = '1'; }
    else if (!document.hidden && song.dataset.resume) { delete song.dataset.resume; song.play().catch(() => {}); }
  });

  // ====== Hitung mundur ======
  const target = new Date(EVENT_START).getTime();
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    $('#cd-d').textContent = pad(Math.floor(s / 86400));
    $('#cd-h').textContent = pad(Math.floor((s % 86400) / 3600));
    $('#cd-m').textContent = pad(Math.floor((s % 3600) / 60));
    $('#cd-s').textContent = pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);

  // ====== Simpan ke kalender (.ics) ======
  $('#calBtn').addEventListener('click', () => {
    const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan Intan & Irul//ID', 'BEGIN:VEVENT',
      `UID:intan-irul-2026@undangan`, `DTSTAMP:${fmt(Date.now())}`,
      `DTSTART:${fmt(EVENT_START)}`, `DTEND:${fmt(EVENT_END)}`,
      `SUMMARY:${EVENT_TITLE}`, `LOCATION:${EVENT_PLACE.replace(/,/g, '\\,')}`,
      'DESCRIPTION:Akad 08.00 WIB - selesai\\, Resepsi 11.00 - 14.00 WIB',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'pernikahan-intan-irul.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // ====== Galeri + lightbox ======
  const list = $('#gallery');
  GALLERY.forEach(([id, alt], i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" data-i="${i}" aria-label="Perbesar foto ${i + 1}"><img src="img/t/${id}.jpg" alt="" loading="lazy" decoding="async"></button>`;
    $('img', li).alt = alt;
    list.append(li);
  });

  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  let cur = 0;
  const show = (i) => {
    cur = (i + GALLERY.length) % GALLERY.length;
    const [id, alt] = GALLERY[cur];
    lbImg.src = `img/${id}.jpg`;
    lbImg.alt = alt;
    $('#lbCount').textContent = `${cur + 1} / ${GALLERY.length}`;
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    show(+b.dataset.i);
    lb.showModal();
  });
  $('#lbClose').addEventListener('click', () => lb.close());
  $('#lbPrev').addEventListener('click', () => show(cur - 1));
  $('#lbNext').addEventListener('click', () => show(cur + 1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  // Geser jari untuk pindah foto
  let sx = 0;
  lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
  // Fallback light-dismiss untuk browser tanpa closedby (mis. Safari)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) lb.close();
    });
  }

  // ====== RSVP -> WhatsApp ======
  $('#rsvpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const nama = f.nama.value.trim();
    const note = $('#formNote');
    if (!nama) { note.textContent = 'Mohon isi nama Anda.'; f.nama.focus(); return; }
    note.textContent = '';
    const msg = [
      'Assalamualaikum, saya konfirmasi untuk pernikahan Intan & Irul (14 November 2026).',
      '', `Nama: ${nama}`, `Kehadiran: ${f.hadir.value}`,
      f.ucapan.value.trim() ? `\nUcapan:\n${f.ucapan.value.trim()}` : '',
    ].join('\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  // ====== Salin nomor rekening ======
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = $('#' + btn.dataset.copy).textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        toast('Nomor rekening disalin');
      } catch {
        const r = document.createRange();
        r.selectNodeContents($('#' + btn.dataset.copy));
        getSelection().removeAllRanges();
        getSelection().addRange(r);
        toast('Tekan salin pada nomor yang terpilih');
      }
    });
  });

  // ====== Muncul saat digulir ======
  const items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el, i) => {
      el.style.setProperty('--d', `${(i % 3) * 0.08}s`);
      io.observe(el);
    });
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
})();
