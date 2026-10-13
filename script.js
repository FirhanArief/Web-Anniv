/**
 * Anniversary Surprise Web - Application Logic
 * 7th Anniversary Celebration (16-12-2026)
 * Theme: Crimson Red & Ocean Blue
 * Features: Background Particles, Audio Player with Autoplay & Synth Fallback,
 *           Countdown Timer, Interactive Reason Cards, IndexedDB Gallery, Love Letter, Wishes.
 */

// Global State
let db = null;
let currentFilter = 'all';
let activeMomentId = null;
let activeMomentIndex = 0;
let currentVisibleMoments = [];
let allMomentsCache = [];
let isPlaying = false;
let synthesizedAudio = null;

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCountdown();
  initMusicPlayer();
  initSurpriseGate();
  initReasonCards();
  initHeroPhotoShowcase();
  initGalleryHighlights();
  initIndexedDB();
  initLetterFeatures();
  initWishesFeature();
  initClickSparkles();
  initGlobalKeyboardShortcuts();
});

/* 1. Background Particle Canvas (Romantic Hearts & Joyful Bubbles) */
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
        drawHeart(ctx, 0, 0, this.size);
      } else {
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

  window.triggerParticleBurst = (x, y, count = 25) => {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, true));
    }
  };
}

/* Interactive click sparkles on page */
function initClickSparkles() {
  window.addEventListener('click', (e) => {
    if (window.triggerParticleBurst) {
      window.triggerParticleBurst(e.clientX, e.clientY, 15);
    }
  });
}

/* 2. Surprise Gate & Envelope Reveal */
function initSurpriseGate() {
  const gate = document.getElementById('surpriseGate');
  const mainContent = document.getElementById('mainContent');
  const envelope = document.getElementById('envelopeWrapper');
  const openSurpriseBtn = document.getElementById('openSurpriseBtn');

  function openSurprise(e) {
    if (e) e.stopPropagation();
    if (envelope) envelope.classList.add('opened');

    const rect = envelope ? envelope.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    if (window.triggerParticleBurst) {
      window.triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
    }

    // Ensure music is active and playing
    if (!isPlaying && window.playMusic) {
      window.playMusic();
    }

    setTimeout(() => {
      if (gate) gate.classList.add('open');
      if (mainContent) mainContent.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  }

  if (envelope) {
    envelope.addEventListener('click', openSurprise);
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSurprise(e);
      }
    });
  }

  if (openSurpriseBtn) {
    openSurpriseBtn.addEventListener('click', openSurprise);
  }
}

/* 3. Countdown Timer (Target: 16 December 2026) */
function initCountdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

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

/* 4. Audio Player with Immediate Autoplay & Fallback Synthesizer */
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

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  window.playMusic = function() {
    if (!audio) return;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        updateUI();
      }).catch(err => {
        console.log('Direct autoplay waiting for first user gesture:', err.message);
        // Fallback to synthesized audio if file source is blocked
        if (err.name === 'NotSupportedError' || err.name === 'AbortError') {
          playRomanticSynth();
          isPlaying = true;
          updateUI();
        }
      });
    }
  };

  function pauseMusic() {
    if (audio) audio.pause();
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

  if (floatingMusicBtn) {
    floatingMusicBtn.addEventListener('click', () => {
      togglePlay();
      const musicSection = document.getElementById('music');
      if (musicSection) {
        musicSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    floatingMusicBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    });
  }

  if (audio) {
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressContainer) {
          progressContainer.setAttribute('aria-valuenow', Math.round(pct));
        }
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('play', () => {
      isPlaying = true;
      updateUI();
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      updateUI();
    });
  }

  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      if (audio && audio.duration) {
        audio.currentTime = (clickX / width) * audio.duration;
      }
    });
  }

  if (rewindBtn && audio) {
    rewindBtn.addEventListener('click', () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
  }

  if (forwardBtn && audio) {
    forwardBtn.addEventListener('click', () => {
      audio.currentTime = Math.min(audio.duration || 999, audio.currentTime + 10);
    });
  }

  if (volumeSlider && audio) {
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value;
    });
  }

  if (customAudioInput && audio) {
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

  // Attempt direct autoplay immediately on page load
  window.playMusic();

  // Browser Autoplay Policy: unlock audio on first user gesture anywhere
  const unlockAudioEvents = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll'];
  const unlockHandler = () => {
    if (!isPlaying) {
      window.playMusic();
    }
    unlockAudioEvents.forEach(evt => {
      window.removeEventListener(evt, unlockHandler, { passive: true });
    });
  };
  unlockAudioEvents.forEach(evt => {
    window.addEventListener(evt, unlockHandler, { passive: true, once: true });
  });
}

/* Fallback Synthesizer for romantic chord sequence (C - G - Am - F) */
function playRomanticSynth() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const actx = new AudioContext();

    const notes = [
      261.63, 329.63, 392.00, 523.25,
      196.00, 246.94, 293.66, 392.00,
      220.00, 261.63, 329.63, 440.00,
      174.61, 220.00, 261.63, 349.23
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
    console.log('Synthesizer audio not supported in this environment');
  }
}

/* 5. 7 Reasons Why Cards (Click & Keyboard Accessible Flip) */
function initReasonCards() {
  const cards = document.querySelectorAll('.reason-card');
  cards.forEach(card => {
    function toggleFlip() {
      const isFlipped = card.classList.toggle('flipped');
      card.setAttribute('aria-expanded', isFlipped ? 'true' : 'false');
      if (window.triggerParticleBurst) {
        const rect = card.getBoundingClientRect();
        window.triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
      }
    }

    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });
  });
}

/* 6. IndexedDB Gallery for Memories */
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
    console.error('IndexedDB error:', e.target.error);
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

/* 6. Curated 24 Anniversary Photos (March 2025 - October 2026) */
const ASET_FOTO_ITEMS = [
  {
    id: 'preset_1',
    filename: 'IMG_0421.JPG',
    src: 'AsetFoto/IMG_0421.JPG',
    thumb: 'AsetFoto/thumbs/IMG_0421.JPG',
    title: 'Momen Manis Bersamamu',
    caption: 'Awal musim semi penuh senyum dan kehangatan langkah kita.',
    date: '29 Maret 2025',
    year: '2025',
    timestamp: new Date('2025-03-29T14:52:53').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_2',
    filename: 'IMG_0446.JPG',
    src: 'AsetFoto/IMG_0446.JPG',
    thumb: 'AsetFoto/thumbs/IMG_0446.JPG',
    title: 'Malam Penuh Cerita',
    caption: 'Menghabiskan malam dengan obrolan hangat yang tak pernah habis.',
    date: '29 Maret 2025',
    year: '2025',
    timestamp: new Date('2025-03-29T21:50:52').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_3',
    filename: 'IMG_0821.JPG',
    src: 'AsetFoto/IMG_0821.JPG',
    thumb: 'AsetFoto/thumbs/IMG_0821.JPG',
    title: 'Senyuman Terindahmu',
    caption: 'Tatapan dan senyum manis yang selalu menenangkan duniaku.',
    date: '3 Mei 2025',
    year: '2025',
    timestamp: new Date('2025-05-03T15:26:10').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_4',
    filename: 'IMG_0827.JPG',
    src: 'AsetFoto/IMG_0827.JPG',
    thumb: 'AsetFoto/thumbs/IMG_0827.JPG',
    title: 'Langkah Kita Bersama',
    caption: 'Bergandengan tangan melangkah di setiap jalan kehidupan berdua.',
    date: '3 Mei 2025',
    year: '2025',
    timestamp: new Date('2025-05-03T16:57:06').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_5',
    filename: 'IMG_1082.JPG',
    src: 'AsetFoto/IMG_1082.JPG',
    thumb: 'AsetFoto/thumbs/IMG_1082.JPG',
    title: 'Sore yang Hangat',
    caption: 'Menikmati langit senja bersama wanita yang paling kucintai.',
    date: '24 Mei 2025',
    year: '2025',
    timestamp: new Date('2025-05-24T17:34:47').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_6',
    filename: 'IMG_1092.JPG',
    src: 'AsetFoto/IMG_1092.JPG',
    thumb: 'AsetFoto/thumbs/IMG_1092.JPG',
    title: 'Pagi yang Menyenangkan',
    caption: 'Keceriaan pagi yang selalu diawali dengan tawamu yang manis.',
    date: '25 Mei 2025',
    year: '2025',
    timestamp: new Date('2025-05-25T09:54:35').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_7',
    filename: 'IMG_1093.JPG',
    src: 'AsetFoto/IMG_1093.JPG',
    thumb: 'AsetFoto/thumbs/IMG_1093.JPG',
    title: 'Tawa Ceria Kita',
    caption: 'Candaan sederhana yang selalu berujung tawa bahagia tanpa beban.',
    date: '25 Mei 2025',
    year: '2025',
    timestamp: new Date('2025-05-25T11:02:18').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_8',
    filename: 'IMG_2112.JPG',
    src: 'AsetFoto/IMG_2112.JPG',
    thumb: 'AsetFoto/thumbs/IMG_2112.JPG',
    title: 'Perjalanan Berharga',
    caption: 'Setiap kilometer terasa begitu istimewa saat ada kamu di sisiku.',
    date: '4 Agustus 2025',
    year: '2025',
    timestamp: new Date('2025-08-04T15:45:09').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_9',
    filename: 'IMG_2898.JPG',
    src: 'AsetFoto/IMG_2898.JPG',
    thumb: 'AsetFoto/thumbs/IMG_2898.JPG',
    title: 'Momen Spesial Berdua',
    caption: 'Menikmati waktu berkualitas bersama di tengah hiruk pikuk hari.',
    date: '18 Oktober 2025',
    year: '2025',
    timestamp: new Date('2025-10-18T15:39:55').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_10',
    filename: 'IMG_2904.JPG',
    src: 'AsetFoto/IMG_2904.JPG',
    thumb: 'AsetFoto/thumbs/IMG_2904.JPG',
    title: 'Cahaya Malam Romantis',
    caption: 'Malam syahdu bertabur cahaya bersama wanita impian hatiku.',
    date: '18 Oktober 2025',
    year: '2025',
    timestamp: new Date('2025-10-18T19:22:36').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_11',
    filename: 'IMG_2912.JPG',
    src: 'AsetFoto/IMG_2912.JPG',
    thumb: 'AsetFoto/thumbs/IMG_2912.JPG',
    title: 'Hari yang Tak Terlupakan',
    caption: 'Kenangan manis yang selalu terukir rapi di sudut terdalam hati.',
    date: '19 Oktober 2025',
    year: '2025',
    timestamp: new Date('2025-10-19T11:00:01').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_12',
    filename: 'IMG_3404.JPG',
    src: 'AsetFoto/IMG_3404.JPG',
    thumb: 'AsetFoto/thumbs/IMG_3404.JPG',
    title: 'Kompak Berdua',
    caption: 'Selalu berada dalam satu frekuensi di setiap tawa dan suasana.',
    date: '2 Desember 2025',
    year: '2025',
    timestamp: new Date('2025-12-02T13:10:31').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_13',
    filename: 'IMG_3405.JPG',
    src: 'AsetFoto/IMG_3405.JPG',
    thumb: 'AsetFoto/thumbs/IMG_3405.JPG',
    title: 'Kebersamaan Manis',
    caption: 'Momen candid yang selalu memancarkan kehangatan dan ketulusan.',
    date: '2 Desember 2025',
    year: '2025',
    timestamp: new Date('2025-12-02T13:10:34').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_14',
    filename: 'IMG_3484.JPG',
    src: 'AsetFoto/IMG_3484.JPG',
    thumb: 'AsetFoto/thumbs/IMG_3484.JPG',
    title: 'Menyambut Akhir Tahun',
    caption: 'Bersyukur dapat terus berjalan berdampingan melewati waktu demi waktu.',
    date: '6 Desember 2025',
    year: '2025',
    timestamp: new Date('2025-12-06T17:15:27').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_15',
    filename: 'IMG_3495.JPG',
    src: 'AsetFoto/IMG_3495.JPG',
    thumb: 'AsetFoto/thumbs/IMG_3495.JPG',
    title: 'Dekapan Hangat',
    caption: 'Tempat ternyaman di mana hatiku selalu merasa pulang dan aman.',
    date: '6 Desember 2025',
    year: '2025',
    timestamp: new Date('2025-12-06T18:59:27').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_16',
    filename: 'IMG_3741.JPG',
    src: 'AsetFoto/IMG_3741.JPG',
    thumb: 'AsetFoto/thumbs/IMG_3741.JPG',
    title: 'Awal Tahun Penuh Cinta',
    caption: 'Membuka lembaran tahun 2026 dengan cinta yang semakin mengakar kuat.',
    date: '3 Januari 2026',
    year: '2026',
    timestamp: new Date('2026-01-03T16:54:39').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_17',
    filename: 'IMG_4107.JPG',
    src: 'AsetFoto/IMG_4107.JPG',
    thumb: 'AsetFoto/thumbs/IMG_4107.JPG',
    title: 'Menjelang Hari Kasih Sayang',
    caption: 'Bersamamu, setiap hari terasa seperti hari kasih sayang yang abadi.',
    date: '13 Februari 2026',
    year: '2026',
    timestamp: new Date('2026-02-13T14:47:42').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_18',
    filename: 'IMG_4110.JPG',
    src: 'AsetFoto/IMG_4110.JPG',
    thumb: 'AsetFoto/thumbs/IMG_4110.JPG',
    title: 'Malam Romantis Berdua',
    caption: 'Suasana syahdu yang membuat rasa syukur memilikimu berlipat ganda.',
    date: '13 Februari 2026',
    year: '2026',
    timestamp: new Date('2026-02-13T18:39:42').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_19',
    filename: 'IMG_4483.JPG',
    src: 'AsetFoto/IMG_4483.JPG',
    thumb: 'AsetFoto/thumbs/IMG_4483.JPG',
    title: 'Warna-Warni Kebahagiaan',
    caption: 'Hidupku jauh lebih berwarna dan cerah sejak kamu hadir di dalamnya.',
    date: '19 Maret 2026',
    year: '2026',
    timestamp: new Date('2026-03-19T16:15:58').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_20',
    filename: 'IMG_5388.JPG',
    src: 'AsetFoto/IMG_5388.JPG',
    thumb: 'AsetFoto/thumbs/IMG_5388.JPG',
    title: 'Kencan Bahagia',
    caption: 'Rasa rindu yang selalu hadir meski baru saja berpisah beberapa saat.',
    date: '8 Mei 2026',
    year: '2026',
    timestamp: new Date('2026-05-08T18:21:32').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_21',
    filename: 'IMG_5389.JPG',
    src: 'AsetFoto/IMG_5389.JPG',
    thumb: 'AsetFoto/thumbs/IMG_5389.JPG',
    title: 'Senyum Bahagia Kita',
    caption: 'Pancaran ketulusan dan cinta dari dua hati yang saling melengkapi.',
    date: '8 Mei 2026',
    year: '2026',
    timestamp: new Date('2026-05-08T19:04:47').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_22',
    filename: 'IMG_5641.JPG',
    src: 'AsetFoto/IMG_5641.JPG',
    thumb: 'AsetFoto/thumbs/IMG_5641.JPG',
    title: 'Hari Penuh Keceriaan',
    caption: 'Keceriaan biru yang selalu menyegarkan jiwa di setiap langkah.',
    date: '6 Juni 2026',
    year: '2026',
    timestamp: new Date('2026-06-06T13:50:55').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_23',
    filename: 'IMG_6698.JPG',
    src: 'AsetFoto/IMG_6698.JPG',
    thumb: 'AsetFoto/thumbs/IMG_6698.JPG',
    title: 'Kenangan Manis September',
    caption: 'Menghitung hari dengan debaran bahagia menuju 7 tahun kebersamaan.',
    date: '25 September 2026',
    year: '2026',
    timestamp: new Date('2026-09-25T18:02:06').getTime(),
    type: 'image',
    isPreset: true
  },
  {
    id: 'preset_24',
    filename: 'IMG_6825.JPG',
    src: 'AsetFoto/IMG_6825.JPG',
    thumb: 'AsetFoto/thumbs/IMG_6825.JPG',
    title: 'Menuju 7 Tahun Cinta Kita',
    caption: 'Tujuh tahun yang penuh arti dan cinta ini akan kujaga hingga selamanya.',
    date: '9 Oktober 2026',
    year: '2026',
    timestamp: new Date('2026-10-09T23:07:49').getTime(),
    type: 'image',
    isPreset: true
  }
];

/* Hero Photo Showcase (Interactive Polaroid Switcher) */
let currentHeroIndex = 0;
const HERO_FEATURED_IDS = ['preset_3', 'preset_1', 'preset_8', 'preset_24'];

function initHeroPhotoShowcase() {
  const polaroid = document.getElementById('heroPolaroid');
  const imgEl = document.getElementById('heroFeaturedImg');
  const titleEl = document.getElementById('heroPhotoTitle');
  const dateEl = document.getElementById('heroPhotoDate');
  const thumbsRow = document.getElementById('heroThumbsRow');

  if (!polaroid || !imgEl || !thumbsRow) return;

  const featuredItems = HERO_FEATURED_IDS.map(id => ASET_FOTO_ITEMS.find(item => item.id === id)).filter(Boolean);
  if (featuredItems.length === 0) return;

  thumbsRow.innerHTML = '';
  featuredItems.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.className = `hero-thumb-btn ${index === 0 ? 'active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Lihat sorotan ${item.title}`);
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    btn.innerHTML = `<img src="${item.thumb}" alt="${escapeHtml(item.title)}" onerror="this.src='${item.src}'">`;

    btn.addEventListener('click', () => {
      setHeroPhoto(index);
    });

    thumbsRow.appendChild(btn);
  });

  function setHeroPhoto(index) {
    currentHeroIndex = index;
    const item = featuredItems[index];
    if (!item) return;

    imgEl.style.opacity = '0.3';
    setTimeout(() => {
      imgEl.src = item.thumb;
      imgEl.onerror = () => { imgEl.src = item.src; };
      imgEl.alt = item.title;
      if (titleEl) titleEl.textContent = `${item.title} ❤️`;
      if (dateEl) dateEl.innerHTML = `<i class="fa-regular fa-calendar"></i> ${item.date}`;
      imgEl.style.opacity = '1';
    }, 150);

    const buttons = thumbsRow.querySelectorAll('.hero-thumb-btn');
    buttons.forEach((b, i) => {
      b.classList.toggle('active', i === index);
      b.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  polaroid.addEventListener('click', () => {
    const currentItem = featuredItems[currentHeroIndex];
    if (currentItem) {
      openLightbox(currentItem.id);
    }
  });

  polaroid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const currentItem = featuredItems[currentHeroIndex];
      if (currentItem) {
        openLightbox(currentItem.id);
      }
    }
  });
}

/* 4 Milestone Highlights in Gallery */
function initGalleryHighlights() {
  const container = document.getElementById('highlightsStrip');
  if (!container) return;

  const milestones = [
    { id: 'preset_1', tag: 'Awal Kenangan', title: 'Momen Pertama Kita', item: ASET_FOTO_ITEMS[0] },
    { id: 'preset_8', tag: 'Petualangan', title: 'Perjalanan Berdua', item: ASET_FOTO_ITEMS[7] },
    { id: 'preset_16', tag: 'Tahun 2026', title: 'Awal Tahun Bersama', item: ASET_FOTO_ITEMS[15] },
    { id: 'preset_24', tag: '7 Tahun Cinta', title: 'Menuju 16 Des 2026', item: ASET_FOTO_ITEMS[23] }
  ];

  container.innerHTML = '';
  milestones.forEach(m => {
    if (!m.item) return;
    const card = document.createElement('div');
    card.className = 'highlight-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Buka momen sorotan: ${m.title}`);

    card.innerHTML = `
      <img src="${m.item.thumb}" alt="${escapeHtml(m.title)}" loading="lazy" onerror="this.src='${m.item.src}'">
      <div class="highlight-overlay">
        <span class="hl-tag">${m.tag}</span>
        <h4 class="hl-title">${m.title}</h4>
        <span class="hl-date"><i class="fa-regular fa-calendar"></i> ${m.item.date}</span>
      </div>
    `;

    function trigger() {
      openLightbox(m.item.id);
    }

    card.addEventListener('click', trigger);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
      }
    });

    container.appendChild(card);
  });
}

/* Gallery Moments Loader & Renderer */
function loadGalleryMoments() {
  if (!db) {
    // If DB is still initializing, render preset photos immediately
    allMomentsCache = [...ASET_FOTO_ITEMS];
    applyFilterAndRender();
    return;
  }

  try {
    const tx = db.transaction('moments', 'readonly');
    const store = tx.objectStore('moments');
    const request = store.getAll();

    request.onsuccess = () => {
      const userRaw = request.result || [];
      const userMoments = userRaw.map(u => ({
        id: u.id,
        src: u.dataUrl,
        thumb: u.dataUrl,
        title: u.caption || u.name || 'Momen Spesial',
        caption: u.caption || 'Kenangan manis yang diunggah ke dalam web.',
        date: u.date || 'Unggahan Baru',
        year: 'user',
        timestamp: u.timestamp || Date.now(),
        type: u.type || 'image',
        isPreset: false
      }));

      allMomentsCache = [...userMoments, ...ASET_FOTO_ITEMS];
      applyFilterAndRender();
    };

    request.onerror = () => {
      allMomentsCache = [...ASET_FOTO_ITEMS];
      applyFilterAndRender();
    };
  } catch (err) {
    allMomentsCache = [...ASET_FOTO_ITEMS];
    applyFilterAndRender();
  }
}

function applyFilterAndRender() {
  currentVisibleMoments = allMomentsCache.filter(item => {
    if (currentFilter === 'all') return true;
    if (currentFilter === '2025') return item.year === '2025';
    if (currentFilter === '2026') return item.year === '2026';
    if (currentFilter === 'user') return !item.isPreset;
    return true;
  });

  renderGalleryGrid(currentVisibleMoments);
}

function renderGalleryGrid(moments) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (moments.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: #94a3b8;">
        <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: #00b4d8; margin-bottom: 15px;" aria-hidden="true"></i>
        <h3 style="color: #fff; font-size: 1.3rem; margin-bottom: 8px;">Belum ada momen untuk kategori ini</h3>
        <p style="font-size: 0.9rem;">Pilih kategori lain atau tambahkan foto kenangan baru di atas!</p>
      </div>
    `;
    return;
  }

  moments.forEach(item => {
    const card = document.createElement('div');
    card.className = 'moment-card';
    card.dataset.id = item.id;

    const mediaHtml = item.type === 'video'
      ? `<video src="${item.src}" preload="metadata"></video>`
      : `<img src="${item.thumb}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${item.src}'">`;

    const badgeText = item.isPreset ? (item.year || 'Kenangan') : 'Unggahan Baru';
    const badgeIcon = item.type === 'video' ? 'fa-video' : (item.isPreset ? 'fa-heart' : 'fa-sparkles');

    card.innerHTML = `
      <div class="moment-media" role="button" tabindex="0" aria-label="Buka foto ${escapeHtml(item.title)} di resolusi penuh">
        ${mediaHtml}
        <span class="media-type-badge ${item.type === 'video' ? 'video' : 'photo'}">
          <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
        </span>
        <div class="moment-overlay" aria-hidden="true">
          <i class="fa-solid fa-expand"></i>
        </div>
      </div>
      <div class="moment-details">
        <div class="moment-caption" style="font-weight: 600; font-size: 1.05rem; color: #fff;">${escapeHtml(item.title)}</div>
        <p style="font-size: 0.84rem; color: #cbd5e1; line-height: 1.4; margin: 2px 0 6px 0;">${escapeHtml(item.caption)}</p>
        <div class="moment-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
          <span style="font-size: 0.78rem; color: var(--blue-sky);"><i class="fa-regular fa-calendar"></i> ${item.date}</span>
          ${!item.isPreset ? `
            <button class="moment-del-btn" onclick="deleteMoment(${item.id})" title="Hapus Momen Tambahan" aria-label="Hapus momen tambahan ini">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : `
            <span style="font-size: 0.72rem; color: #ff758f; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-heart"></i> Abadi
            </span>
          `}
        </div>
      </div>
    `;

    const mediaBtn = card.querySelector('.moment-media');
    if (mediaBtn) {
      function trigger() {
        openLightbox(item.id);
      }
      mediaBtn.addEventListener('click', trigger);
      mediaBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger();
        }
      });
    }

    grid.appendChild(card);
  });
}

window.deleteMoment = function(id) {
  if (!confirm('Apakah kamu yakin ingin menghapus momen tambahan ini?')) return;
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
      applyFilterAndRender();
    });
  });

  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (!confirm('Hapus seluruh foto & video tambahan yang Anda upload secara mandiri dari browser ini? (24 foto kenangan utama tidak akan terhapus)')) return;
      if (!db) return;
      const tx = db.transaction('moments', 'readwrite');
      tx.objectStore('moments').clear();
      tx.oncomplete = () => {
        loadGalleryMoments();
        alert('Seluruh momen tambahan telah dibersihkan!');
      };
    });
  }
}

/* 7. Lightbox Fullscreen Modal with Carousel Navigation */
function setupLightbox() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const deleteBtn = document.getElementById('lightboxDeleteBtn');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', lightboxPrev);
  if (nextBtn) nextBtn.addEventListener('click', lightboxNext);

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

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      lightboxPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      lightboxNext();
    }
  });

  // Touch Swipe for Mobile Navigation
  let touchStartX = 0;
  let touchEndX = 0;

  if (modal) {
    modal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleLightboxSwipe();
    }, { passive: true });
  }

  function handleLightboxSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        lightboxPrev(); // Swiped right -> go to previous
      } else {
        lightboxNext(); // Swiped left -> go to next
      }
    }
  }
}

function lightboxPrev() {
  if (currentVisibleMoments.length <= 1) return;
  activeMomentIndex = (activeMomentIndex - 1 + currentVisibleMoments.length) % currentVisibleMoments.length;
  renderLightboxCurrent();
}

function lightboxNext() {
  if (currentVisibleMoments.length <= 1) return;
  activeMomentIndex = (activeMomentIndex + 1) % currentVisibleMoments.length;
  renderLightboxCurrent();
}

window.openLightbox = function(id) {
  const searchList = currentVisibleMoments.length > 0 ? currentVisibleMoments : allMomentsCache;
  const foundIndex = searchList.findIndex(item => String(item.id) === String(id));

  if (foundIndex !== -1) {
    currentVisibleMoments = searchList;
    activeMomentIndex = foundIndex;
  } else {
    const presetIndex = ASET_FOTO_ITEMS.findIndex(item => String(item.id) === String(id));
    if (presetIndex !== -1) {
      currentVisibleMoments = ASET_FOTO_ITEMS;
      activeMomentIndex = presetIndex;
    } else {
      return;
    }
  }

  renderLightboxCurrent();

  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const closeBtn = document.getElementById('lightboxCloseBtn');
    if (closeBtn) closeBtn.focus();
  }
};

function renderLightboxCurrent() {
  const item = currentVisibleMoments[activeMomentIndex];
  if (!item) return;

  activeMomentId = item.id;
  const mediaWrapper = document.getElementById('lightboxMediaWrapper');
  const titleEl = document.getElementById('lightboxTitle');
  const dateEl = document.getElementById('lightboxDate');
  const captionEl = document.getElementById('lightboxCaption');
  const counterEl = document.getElementById('lightboxCounter');
  const origLinkEl = document.getElementById('lightboxOriginalLink');
  const deleteBtn = document.getElementById('lightboxDeleteBtn');
  const permBadge = document.getElementById('lightboxPermanentBadge');

  if (mediaWrapper) {
    mediaWrapper.innerHTML = item.type === 'video'
      ? `<video src="${item.src}" controls autoplay style="max-height: 65vh; max-width: 100%; border-radius: 12px;"></video>`
      : `<img src="${item.src}" alt="${escapeHtml(item.title)}" onerror="this.src='${item.thumb}'" style="max-height: 65vh; max-width: 100%; border-radius: 12px;">`;
  }

  if (titleEl) titleEl.textContent = item.title;
  if (dateEl) dateEl.innerHTML = `<i class="fa-regular fa-calendar"></i> ${item.date}`;
  if (captionEl) captionEl.textContent = item.caption;
  if (counterEl) counterEl.textContent = `${activeMomentIndex + 1} / ${currentVisibleMoments.length}`;

  if (origLinkEl) {
    origLinkEl.href = item.src;
  }

  if (deleteBtn && permBadge) {
    if (item.isPreset) {
      deleteBtn.style.display = 'none';
      permBadge.style.display = 'inline-flex';
    } else {
      deleteBtn.style.display = 'inline-flex';
      permBadge.style.display = 'none';
    }
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  const mediaWrapper = document.getElementById('lightboxMediaWrapper');
  if (mediaWrapper) mediaWrapper.innerHTML = '';
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  activeMomentId = null;
}

/* 8. Love Letter with Typewriter Animation */
function initLetterFeatures() {
  const typewriterBtn = document.getElementById('typewriterBtn');
  const sendLoveHeartBtn = document.getElementById('sendLoveHeartBtn');
  const letterBody = document.getElementById('letterText');

  if (!letterBody) return;

  if (typewriterBtn) {
    typewriterBtn.addEventListener('click', () => {
      const textToType = [
        "Selamat hari jadi yang ke-7 tahun, wanitaku yang paling luar biasa.",
        "Rasanya baru kemarin kita memulai kisah ini, namun setiap detik bersamamu selalu terasa begitu istimewa dan penuh makna.",
        "Tujuh tahun bukan sekadar angka. Di dalamnya ada ribuan perjalanan, jutaan tawa, canda, dan saling menguatkan di saat lelah. Kamu adalah rumah terbaik tempat hatiku selalu ingin pulang.",
        "Warna merah hari ini adalah janji cintaku yang akan selalu membara untukmu, dan warna biru adalah kedamaian serta keceriaan yang selalu kamu berikan dalam setiap hariku.",
        "Terima kasih telah memilihku, bertahan bersamaku, dan mencintaiku tanpa syarat. Aku mencintaimu hari ini, esok, di 16 Desember 2026, hingga selamanya. ❤️💙"
      ];

      letterBody.innerHTML = '';
      let paraIndex = 0;
      let charIndex = 0;
      let currentP = document.createElement('p');
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

/* 9. Wishes for Her (LocalStorage Persistence) */
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

/* 10. Global Keyboard Shortcuts */
function initGlobalKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Space key outside input/textarea toggles audio
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      if (window.playMusic) {
        if (isPlaying) {
          const audio = document.getElementById('audioPlayer');
          if (audio) audio.pause();
        } else {
          window.playMusic();
        }
      }
    }
  });
}

/* Utility to sanitize text */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
