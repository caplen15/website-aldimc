document.addEventListener('DOMContentLoaded', function() {
  const counters = document.querySelectorAll('.counter');
  const speed = 200;

  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const increment = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 10);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });

  // signal JS-enabled so CSS can hide items until revealed
  document.documentElement.classList.add('js');

  // Build mobile carousel and desktop lightbox data from gallery
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  if (galleryItems.length > 0) {
    const indicators = document.getElementById('galeriIndicators');
    const inner = document.getElementById('galeriInner');
    if (indicators && inner) {
      indicators.innerHTML = '';
      inner.innerHTML = '';
      galleryItems.forEach((item, idx) => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption') ? item.querySelector('.gallery-caption').textContent.trim() : '';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.bsTarget = '#galeriCarousel';
        btn.dataset.bsSlideTo = String(idx);
        btn.ariaLabel = `Slide ${idx+1}`;
        if (idx === 0) { btn.className = 'active'; btn.setAttribute('aria-current','true'); }
        indicators.appendChild(btn);

        const wrap = document.createElement('div');
        wrap.className = 'carousel-item' + (idx === 0 ? ' active' : '');
        const slideImg = document.createElement('img');
        slideImg.loading = 'eager';
        slideImg.setAttribute('fetchpriority','high');
        slideImg.decoding = 'async';
        slideImg.src = img.src;
        slideImg.alt = img.alt || caption;
        slideImg.className = 'd-block w-100';
        wrap.appendChild(slideImg);
        const cap = document.createElement('div');
        cap.className = 'carousel-caption d-none d-md-block';
        const h5 = document.createElement('h5');
        h5.textContent = caption;
        cap.appendChild(h5);
        wrap.appendChild(cap);
        inner.appendChild(wrap);

        img.addEventListener('click', (e) => {
          if (window.innerWidth < 768) return; // skip on mobile
          openLightbox(idx);
        });
      });
    }

    const galeriEl = document.getElementById('galeriCarousel');
    if (galeriEl && typeof bootstrap !== 'undefined') {
      new bootstrap.Carousel(galeriEl, { interval: 3500, pause: 'hover' });
    }

    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      const targetImg = galleryItems[currentIndex].querySelector('img');
      const caption = galleryItems[currentIndex].querySelector('.gallery-caption') ? galleryItems[currentIndex].querySelector('.gallery-caption').textContent.trim() : '';
      lightboxImage.loading = 'eager';
      lightboxImage.src = targetImg.src;
      lightboxImage.alt = targetImg.alt || caption;
      lightboxCaption.textContent = caption;
      if (typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(lightboxModal);
        modal.show();
        lightboxModal._bsModal = modal;
      }
    }

    function changeLightbox(delta) {
      currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
      openLightbox(currentIndex);
    }

    const btnPrev = document.querySelector('.lightbox-nav.btn-prev');
    const btnNext = document.querySelector('.lightbox-nav.btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => changeLightbox(-1));
    if (btnNext) btnNext.addEventListener('click', () => changeLightbox(1));

    if (lightboxModal) {
      document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('show')) return;
        if (e.key === 'ArrowLeft') changeLightbox(-1);
        if (e.key === 'ArrowRight') changeLightbox(1);
        if (e.key === 'Escape' && lightboxModal._bsModal) lightboxModal._bsModal.hide();
      });

      lightboxModal.addEventListener('hidden.bs.modal', () => { lightboxImage.src = ''; });
    }

    // Reveal gallery items when they enter viewport (nice subtle animation, and prevents animating offscreen)
    const galleryObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          galleryObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.gallery-item').forEach(el => galleryObserver.observe(el));

    // Toggle caption on click (mobile/touch) and support keyboard (Enter/Space) to reveal caption
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // On small screens prefer toggling caption instead of opening lightbox
        if (window.innerWidth <= 768) {
          // close other active items
          document.querySelectorAll('.gallery-item.touch-active').forEach(i => {
            if (i !== item) { i.classList.remove('touch-active'); i.setAttribute('aria-expanded','false'); }
          });
          const active = item.classList.toggle('touch-active');
          item.setAttribute('aria-expanded', String(!!active));
          e.stopPropagation();
        }
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const active = item.classList.toggle('touch-active');
          item.setAttribute('aria-expanded', String(!!active));
          e.preventDefault();
        }
      });
    });

    // clicking outside gallery items closes any open caption (mobile convenience)
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.gallery-item')) {
        document.querySelectorAll('.gallery-item.touch-active').forEach(i => { i.classList.remove('touch-active'); i.setAttribute('aria-expanded','false'); });
      }
    });

    // Simple transport estimator (no backend) — data stored in JS object
    const transportRates = {
      "buaran": { label: "Kecamatan Buaran", distance: 3, price: 0 },
      "kedungwuni": { label: "Kedungwuni", distance: 10, priceRange: [0, 50000] },
      "sragi": { label: "Sragi", distance: 22, priceRange: [50000, 100000] },
      "pekalongan-kota": { label: "Pekalongan (Kota)", distance: 5, price: 15000 },
      "pekalongan-kabupaten": { label: "Pekalongan (Kabupaten)", distance: 18, price: 35000 },
      "pemalang": { label: "Pemalang", distance: 45, price: 80000 },
      "tegal": { label: "Tegal", distance: 70, price: 110000 },
      "semarang": { label: "Semarang", distance: 120, price: 170000 },
      "kecamatan-sekitar": { label: "Kecamatan sekitar (radius < 15km)", distance: 12, price: 25000 }
    };

    const selEstimasi = document.getElementById('estimasiLokasi');
    const hasilEstimasi = document.getElementById('hasilEstimasi');
    if (selEstimasi) {
      try {
        // populate select via innerHTML for robustness
        const selectHtml = Object.keys(transportRates).map(key => `<option value="${key}">${transportRates[key].label}</option>`).join('');
        selEstimasi.innerHTML = `<option value="">-- Pilih Lokasi Acara --</option>` + selectHtml;

        // also populate datalist for the 'lokasi' input so users can pick a suggested lokasi
        const lokasiOptions = document.getElementById('lokasiOptions');
        const lokasiInput = document.getElementById('lokasi');
        if (lokasiOptions && lokasiInput) {
          lokasiOptions.innerHTML = Object.keys(transportRates).map(key => `<option value="${transportRates[key].label}" data-key="${key}"></option>`).join('');

          // when user picks a suggested lokasi, try to sync estimator dropdown
          lokasiInput.addEventListener('input', (e) => {
            const val = String(e.target.value || '').trim();
            let matchedKey = '';
            Object.keys(transportRates).forEach(k => {
              if (transportRates[k].label === val) matchedKey = k;
            });
            if (matchedKey) {
              selEstimasi.value = matchedKey;
              hasilEstimasi.innerHTML = '';
            }
          });
        }

        // debug info for troubleshooting
        console.debug('Transport rates populated:', Object.keys(transportRates));
        console.debug('Select #estimasiLokasi options count:', selEstimasi.options.length);

        // expose data for debugging in console (temporary)
        try { window._transportRates = transportRates; console.debug('window._transportRates set'); } catch(e) { /* ignore */ }

        // render a visible fallback list (click to select) so you can verify available locations without opening DevTools
        const estimasiList = document.getElementById('estimasiList');
        if (estimasiList) {
          estimasiList.innerHTML = Object.keys(transportRates).map(key => `<button type="button" class="btn btn-link p-0 me-3 estimasi-item" data-key="${key}">${transportRates[key].label}</button>`).join('');
          estimasiList.style.display = 'block';
          estimasiList.setAttribute('aria-hidden','false');

          estimasiList.addEventListener('click', (ev) => {
            const btn = ev.target.closest('.estimasi-item');
            if (!btn) return;
            const k = btn.dataset.key;
            selEstimasi.value = k;
            hasilEstimasi.innerHTML = '';
            // optional: immediately calculate when clicking the list
            btn.blur();
          });
          console.debug('estimasiList rendered with', estimasiList.children.length, 'items');
        }
      } catch (err) {
        console.error('Error populating transport options', err);
        if (hasilEstimasi) hasilEstimasi.innerHTML = '<div class="alert alert-warning">Gagal memuat opsi estimasi. Silakan refresh halaman.</div>';
      }
    } else {
      console.warn('Select element #estimasiLokasi tidak ditemukan');
    }

    const btnEstimasi = document.getElementById('hitungEstimasi');
    if (btnEstimasi) {
      btnEstimasi.addEventListener('click', () => {
        const key = selEstimasi.value;
        if (!key) {
          hasilEstimasi.innerHTML = '<div class="alert alert-warning">Pilih lokasi acara terlebih dahulu.</div>';
          return;
        }
        const data = transportRates[key];
        const nf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
        let priceText = '';
        if (data.hasOwnProperty('price')) {
          priceText = data.price === 0 ? 'Gratis' : nf.format(data.price);
        } else if (data.hasOwnProperty('priceRange') && Array.isArray(data.priceRange)) {
          priceText = `${nf.format(data.priceRange[0])} - ${nf.format(data.priceRange[1])}`;
        } else {
          priceText = 'Tidak tersedia';
        }
        hasilEstimasi.innerHTML = `<div class="alert alert-info"><strong>Estimasi Jarak:</strong> ${data.distance} km<br><strong>Estimasi Biaya Transport:</strong> ${priceText}<br><small class="text-muted">Estimasi bersifat perkiraan; biaya akhir dapat berubah tergantung akses lokasi dan kondisi.</small></div>`;
      });

      selEstimasi && selEstimasi.addEventListener('change', () => { hasilEstimasi.innerHTML = ''; });
    }
  }
});

const form = document.getElementById("formKontak");
if (form) {
  const hintIds = ['hint-nama','hint-tanggal','hint-lokasi','hint-keperluan'];
  const hintOriginal = {};
  hintIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) hintOriginal[id] = el.textContent;
  });


  const namaInput = document.getElementById('nama');
  if (namaInput) {
    namaInput.addEventListener('input', function(){
      const hint = document.getElementById('hint-nama');
      if (!hint) return;
      if (String(this.value).trim() !== '') {
        hint.style.display = 'none';
      } else {
        hint.style.display = '';
        hint.textContent = hintOriginal['hint-nama'];
        hint.className = 'form-hint';
      }
    });
  }

  form.addEventListener('reset', function () {
    hintIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && hintOriginal[id]) { el.textContent = hintOriginal[id]; el.style.color = ''; el.className = 'form-hint'; el.style.display = ''; }
    });
    const errorMsg = document.getElementById('errorMsg'); if (errorMsg) errorMsg.textContent = '';
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = '';
    const required = ['nama','tanggal','tipe','lokasi','keperluan'];
    const missing = required.filter(id => {
      const el = document.getElementById(id);
      return !el || String(el.value).trim() === '';
    });
    if (missing.length > 0) {
      missing.forEach(id => {
        const h = document.getElementById('hint-' + id);
        if (h) h.style.color = '#d9534f';
      });
      errorMsg.style.color = '#d9534f';
      errorMsg.textContent = 'Semua formulir harus di isi!';
      return;
    }

    // Build professional WhatsApp message and open WhatsApp (prefilled). User still must press send.
    const ownerPhone = '6281933782537';
    const nama = document.getElementById('nama').value.trim();
    const tanggal = document.getElementById('tanggal').value;
    const lokasi = document.getElementById('lokasi').value.trim();
    const tipe = document.getElementById('tipe').value;
    const keperluanEl = document.getElementById('keperluan');
    const keperluan = keperluanEl ? keperluanEl.options[keperluanEl.selectedIndex].text : '-';
    const pesan = document.getElementById('pesan').value.trim();

    let plainMessage = `Formulir Informasi Klien & Acara\n\nNama: ${nama}\nTanggal Acara: ${tanggal}\nLokasi / Venue: ${lokasi}\nJenis Acara: ${tipe}\nKeperluan: ${keperluan}`;
    plainMessage += `\nPesan / Detail Tambahan: ${pesan || '-'}\n\nInformasi yang tercantum menjadi dasar untuk proses konfirmasi selanjutnya. \nTerima kasih.`;

    const encoded = encodeURIComponent(plainMessage);
    const url = `https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encoded}`;
    window.open(url, '_blank');

    errorMsg.style.color = 'green';
    errorMsg.textContent = 'Membuka WhatsApp... silakan tekan kirim pada WhatsApp untuk menyelesaikan pesan.';
    form.reset();
    hintIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && hintOriginal[id]) { el.textContent = hintOriginal[id]; el.style.color = ''; }
    });
    setTimeout(() => { errorMsg.textContent = ''; }, 8000);
  });

  function showError(message) {
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.style.color = "red";
    errorMsg.textContent = message;
  }
}

// removed estimator/calculator (moved to contact for personalized quotes)