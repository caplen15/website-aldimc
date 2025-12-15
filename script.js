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
});

const form = document.getElementById("formKontak");
if (form) {
  const hintIds = ['hint-nama','hint-email','hint-nomer','hint-tanggal','hint-lokasi'];
  const hintOriginal = {};
  hintIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) hintOriginal[id] = el.textContent;
  });

  const emailInput = document.getElementById('email');
  const nomerInput = document.getElementById('nomer');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput) {
    emailInput.addEventListener('input', function(){
      const hint = document.getElementById('hint-email');
      if (!hint) return;
      if (!this.value) {
        hint.textContent = hintOriginal['hint-email'];
        hint.className = 'form-hint';
        hint.style.display = '';
        return;
      }
      if (!this.value.includes('@')) {
        hint.textContent = 'Gunakan format email: nama@domain.com (harus mengandung "@")';
        hint.className = 'form-hint hint-error';
        hint.style.display = '';
        return;
      }
      if (emailPattern.test(this.value)) {
        hint.textContent = 'Email valid';
        hint.className = 'form-hint hint-success';
        setTimeout(() => { hint.style.display = 'none'; }, 1400);
      } else {
        hint.textContent = 'Format email tidak lengkap (contoh: nama@domain.com)';
        hint.className = 'form-hint hint-error';
        hint.style.display = '';
      }
    });
  }
  if (nomerInput) {
    nomerInput.addEventListener('input', function(){
      const hint = document.getElementById('hint-nomer');
      if (!hint) return;
      const digits = String(this.value).replace(/\D/g,'');
      if (!this.value) {
        hint.textContent = hintOriginal['hint-nomer'];
        hint.className = 'form-hint';
        hint.style.display = '';
        return;
      }
      if (digits.length < 10) {
        hint.textContent = 'Nomor harus berisi minimal 10 digit';
        hint.className = 'form-hint hint-error';
        hint.style.display = '';
      } else {
        hint.textContent = 'Nomor valid';
        hint.className = 'form-hint hint-success';
        setTimeout(() => { hint.style.display = 'none'; }, 1200);
      }
    });
  }

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

    const required = ['nama','email','nomer','tanggal','lokasi'];
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

    const email = document.getElementById('email');
    if (!emailPattern.test(email.value)) {
      const h = document.getElementById('hint-email'); if (h) { h.textContent = 'Isian harus berupa email (contoh: nama@domain.com)'; h.style.color = '#d9534f'; }
      errorMsg.style.color = '#d9534f';
      errorMsg.textContent = 'Isian email tidak valid.';
      return;
    }

    const nomer = document.getElementById('nomer');
    const nomerDigits = nomer.value.replace(/\D/g,'');
    if (nomerDigits.length < 10) {
      const h = document.getElementById('hint-nomer'); if (h) { h.textContent = 'Nomor harus berisi minimal 10 digit'; h.style.color = '#d9534f'; }
      errorMsg.style.color = '#d9534f';
      errorMsg.textContent = 'Nomor HP harus berisi minimal 10 digit.';
      return;
    }

    const setuju = document.getElementById('setuju');
    if (!setuju.checked) {
      errorMsg.style.color = '#d9534f';
      errorMsg.textContent = 'Anda harus mencentang persetujuan (DP).';
      return;
    }

    errorMsg.style.color = 'green';
    errorMsg.textContent = 'Pesan berhasil dikirim! Kami akan segera menghubungi Anda.';
    alert('Pesan berhasil dikirim! Terima kasih — Aldi MC akan menghubungi Anda dalam 24 jam.');
    form.reset();
    hintIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && hintOriginal[id]) { el.textContent = hintOriginal[id]; el.style.color = ''; }
    });
    setTimeout(() => { errorMsg.textContent = ''; }, 6000);
  });

  function showError(message) {
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.style.color = "red";
    errorMsg.textContent = message;
  }
}

const formEstimasi = document.getElementById("formEstimasi");
if (formEstimasi) {
  formEstimasi.addEventListener("submit", function (e) {
    e.preventDefault();
    const harga = parseFloat(document.getElementById("harga").value);
    const durasi = parseFloat(document.getElementById("durasi").value);
    const hasil = document.getElementById("hasil");
    if (harga > 0 && durasi > 0) {
      const total = harga * durasi;
      hasil.textContent = "Total Biaya: Rp. " + total.toLocaleString('id-ID');
      hasil.style.color = "#532a10";
      hasil.style.fontWeight = "bold";
      hasil.style.fontSize = "1.3rem";
      hasil.marginTop = "20px";
    } else {
      hasil.textContent = "Masukkan nilai yang valid.";
      hasil.style.color = "red";
    }
  });
}