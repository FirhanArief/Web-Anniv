/**
 * ==========================================================
 * ANNIVERSARY SURPRISE WEB - JAVASCRIPT LOGIC
 * Perayaan 7 Tahun Cinta (16-12-2026)
 * Warna: Merah (Cinta) & Biru (Keceriaan)
 * Fitur: IndexedDB Foto/Video, Jim Brickman - Valentine Player,
 *        Countdown, Partikel Hati & Bintang, Typewriter Letter.
 * ==========================================================
 */

// Global State
let db = null;
let currentFilter = 'all';
let activeMomentId = null;

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCountdown();
  initMusicPlayer();
  initSurpriseGate();
  initIndexedDB();
  initLetterFeatures();
  initWishesFeature();
  initClickSparkles();
});

/* ==========================================================
   1. CANVAS PARTIKEL LATAR (HATI MERAH & BINTANG/GELEMBUNG BIRU)
   ========================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = window.innerWidth < 768 ? 35 : 65;

  class Particle {
    constructor(x, y, isBurst = false) {
      this.reset(x, y, isBurst);
    }

    reset(x, y, isBurst = false) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : (isBurst ? y : height + Math.random() * 50);
      this.size = Math.random() * 12 + 8;
      this.speedY = isBurst ? (Math.random() - 0.5) * 6 - 2 : -(Math.random() * 1.2 + 0.5);
      this.speedX = isBurst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 0.8;
      this.opacity = isBurst ? 1 : Math.random() * 0.6 + 0.2;
      this.fade = isBurst ? 0.02 : 0;
      // 50% Hati Merah (Cinta), 50% Gelembung/Bintang Biru (Keceriaan)
      this.isHeart = Math.random() > 0.45;
      this.color = this.isHeart 
        ? (Math.random() > 0.5 ? '#e63946' : '#ff4d6d') 
        : (Math.random() > 0.5 ? '#00b4d8' : '#90e0ef');
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      if (this.fade > 0) {
        this.opacity -= this.fade;
      }

      if (this.y < -30 || this.opacity <= 0) {
        if (this.fade > 0) {
          // Buang partikel ledakan yang habis
          return false;
        }
        this.reset();
      }
      return true;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;

      if (this.isHeart) {
        // Gambar Hati Romantis
        drawHeart(ctx, 0, 0, this.size);
      } else {
        // Gambar Bintang/Lingkaran Biru Ceria
        drawSparkle(ctx, 0, 0, this.size * 0.8);
      }
      ctx.restore();
    }
  }

  function drawHeart(ctx, x, y, size) {
    const s = size / 16;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 7 * s, y - 10 * s, x - 14 * s, y + 2 * s, x, y + 12 * s);
    ctx.bezierCurveTo(x + 14 * s, y + 2 * s, x + 7 * s, y - 10 * s, x, y);
    ctx.fill();
  }

  function drawSparkle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle(Math.random() * width, Math.random() * height));
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const alive = p.update();
      if (!alive) {
        particles.splice(i, 1);
      } else {
        p.draw();
      }
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Export burst generator for interactive clicks
  window.triggerParticleBurst = (x, y, count = 25) => {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, true));
    }
  };
}

/* Klik layar manapun memicu semburan hati & bintang */
function initClickSparkles() {
  window.addEventListener('click', (e) => {
    // Hindari tombol interaktif tertentu jika mengganggu
    if (window.triggerParticleBurst) {
      window.triggerParticleBurst(e.clientX, e.clientY, 15);
    }
  });
}

/* ==========================================================
   2. PINTU KEJUTAN (SURPRISE GATE) & REVEAL
   ========================================================== */
function initSurpriseGate() {
  const gate = document.getElementById('surpriseGate');
  const mainContent = document.getElementById('mainContent');
  const envelope = document.getElementById('envelopeWrapper');
  const openSurpriseBtn = document.getElementById('openSurpriseBtn');
  const audio = document.getElementById('audioPlayer');

  function openSurprise(e) {
    if (e) e.stopPropagation();
    envelope.classList.add('opened');

    // Ledakan partikel cinta di tengah amplop
    const rect = envelope.getBoundingClientRect();
    if (window.triggerParticleBurst) {
      window.triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
    }

    // Mulai lagu Jim Brickman - Valentine
    playMusic();

    setTimeout(() => {
      gate.classList.add('open');
      mainContent.classList.remove('hidden');

      // Animasi scroll lembut ke hero
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  }

  if (envelope) envelope.addEventListener('click', openSurprise);
  if (openSurpriseBtn) openSurpriseBtn.addEventListener('click', openSurprise);
}

/* ==========================================================
   3. HITUNG MUNDUR (COUNTDOWN) 16 DESEMBER 2026
   ========================================================== */
function initCountdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  // Tanggal target: 16 Desember 2026 pukul 00:00:00
  const targetDate = new Date('2026-12-16T00:00:00');

  function update() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      const sectionTitle = document.querySelector('.countdown-section .section-title');
      if (sectionTitle) sectionTitle.innerHTML = '🎉 Hari Ini 16 Desember 2026! Happy 7th Anniversary! 🎉';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================
   4. PEMUTAR MUSIK (JIM BRICKMAN - VALENTINE)
   ========================================================== */
let isPlaying = false;
let synthesizedAudio = null;

function initMusicPlayer() {
  const audio = document.getElementById('audioPlayer');
  const mainPlayBtn = document.getElementById('mainPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const vinylDisc = document.getElementById('vinylDisc');
  const floatingMusicBtn = document.getElementById('floatingMusicBtn');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressContainer');
  const currentTimeEl = document.getElementById('currentTime');
  const durationTimeEl = document.getElementById('durationTime');
  const volumeSlider = document.getElementById('volumeSlider');
  const rewindBtn = document.getElementById('rewindBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const customAudioInput = document.getElementById('customAudioInput');

  // Format detik menjadi mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  window.playMusic = function() {
    audio.play().then(() => {
      isPlaying = true;
      updateUI();
    }).catch(err => {
      console.warn('Audio play was prevented or failed:', err);
      // Fallback: Jika file remote gagal dimuat, gunakan Synthesizer Piano Romantis agar tetap ada suara merdu!
      playRomanticSynth();
      isPlaying = true;
      updateUI();
    });
  };

  function pauseMusic() {
    audio.pause();
    if (synthesizedAudio) {
      synthesizedAudio.stop();
      synthesizedAudio = null;
    }
    isPlaying = false;
    updateUI();
  }

  function togglePlay() {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  function updateUI() {
    if (isPlaying) {
      if (playIcon) {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
      }
      if (vinylDisc) vinylDisc.classList.add('playing');
      if (floatingMusicBtn) floatingMusicBtn.classList.add('active');
    } else {
      if (playIcon) {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
      }
      if (vinylDisc) vinylDisc.classList.remove('playing');
      if (floatingMusicBtn) floatingMusicBtn.classList.remove('active');
    }
  }

  if (mainPlayBtn) mainPlayBtn.addEventListener('click', togglePlay);
  if (floatingMusicBtn) floatingMusicBtn.addEventListener('click', () => {
    togglePlay();
    const musicSection = document.getElementById('music');
    if (musicSection) {
      musicSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Update progress bar
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
  });

  // Seeking on progress container click
  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      if (audio.duration) {
        audio.currentTime = (clickX / width) * audio.duration;
      }
    });
  }

  // Rewind & Forward 10s
  if (rewindBtn) {
    rewindBtn.addEventListener('click', () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
  }
  if (forwardBtn) {
    forwardBtn.addEventListener('click', () => {
      audio.currentTime = Math.min(audio.duration || 999, audio.currentTime + 10);
    });
  }

  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value;
    });
  }

  // Custom MP3 upload from user
  if (customAudioInput) {
    customAudioInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        audio.src = fileUrl;
        playMusic();
        alert(`Lagu "${file.name}" berhasil dipasang! ❤️`);
      }
    });
  }
}

/**
 * Fallback Piano Synthesizer: Memainkan chord romantis lembut (C - G - Am - F)
 * jika koneksi audio eksternal terhalang oleh kebijakan CORS browser.
 */
function playRomanticSynth() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const actx = new AudioContext();

    const notes = [
      261.63, 329.63, 392.00, 523.25, // C chord
      196.00, 246.94, 293.66, 392.00, // G chord
      220.00, 261.63, 329.63, 440.00, // Am chord
      174.61, 220.00, 261.63, 349.23  // F chord
    ];

    let noteIndex = 0;
    let isSynthActive = true;

    function playNextNote() {
      if (!isSynthActive) return;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[noteIndex % notes.length], actx.currentTime);
      gain.gain.setValueAtTime(0.08, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start();
      osc.stop(actx.currentTime + 1.2);
      noteIndex++;

      setTimeout(playNextNote, 600);
    }
    playNextNote();

    synthesizedAudio = {
      stop: () => {
        isSynthActive = false;
        actx.close();
      }
    };
  } catch (e) {
    console.log('Synthesizer not supported');
  }
}

/* ==========================================================
   5. INDEXEDDB GALLERY UNTUK FOTO & VIDEO KENANGAN
   ========================================================== */
function initIndexedDB() {
  const DB_NAME = 'AnniversaryMemoriesDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'moments';

  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (e) => {
    const dbInstance = e.target.result;
    if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
      dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = (e) => {
    db = e.target.result;
    loadGalleryMoments();
  };

  request.onerror = (e) => {
    console.error('IndexedDB Error:', e.target.error);
  };

  setupDropZoneAndUpload();
  setupGalleryFilters();
  setupLightbox();
}

function setupDropZoneAndUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const mediaCaption = document.getElementById('mediaCaption');

  if (!dropZone || !fileInput) return;

  // Drag & Drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadedFiles(files, mediaCaption ? mediaCaption.value : '');
      if (mediaCaption) mediaCaption.value = '';
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleUploadedFiles(e.target.files, mediaCaption ? mediaCaption.value : '');
      if (mediaCaption) mediaCaption.value = '';
      fileInput.value = '';
    }
  });
}

function handleUploadedFiles(files, customCaption) {
  if (!db) {
    alert('Database belum siap, silakan coba sesaat lagi.');
    return;
  }

  const tx = db.transaction('moments', 'readwrite');
  const store = tx.objectStore('moments');

  Array.from(files).forEach((file, index) => {
    const isVideo = file.type.startsWith('video');
    const isImage = file.type.startsWith('image');

    if (!isImage && !isVideo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const record = {
        name: file.name,
        type: isVideo ? 'video' : 'image',
        dataUrl: e.target.result,
        caption: customCaption || file.name.replace(/\.[^/.]+$/, ""),
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        timestamp: Date.now() + index
      };

      const addReq = store.add(record);
      addReq.onsuccess = () => {
        loadGalleryMoments();
      };
    };
    reader.readAsDataURL(file);
  });

  tx.oncomplete = () => {
    if (window.triggerParticleBurst) {
      window.triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
    }
  };
}

function loadGalleryMoments() {
  if (!db) return;
  const tx = db.transaction('moments', 'readonly');
  const store = tx.objectStore('moments');
  const request = store.getAll();

  request.onsuccess = () => {
    const moments = request.result || [];
    renderGalleryGrid(moments);
  };
}

function renderGalleryGrid(moments) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  // Filter moments
  const filtered = moments.filter(m => {
    if (currentFilter === 'all') return true;
    return m.type === currentFilter;
  });

  // Jika belum ada momen yang di-upload, sertakan kartu contoh romantis awal
  if (filtered.length === 0 && moments.length === 0) {
    const sampleMoments = getStarterMoments();
    sampleMoments.forEach(m => {
      grid.appendChild(createStarterCardElement(m));
    });
    return;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty">
        <i class="fa-solid fa-folder-open"></i>
        <h3>Belum ada ${currentFilter === 'video' ? 'video' : 'foto'}</h3>
        <p>Ayo upload kenangan spesial kalian di atas!</p>
      </div>
    `;
    return;
  }

  // Tampilkan dari yang paling baru di-upload
  filtered.sort((a, b) => b.timestamp - a.timestamp);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'moment-card';
    card.dataset.id = item.id;

    const mediaHtml = item.type === 'video'
      ? `<video src="${item.dataUrl}" preload="metadata"></video>`
      : `<img src="${item.dataUrl}" alt="${escapeHtml(item.caption)}" loading="lazy">`;

    card.innerHTML = `
      <div class="moment-media" onclick="openLightbox(${item.id})">
        ${mediaHtml}
        <span class="media-type-badge ${item.type === 'video' ? 'video' : 'photo'}">
          <i class="fa-solid ${item.type === 'video' ? 'fa-video' : 'fa-image'}"></i>
          ${item.type === 'video' ? 'Video' : 'Foto'}
        </span>
        <div class="moment-overlay">
          <i class="fa-solid fa-expand"></i>
        </div>
      </div>
      <div class="moment-details">
        <div class="moment-caption">${escapeHtml(item.caption)}</div>
        <div class="moment-footer">
          <span><i class="fa-regular fa-calendar"></i> ${item.date}</span>
          <button class="moment-del-btn" onclick="deleteMoment(${item.id})" title="Hapus Momen">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function getStarterMoments() {
  return [
    {
      title: "Momen Awal Pertemuan",
      date: "16 Desember 2019",
      desc: "Hari pertama kisah indah 7 tahun ini dimulai.",
      bg: "linear-gradient(135deg, #e63946, #9d0208)",
      icon: "fa-heart"
    },
    {
      title: "Tawa & Keceriaan Bersamamu",
      date: "Setiap Hari Indah",
      desc: "Warna biru keceriaan yang selalu kamu hadirkan.",
      bg: "linear-gradient(135deg, #0096c7, #023e8a)",
      icon: "fa-sun"
    },
    {
      title: "Perjalanan Menuju 7 Tahun",
      date: "16 Desember 2026",
      desc: "Dan cinta ini akan terus bersemi hingga selamanya.",
      bg: "linear-gradient(135deg, #b5179e, #7209b7)",
      icon: "fa-infinity"
    }
  ];
}

function createStarterCardElement(starter) {
  const card = document.createElement('div');
  card.className = 'moment-card';
  card.innerHTML = `
    <div class="moment-media" style="background: ${starter.bg}; display: flex; align-items: center; justify-content: center; color: white;">
      <i class="fa-solid ${starter.icon}" style="font-size: 3.5rem; opacity: 0.85;"></i>
      <span class="media-type-badge photo">
        <i class="fa-solid fa-sparkles"></i> Momen Abadi
      </span>
    </div>
    <div class="moment-details">
      <div class="moment-caption">${starter.title}</div>
      <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.4;">${starter.desc}</p>
      <div class="moment-footer" style="margin-top: 8px;">
        <span><i class="fa-regular fa-calendar"></i> ${starter.date}</span>
      </div>
    </div>
  `;
  return card;
}

window.deleteMoment = function(id) {
  if (!confirm('Apakah kamu yakin ingin menghapus momen kenangan ini?')) return;
  if (!db) return;

  const tx = db.transaction('moments', 'readwrite');
  const store = tx.objectStore('moments');
  store.delete(id);

  tx.oncomplete = () => {
    closeLightbox();
    loadGalleryMoments();
  };
};

function setupGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn:not(.btn-clear-all)');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      loadGalleryMoments();
    });
  });

  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (!confirm('Hapus seluruh foto & video yang telah diupload dari browser ini?')) return;
      if (!db) return;
      const tx = db.transaction('moments', 'readwrite');
      tx.objectStore('moments').clear();
      tx.oncomplete = () => {
        loadGalleryMoments();
        alert('Galeri telah dibersihkan!');
      };
    });
  }
}

/* ==========================================================
   6. LIGHTBOX FULLSCREEN MODAL
   ========================================================== */
function setupLightbox() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const deleteBtn = document.getElementById('lightboxDeleteBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (activeMomentId !== null) {
        deleteMoment(activeMomentId);
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

window.openLightbox = function(id) {
  if (!db) return;
  const tx = db.transaction('moments', 'readonly');
  const store = tx.objectStore('moments');
  const req = store.get(id);

  req.onsuccess = () => {
    const item = req.result;
    if (!item) return;

    activeMomentId = item.id;
    const modal = document.getElementById('lightboxModal');
    const mediaWrapper = document.getElementById('lightboxMediaWrapper');
    const titleEl = document.getElementById('lightboxTitle');
    const dateEl = document.getElementById('lightboxDate');

    mediaWrapper.innerHTML = item.type === 'video'
      ? `<video src="${item.dataUrl}" controls autoplay style="max-height: 70vh; max-width: 100%; border-radius: 12px;"></video>`
      : `<img src="${item.dataUrl}" alt="${escapeHtml(item.caption)}" style="max-height: 70vh; max-width: 100%; border-radius: 12px;">`;

    titleEl.textContent = item.caption;
    dateEl.textContent = `${item.date} • ${item.type === 'video' ? 'Video' : 'Foto'}`;

    modal.classList.add('active');
  };
};

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  const mediaWrapper = document.getElementById('lightboxMediaWrapper');
  if (mediaWrapper) mediaWrapper.innerHTML = ''; // Hentikan pemutaran video
  if (modal) modal.classList.remove('active');
  activeMomentId = null;
}

/* ==========================================================
   7. SURAT CINTA (LOVE LETTER) DENGAN ANIMASI KETIK
   ========================================================== */
function initLetterFeatures() {
  const typewriterBtn = document.getElementById('typewriterBtn');
  const sendLoveHeartBtn = document.getElementById('sendLoveHeartBtn');
  const letterBody = document.getElementById('letterText');

  if (!letterBody) return;

  const originalContent = letterBody.innerHTML;

  if (typewriterBtn) {
    typewriterBtn.addEventListener('click', () => {
      const textToType = [
        "Selamat hari jadi yang ke-7 tahun, wanitaku yang paling luar biasa.",
        "Rasanya baru kemarin kita memulai kisah ini, namun setiap detik bersamamu selalu terasa begitu istimewa dan penuh makna.",
        "Tujuh tahun bukan sekadar angka. Di dalamnya ada ribuan perjalanan, jutaan tawa, canda, dan saling menguatkan di saat lelah. Kamu adalah rumah terbaik tempat hatiku selalu ingin pulang.",
        "Warna merah hari ini adalah janji cintaku yang akan selalu membara untukmu, dan warna biru adalah kedamaian serta keceriaan yang selalu kamu berikan dalam setiap hariku.",
        "Terima kasih telah memilihku, bertahan bersamaku, dan mencintaiku tanpa syarat. Aku mencintaimu hari ini, esok, di 16 Desember 2026, hingga selamanya. ❤️💙"
      ];

      letterBody.innerHTML = '<p class="typing-cursor">|</p>';
      let paraIndex = 0;
      let charIndex = 0;
      let currentP = document.createElement('p');
      letterBody.innerHTML = '';
      letterBody.appendChild(currentP);

      function typeChar() {
        if (paraIndex < textToType.length) {
          const currentText = textToType[paraIndex];
          if (charIndex < currentText.length) {
            currentP.textContent += currentText.charAt(charIndex);
            charIndex++;
            setTimeout(typeChar, 25);
          } else {
            paraIndex++;
            charIndex = 0;
            if (paraIndex < textToType.length) {
              currentP = document.createElement('p');
              letterBody.appendChild(currentP);
              setTimeout(typeChar, 300);
            }
          }
        }
      }
      typeChar();
    });
  }

  // Kirim Pelukan Cinta: Efek semburan hati ke seluruh layar
  if (sendLoveHeartBtn) {
    sendLoveHeartBtn.addEventListener('click', () => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * window.innerHeight;
          if (window.triggerParticleBurst) {
            window.triggerParticleBurst(x, y, 30);
          }
        }, i * 200);
      }
      alert('Pelukan cinta dan ribuan kecupan hangat terkirim untukmu, sayang! 🤗❤️💙');
    });
  }
}

/* ==========================================================
   8. PESAN HARAPAN (WISHES FOR HER) DENGAN LOCALSTORAGE
   ========================================================== */
function initWishesFeature() {
  const wishForm = document.getElementById('wishForm');
  const wishAuthor = document.getElementById('wishAuthor');
  const wishMessage = document.getElementById('wishMessage');
  const wishesList = document.getElementById('wishesList');

  const STORAGE_KEY = 'anniversary_wishes_list';

  function getStoredWishes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveWishes(wishes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  }

  function renderWishes() {
    if (!wishesList) return;
    const wishes = getStoredWishes();

    if (wishes.length === 0) {
      wishesList.innerHTML = `
        <div style="text-align: center; color: #94a3b8; font-size: 0.88rem; padding: 15px;">
          Belum ada pesan harapan yang ditulis. Jadilah yang pertama menuliskan kata cinta di sini! 💕
        </div>
      `;
      return;
    }

    wishesList.innerHTML = wishes.map(w => `
      <div class="wish-item">
        <div class="wish-item-header">
          <span>${escapeHtml(w.author)} ❤️</span>
          <span class="wish-item-time">${w.time}</span>
        </div>
        <div class="wish-item-content">${escapeHtml(w.text)}</div>
      </div>
    `).join('');
  }

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = wishAuthor.value.trim();
      const message = wishMessage.value.trim();

      if (!author || !message) return;

      const wishes = getStoredWishes();
      wishes.unshift({
        author,
        text: message,
        time: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      });

      saveWishes(wishes);
      wishAuthor.value = '';
      wishMessage.value = '';
      renderWishes();

      if (window.triggerParticleBurst) {
        window.triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
      }
      alert('Pesan manismu berhasil disimpan di perayaan cinta ini! 💌');
    });
  }

  renderWishes();
}

/* Helper Sanitize HTML */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
