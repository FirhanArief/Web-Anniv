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
  allMomentsCache = [...ASET_FOTO_ITEMS];
  currentVisibleMoments = [...ASET_FOTO_ITEMS];
  initParticleCanvas();
  initCountdown();
  initMusicPlayer();
  initSurpriseGate();
  initReasonCards();
  initHeroPhotoShowcase();
  initGalleryHighlights();
  initIndexedDB();
  initLiveCameraFeature();
  initLetterFeatures();
  initWishesFeature();
  initClickSparkles();
  initGlobalKeyboardShortcuts();
  initScrollSpyAndNav();
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

/* 2. Romantic PIN Lock Gate (16122019 - Tanggal Jadian Kita) */
function initSurpriseGate() {
  const TARGET_PIN = '16122019';
  const gate = document.getElementById('surpriseGate');
  const mainContent = document.getElementById('mainContent');
  const envelope = document.getElementById('envelopeWrapper');
  const lockSeal = document.getElementById('lockIconSeal');
  const lockIcon = document.getElementById('lockIconMain');
  const displayWrapper = document.getElementById('pinDisplayWrapper');
  const statusMsg = document.getElementById('pinStatusMsg');
  const openSurpriseBtn = document.getElementById('openSurpriseBtn');
  const hintBtn = document.getElementById('pinHintBtn');
  const backspaceBtn = document.getElementById('pinBackspaceBtn');
  const keypadBtns = document.querySelectorAll('.pin-keypad .keypad-btn[data-key]');
  const relockBtn = document.getElementById('navRelockBtn');

  let enteredPin = '';
  let isChecking = false;

  function updateDots() {
    for (let i = 0; i < 8; i++) {
      const dot = document.getElementById(`pinDot${i}`);
      if (dot) {
        dot.classList.toggle('filled', i < enteredPin.length);
      }
    }
  }

  function setStatus(text, type = 'normal') {
    if (!statusMsg) return;
    statusMsg.textContent = text;
    statusMsg.classList.remove('error', 'success');
    if (type === 'error') statusMsg.classList.add('error');
    if (type === 'success') statusMsg.classList.add('success');
  }

  function handleDigit(digit) {
    if (isChecking) return;
    if (enteredPin.length < 8) {
      enteredPin += digit;
      updateDots();
      if (displayWrapper) displayWrapper.classList.remove('error');

      if (enteredPin.length === 8) {
        validatePin();
      }
    }
  }

  function handleBackspace() {
    if (isChecking) return;
    if (enteredPin.length > 0) {
      enteredPin = enteredPin.slice(0, -1);
      updateDots();
      if (displayWrapper) displayWrapper.classList.remove('error');
      setStatus('Masukkan tanggal hari pertama kita jadian (DDMMYYYY)', 'normal');
    }
  }

  function showHint() {
    setStatus('Petunjuk: Tanggal hari jadian kita berdua format DDMMYYYY (16-12-2019) 🥰', 'normal');
    if (window.triggerParticleBurst) {
      const rect = hintBtn ? hintBtn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      window.triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    }
  }

  function validatePin() {
    if (isChecking) return;
    isChecking = true;

    if (enteredPin === TARGET_PIN) {
      // SUCCESS: PIN Correct!
      if (displayWrapper) {
        displayWrapper.classList.remove('error');
        displayWrapper.classList.add('success');
      }
      setStatus('PIN Benar! Selamat datang di perayaan 7 tahun cinta kita, Sayang! ❤️💙', 'success');

      if (lockSeal) lockSeal.classList.add('unlocked');
      if (lockIcon) {
        lockIcon.classList.remove('fa-lock');
        lockIcon.classList.add('fa-lock-open');
      }

      if (envelope) {
        envelope.classList.add('opened');
      }

      // Celebratory particle burst
      if (window.triggerParticleBurst) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        window.triggerParticleBurst(cx, cy, 60);
        setTimeout(() => window.triggerParticleBurst(cx - 120, cy - 80, 40), 200);
        setTimeout(() => window.triggerParticleBurst(cx + 120, cy - 80, 40), 400);
      }

      // Play anniversary romantic music
      if (window.playMusic) {
        window.playMusic();
      }

      // Open the gate smoothly
      setTimeout(() => {
        if (gate) gate.classList.add('open');
        if (mainContent) mainContent.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        isChecking = false;
      }, 950);
    } else {
      // ERROR: Incorrect PIN
      if (displayWrapper) {
        displayWrapper.classList.remove('success');
        displayWrapper.classList.add('error');
      }
      setStatus('Ups, PIN salah sayang! Coba ingat tanggal pertama kita jadian ya (16-12-2019) 💕', 'error');

      setTimeout(() => {
        enteredPin = '';
        updateDots();
        if (displayWrapper) displayWrapper.classList.remove('error');
        isChecking = false;
      }, 700);
    }
  }

  // Keypad click handlers
  keypadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const digit = btn.dataset.key;
      if (digit !== undefined) handleDigit(digit);
    });
  });

  if (backspaceBtn) {
    backspaceBtn.addEventListener('click', handleBackspace);
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', showHint);
  }

  if (openSurpriseBtn) {
    openSurpriseBtn.addEventListener('click', () => {
      if (enteredPin.length === 8) {
        validatePin();
      } else {
        setStatus('Ketikkan lengkap 8 digit PIN tanggal jadian kita ya sayang! 💕', 'error');
        if (displayWrapper) {
          displayWrapper.classList.remove('error');
          void displayWrapper.offsetWidth;
          displayWrapper.classList.add('error');
        }
      }
    });
  }

  // Physical keyboard support when gate is active
  document.addEventListener('keydown', (e) => {
    if (!gate || gate.classList.contains('open')) return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (enteredPin.length === 8) {
        validatePin();
      } else {
        setStatus('Ketikkan lengkap 8 digit PIN tanggal jadian kita ya sayang! 💕', 'error');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      enteredPin = '';
      updateDots();
      setStatus('Masukkan tanggal hari pertama kita jadian (DDMMYYYY)', 'normal');
    }
  });

  // Relock Button Handler (Navbar)
  if (relockBtn) {
    relockBtn.addEventListener('click', () => {
      if (gate) {
        gate.classList.remove('open');
      }
      if (mainContent) {
        mainContent.classList.add('hidden');
      }
      enteredPin = '';
      updateDots();
      isChecking = false;

      if (displayWrapper) {
        displayWrapper.classList.remove('success', 'error');
      }
      if (envelope) {
        envelope.classList.remove('opened');
      }
      if (lockSeal) {
        lockSeal.classList.remove('unlocked');
      }
      if (lockIcon) {
        lockIcon.classList.remove('fa-lock-open');
        lockIcon.classList.add('fa-lock');
      }

      setStatus('Masukkan tanggal hari pertama kita jadian (DDMMYYYY)', 'normal');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (window.showToast) {
        showToast('Website perayaan berhasil dikunci kembali. Masukkan PIN untuk membuka.', 'info');
      }
    });
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
  const navMusicPill = document.getElementById('navMusicPill');
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
      if (navMusicPill) {
        navMusicPill.classList.add('playing');
        const txt = navMusicPill.querySelector('.nav-pill-text');
        if (txt) txt.textContent = 'Pause Lagu';
      }
    } else {
      if (playIcon) {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
      }
      if (vinylDisc) vinylDisc.classList.remove('playing');
      if (floatingMusicBtn) floatingMusicBtn.classList.remove('active');
      if (navMusicPill) {
        navMusicPill.classList.remove('playing');
        const txt = navMusicPill.querySelector('.nav-pill-text');
        if (txt) txt.textContent = 'Putar Lagu';
      }
    }
  }

  if (mainPlayBtn) mainPlayBtn.addEventListener('click', togglePlay);
  if (navMusicPill) navMusicPill.addEventListener('click', togglePlay);

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
    function seekAudio(e) {
      if (!audio || !audio.duration) return;
      const rect = progressContainer.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : undefined);
      if (clientX === undefined) return;
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      audio.currentTime = (clickX / rect.width) * audio.duration;
    }
    progressContainer.addEventListener('click', seekAudio);
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
  allMomentsCache = [...ASET_FOTO_ITEMS];
  currentVisibleMoments = [...ASET_FOTO_ITEMS];

  setupDropZoneAndUpload();
  setupGalleryFilters();
  setupLightbox();

  const DB_NAME = 'AnniversaryMemoriesDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'moments';

  try {
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
      console.warn('IndexedDB unavailable or restricted in this environment (offline/file protocol), using preset memories:', e.target ? e.target.error : e);
      loadGalleryMoments();
    };
  } catch (err) {
    console.warn('IndexedDB initialization exception, falling back to preset moments:', err);
    loadGalleryMoments();
  }
}

/* Upload & Storage Helpers */
const USER_MOMENTS_STORAGE_KEY = 'anniversary_user_moments_v1';

function getStoredUserMoments() {
  try {
    const raw = localStorage.getItem(USER_MOMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('LocalStorage read error:', err);
    return [];
  }
}

function persistUserMoments(momentsList) {
  try {
    localStorage.setItem(USER_MOMENTS_STORAGE_KEY, JSON.stringify(momentsList));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item ${type === 'success' ? 'toast-success' : ''}`;
  const icon = type === 'success' ? 'fa-circle-check text-blue' : 'fa-circle-info text-red';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }, 4000);
}

function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

let pendingFilesQueue = [];
let currentPreviewIndex = 0;
let currentPreviewDataUrl = null;
let currentPreviewFileType = 'image';

function setupDropZoneAndUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const nativeCameraPhoto = document.getElementById('nativeCameraPhoto');
  const nativeCameraVideo = document.getElementById('nativeCameraVideo');
  const previewBox = document.getElementById('uploadPreviewBox');
  const previewImg = document.getElementById('previewImg');
  const previewVideo = document.getElementById('previewVideo');
  const previewFileBadge = document.getElementById('previewFileBadge');
  const previewTitleInput = document.getElementById('previewTitleInput');
  const previewCaptionInput = document.getElementById('previewCaptionInput');
  const previewDateInput = document.getElementById('previewDateInput');
  const previewCategorySelect = document.getElementById('previewCategorySelect');
  const btnConfirmUpload = document.getElementById('btnConfirmUpload');
  const btnCancelUpload = document.getElementById('btnCancelUpload');

  if (!dropZone || !fileInput) return;

  if (previewDateInput) {
    const today = new Date().toISOString().split('T')[0];
    previewDateInput.value = today;
  }

  [nativeCameraPhoto, nativeCameraVideo].forEach(inputEl => {
    if (inputEl) {
      inputEl.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }
      });
    }
  });

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
      handleFilesSelected(files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
  });

  function handleFilesSelected(files) {
    const validFiles = Array.from(files).filter(file => {
      return file.type.startsWith('image/') || file.type.startsWith('video/');
    });

    if (validFiles.length === 0) {
      showToast('Pilih file berformat foto atau video (JPG, PNG, MP4, dsb).', 'info');
      return;
    }

    pendingFilesQueue = validFiles;
    currentPreviewIndex = 0;
    showFilePreview(pendingFilesQueue[0]);
  }

  async function showFilePreview(file) {
    if (!previewBox || !file) return;

    const isVideo = file.type.startsWith('video/');
    currentPreviewFileType = isVideo ? 'video' : 'image';

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
    if (previewFileBadge) {
      previewFileBadge.textContent = `${isVideo ? 'Video' : 'Foto'}: ${file.name} (${fileSizeMb} MB)`;
    }

    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    if (previewTitleInput) {
      previewTitleInput.value = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }

    if (isVideo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentPreviewDataUrl = e.target.result;
        if (previewImg) previewImg.style.display = 'none';
        if (previewVideo) {
          previewVideo.src = currentPreviewDataUrl;
          previewVideo.style.display = 'block';
        }
        previewBox.classList.add('active');
        previewBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      reader.readAsDataURL(file);
    } else {
      const compressedUrl = await compressImageFile(file);
      currentPreviewDataUrl = compressedUrl;

      if (previewVideo) {
        previewVideo.pause();
        previewVideo.style.display = 'none';
      }
      if (previewImg) {
        previewImg.src = currentPreviewDataUrl;
        previewImg.style.display = 'block';
      }
      previewBox.classList.add('active');
      previewBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function closePreview() {
    if (previewBox) previewBox.classList.remove('active');
    if (previewVideo) {
      previewVideo.pause();
      previewVideo.src = '';
    }
    if (previewImg) previewImg.src = '';
    if (fileInput) fileInput.value = '';
    if (cameraInput) cameraInput.value = '';
    pendingFilesQueue = [];
    currentPreviewDataUrl = null;
  }

  if (btnCancelUpload) {
    btnCancelUpload.addEventListener('click', closePreview);
  }

  if (btnConfirmUpload) {
    btnConfirmUpload.addEventListener('click', () => {
      if (!currentPreviewDataUrl || pendingFilesQueue.length === 0) return;

      const file = pendingFilesQueue[currentPreviewIndex];
      const title = previewTitleInput ? previewTitleInput.value.trim() : '';
      const caption = previewCaptionInput ? previewCaptionInput.value.trim() : '';
      const rawDate = previewDateInput ? previewDateInput.value : '';
      const category = previewCategorySelect ? previewCategorySelect.value : 'user';

      let formattedDate = 'Hari Ini';
      if (rawDate) {
        try {
          const parts = rawDate.split('-');
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
          formattedDate = rawDate;
        }
      }

      btnConfirmUpload.disabled = true;
      btnConfirmUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

      saveNewUploadedMoment({
        file: file,
        dataUrl: currentPreviewDataUrl,
        type: currentPreviewFileType,
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        caption: caption || 'Momen manis yang diabadikan bersama.',
        date: formattedDate,
        category: category
      });

      setTimeout(() => {
        btnConfirmUpload.disabled = false;
        btnConfirmUpload.innerHTML = '<i class="fa-solid fa-heart-circle-plus"></i> Simpan ke Galeri Cinta';
        closePreview();
      }, 300);
    });
  }
}

function saveNewUploadedMoment({ file, dataUrl, type, title, caption, date, category }) {
  const newId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const momentItem = {
    id: newId,
    name: file.name,
    type: type,
    src: dataUrl,
    thumb: dataUrl,
    title: title,
    caption: caption,
    date: date,
    year: category || 'user',
    timestamp: Date.now(),
    isPreset: false
  };

  const localMoments = getStoredUserMoments();
  localMoments.unshift(momentItem);
  persistUserMoments(localMoments);

  if (db) {
    try {
      const tx = db.transaction('moments', 'readwrite');
      const store = tx.objectStore('moments');
      store.add(momentItem);
    } catch (err) {
      console.warn('IndexedDB write warning:', err);
    }
  }

  allMomentsCache = [momentItem, ...allMomentsCache.filter(m => m.id !== newId)];

  applyFilterAndRender();

  if (window.triggerParticleBurst) {
    window.triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 45);
  }

  showToast(`Momen "${escapeHtml(title)}" berhasil disimpan ke Galeri Cinta! ❤️💙`, 'success');

  setTimeout(() => {
    const newCard = document.querySelector(`.moment-card[data-id="${newId}"]`);
    if (newCard) {
      newCard.classList.add('new-moment-highlight');
      newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

function setDirectMediaPreview({ type, dataUrl, defaultTitle, fileInfo }) {
  const previewBox = document.getElementById('uploadPreviewBox');
  const previewImg = document.getElementById('previewImg');
  const previewVideo = document.getElementById('previewVideo');
  const previewFileBadge = document.getElementById('previewFileBadge');
  const previewTitleInput = document.getElementById('previewTitleInput');
  const previewDateInput = document.getElementById('previewDateInput');

  if (!previewBox) return;

  currentPreviewFileType = type;
  currentPreviewDataUrl = dataUrl;
  pendingFilesQueue = [{ name: defaultTitle + (type === 'video' ? '.mp4' : '.jpg') }];
  currentPreviewIndex = 0;

  if (previewFileBadge) {
    previewFileBadge.textContent = fileInfo;
  }
  if (previewTitleInput) {
    previewTitleInput.value = defaultTitle;
  }
  if (previewDateInput && !previewDateInput.value) {
    previewDateInput.value = new Date().toISOString().split('T')[0];
  }

  if (type === 'video') {
    if (previewImg) previewImg.style.display = 'none';
    if (previewVideo) {
      previewVideo.src = dataUrl;
      previewVideo.style.display = 'block';
    }
  } else {
    if (previewVideo) {
      previewVideo.pause();
      previewVideo.style.display = 'none';
    }
    if (previewImg) {
      previewImg.src = dataUrl;
      previewImg.style.display = 'block';
    }
  }

  previewBox.classList.add('active');
  previewBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ================= LIVE DEVICE CAMERA CONTROLLER ================= */
let currentCameraStream = null;
let currentFacingMode = 'user';
let activeCameraMode = 'photo';
let mediaRecorder = null;
let recordedVideoChunks = [];
let recordTimerInterval = null;
let recordSeconds = 0;

function initLiveCameraFeature() {
  const openCameraBtn = document.getElementById('openLiveCameraBtn');
  const cameraModal = document.getElementById('cameraModal');
  const cameraBackdrop = document.getElementById('cameraBackdrop');
  const cameraCloseX = document.getElementById('cameraCloseX');
  const cameraCancelBtn = document.getElementById('camCancelBtn');
  const videoFeed = document.getElementById('cameraVideoFeed');
  const canvas = document.getElementById('cameraCanvas');
  const flashOverlay = document.getElementById('cameraFlashOverlay');
  const tabPhoto = document.getElementById('camTabPhoto');
  const tabVideo = document.getElementById('camTabVideo');
  const capturePhotoBtn = document.getElementById('camCapturePhotoBtn');
  const recordVideoBtn = document.getElementById('camRecordVideoBtn');
  const switchFacingBtn = document.getElementById('camSwitchFacingBtn');
  const recBadge = document.getElementById('cameraRecordingBadge');
  const timerText = document.getElementById('cameraTimerText');
  const nativePhotoInput = document.getElementById('nativeCameraPhoto');
  const nativeVideoInput = document.getElementById('nativeCameraVideo');

  if (!openCameraBtn || !cameraModal) return;

  openCameraBtn.addEventListener('click', async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      cameraModal.classList.add('active');
      cameraModal.setAttribute('aria-hidden', 'false');
      setCameraMode('photo');
      const ok = await startCameraStream(currentFacingMode, false);
      if (!ok) {
        closeCamera();
        if (nativePhotoInput) nativePhotoInput.click();
      }
    } else if (nativePhotoInput) {
      nativePhotoInput.click();
    }
  });

  [cameraCloseX, cameraCancelBtn, cameraBackdrop].forEach(el => {
    if (el) el.addEventListener('click', closeCamera);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cameraModal.classList.contains('active')) {
      closeCamera();
    }
  });

  if (tabPhoto) {
    tabPhoto.addEventListener('click', () => setCameraMode('photo'));
  }
  if (tabVideo) {
    tabVideo.addEventListener('click', () => setCameraMode('video'));
  }

  function setCameraMode(mode) {
    if (mediaRecorder && mediaRecorder.state === 'recording') return;
    activeCameraMode = mode;
    if (tabPhoto) {
      tabPhoto.classList.toggle('active', mode === 'photo');
      tabPhoto.setAttribute('aria-selected', mode === 'photo' ? 'true' : 'false');
    }
    if (tabVideo) {
      tabVideo.classList.toggle('active', mode === 'video');
      tabVideo.setAttribute('aria-selected', mode === 'video' ? 'true' : 'false');
    }
    if (capturePhotoBtn) capturePhotoBtn.style.display = mode === 'photo' ? 'flex' : 'none';
    if (recordVideoBtn) recordVideoBtn.style.display = mode === 'video' ? 'flex' : 'none';

    if (cameraModal.classList.contains('active')) {
      startCameraStream(currentFacingMode, mode === 'video');
    }
  }

  if (switchFacingBtn) {
    switchFacingBtn.addEventListener('click', async () => {
      currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      await startCameraStream(currentFacingMode, activeCameraMode === 'video');
    });
  }

  if (capturePhotoBtn) {
    capturePhotoBtn.addEventListener('click', () => {
      if (!videoFeed || !canvas) return;

      const w = videoFeed.videoWidth || 1280;
      const h = videoFeed.videoHeight || 720;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoFeed, 0, 0, w, h);

      if (flashOverlay) {
        flashOverlay.classList.remove('flash');
        void flashOverlay.offsetWidth;
        flashOverlay.classList.add('flash');
      }

      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      closeCamera();

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setDirectMediaPreview({
        type: 'image',
        dataUrl: photoDataUrl,
        defaultTitle: `Foto Kamera Kita (${timeStr})`,
        fileInfo: `Kamera Perangkat (${Math.round(photoDataUrl.length / 1024 / 1.33)} KB)`
      });
    });
  }

  if (recordVideoBtn) {
    recordVideoBtn.addEventListener('click', () => {
      if (!currentCameraStream) return;

      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    });
  }

  function startVideoRecording() {
    if (!currentCameraStream) return;
    recordedVideoChunks = [];

    let mimeType = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
    }

    try {
      mediaRecorder = new MediaRecorder(currentCameraStream, { mimeType: mimeType });
    } catch (e) {
      try {
        mediaRecorder = new MediaRecorder(currentCameraStream);
      } catch (err) {
        showToast('Perekaman video langsung tidak didukung browser ini.', 'info');
        if (nativeVideoInput) nativeVideoInput.click();
        return;
      }
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedVideoChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      clearInterval(recordTimerInterval);
      if (recBadge) recBadge.style.display = 'none';
      if (recordVideoBtn) recordVideoBtn.classList.remove('recording');

      const blob = new Blob(recordedVideoChunks, { type: mediaRecorder.mimeType || 'video/mp4' });
      const reader = new FileReader();
      reader.onload = () => {
        const videoDataUrl = reader.result;
        closeCamera();
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setDirectMediaPreview({
          type: 'video',
          dataUrl: videoDataUrl,
          defaultTitle: `Video Rekaman Kita (${timeStr})`,
          fileInfo: `Rekaman Kamera (${(blob.size / 1024 / 1024).toFixed(2)} MB)`
        });
      };
      reader.readAsDataURL(blob);
    };

    mediaRecorder.start(250);
    recordSeconds = 0;
    if (timerText) timerText.textContent = '00:00';
    if (recBadge) recBadge.style.display = 'flex';
    if (recordVideoBtn) recordVideoBtn.classList.add('recording');

    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
      const secs = String(recordSeconds % 60).padStart(2, '0');
      if (timerText) timerText.textContent = `${mins}:${secs}`;

      if (recordSeconds >= 60) {
        stopVideoRecording();
      }
    }, 1000);
  }

  function stopVideoRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }

  async function startCameraStream(facingMode, withAudio) {
    stopCameraStream();
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: withAudio
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentCameraStream = stream;
      if (videoFeed) {
        videoFeed.srcObject = stream;
        await videoFeed.play();
      }
      return true;
    } catch (err) {
      console.warn('Gagal mengakses kamera:', err);
      return false;
    }
  }

  function stopCameraStream() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      try { mediaRecorder.stop(); } catch (e) {}
    }
    clearInterval(recordTimerInterval);
    if (currentCameraStream) {
      currentCameraStream.getTracks().forEach(track => track.stop());
      currentCameraStream = null;
    }
    if (videoFeed) {
      videoFeed.srcObject = null;
    }
  }

  function closeCamera() {
    stopCameraStream();
    if (cameraModal) {
      cameraModal.classList.remove('active');
      cameraModal.setAttribute('aria-hidden', 'true');
    }
  }
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

  const existingButtons = thumbsRow.querySelectorAll('.hero-thumb-btn');
  if (existingButtons.length === featuredItems.length) {
    existingButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        setHeroPhoto(index);
      });
    });
  } else {
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
  }

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

  const existingCards = container.querySelectorAll('.highlight-card');
  if (existingCards.length === milestones.length) {
    existingCards.forEach((card, index) => {
      const m = milestones[index];
      if (!m || !m.item) return;
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
    });
    return;
  }

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
  const localMoments = getStoredUserMoments();

  if (!db) {
    allMomentsCache = [...localMoments, ...ASET_FOTO_ITEMS];
    applyFilterAndRender();
    return;
  }

  try {
    const tx = db.transaction('moments', 'readonly');
    const store = tx.objectStore('moments');
    const request = store.getAll();

    request.onsuccess = () => {
      const dbRaw = request.result || [];
      const dbMoments = dbRaw.map(u => ({
        id: u.id,
        src: u.dataUrl || u.src,
        thumb: u.dataUrl || u.thumb || u.src,
        title: u.title || u.caption || u.name || 'Momen Spesial',
        caption: u.caption || 'Kenangan manis yang diunggah ke dalam web.',
        date: u.date || 'Unggahan Baru',
        year: u.year || 'user',
        timestamp: u.timestamp || Date.now(),
        type: u.type || 'image',
        isPreset: false
      }));

      const mergedMap = new Map();
      localMoments.forEach(m => mergedMap.set(String(m.id), m));
      dbMoments.forEach(m => mergedMap.set(String(m.id), m));
      const combinedUserMoments = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      allMomentsCache = [...combinedUserMoments, ...ASET_FOTO_ITEMS];
      applyFilterAndRender();
    };

    request.onerror = () => {
      allMomentsCache = [...localMoments, ...ASET_FOTO_ITEMS];
      applyFilterAndRender();
    };
  } catch (err) {
    allMomentsCache = [...localMoments, ...ASET_FOTO_ITEMS];
    applyFilterAndRender();
  }
}

function applyFilterAndRender() {
  const userCount = allMomentsCache.filter(item => !item.isPreset).length;
  const userFilterBtn = document.querySelector('.filter-btn[data-filter="user"]');
  if (userFilterBtn) {
    userFilterBtn.innerHTML = `<i class="fa-solid fa-sparkles"></i> Unggahan Baru (${userCount})`;
  }

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
      ? `<video src="${item.src}" preload="metadata" muted playsinline></video>`
      : `<img src="${item.thumb}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${item.src}'">`;

    const badgeText = item.isPreset ? (item.year || 'Kenangan') : 'Unggahan Baru';
    const badgeIcon = item.type === 'video' ? 'fa-video' : (item.isPreset ? 'fa-heart' : 'fa-sparkles');
    const overlayIcon = item.type === 'video' ? 'fa-play' : 'fa-expand';

    card.innerHTML = `
      <div class="moment-media" role="button" tabindex="0" aria-label="Buka foto ${escapeHtml(item.title)} di resolusi penuh">
        ${mediaHtml}
        <span class="media-type-badge ${item.type === 'video' ? 'video' : 'photo'}">
          <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
        </span>
        <div class="moment-overlay" aria-hidden="true">
          <i class="fa-solid ${overlayIcon}"></i>
        </div>
      </div>
      <div class="moment-details">
        <div class="moment-caption" style="font-weight: 600; font-size: 1.05rem; color: #fff;">${escapeHtml(item.title)}</div>
        <p style="font-size: 0.84rem; color: #cbd5e1; line-height: 1.4; margin: 2px 0 6px 0;">${escapeHtml(item.caption)}</p>
        <div class="moment-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
          <span style="font-size: 0.78rem; color: var(--blue-sky);"><i class="fa-regular fa-calendar"></i> ${item.date}</span>
          ${!item.isPreset ? `
            <button class="moment-del-btn" onclick="deleteMoment('${item.id}')" title="Hapus Momen Tambahan" aria-label="Hapus momen tambahan ini">
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
  if (!confirm('Apakah kamu yakin ingin menghapus momen kenangan ini?')) return;

  let localList = getStoredUserMoments();
  localList = localList.filter(m => String(m.id) !== String(id));
  persistUserMoments(localList);

  if (db) {
    try {
      const tx = db.transaction('moments', 'readwrite');
      const store = tx.objectStore('moments');
      store.delete(id);
    } catch (err) {
      console.warn('IndexedDB delete warning:', err);
    }
  }

  allMomentsCache = allMomentsCache.filter(m => String(m.id) !== String(id));

  closeLightbox();
  applyFilterAndRender();
  showToast('Momen kenangan berhasil dihapus.', 'info');
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

      persistUserMoments([]);

      if (db) {
        try {
          const tx = db.transaction('moments', 'readwrite');
          tx.objectStore('moments').clear();
        } catch (err) {
          console.warn('IndexedDB clear warning:', err);
        }
      }

      allMomentsCache = [...ASET_FOTO_ITEMS];
      applyFilterAndRender();
      showToast('Seluruh unggahan baru berhasil dibersihkan!', 'info');
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

window.openLightbox = function(id, customList = null) {
  const searchList = (customList && customList.length > 0)
    ? customList
    : (currentVisibleMoments.length > 0 
      ? currentVisibleMoments 
      : (allMomentsCache.length > 0 ? allMomentsCache : ASET_FOTO_ITEMS));
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

/* 9. Papan Pesan Cinta (Interactive Message Board & LocalStorage) */
function initWishesFeature() {
  const wishForm = document.getElementById('wishForm');
  const wishAuthor = document.getElementById('wishAuthor');
  const wishMessage = document.getElementById('wishMessage');
  const wishesList = document.getElementById('wishesList');
  const boardCountBadge = document.getElementById('boardCountBadge');
  const btnClearAllWishes = document.getElementById('btnClearAllWishes');

  const STORAGE_KEY = 'anniversary_wishes_list';

  function getStoredWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.map((w, idx) => ({
        id: w.id || ('wish_' + (w.timestamp || Date.now()) + '_' + idx),
        author: w.author || 'Anonim',
        text: w.text || '',
        time: w.time || '16 Des 2026',
        likes: w.likes || 1,
        liked: !!w.liked
      })) : [];
    } catch {
      return [];
    }
  }

  function saveWishes(wishes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch (e) {
      console.warn('Gagal menyimpan wishes:', e);
    }
  }

  function renderWishes(highlightId = null) {
    if (!wishesList) return;
    const wishes = getStoredWishes();

    if (boardCountBadge) {
      boardCountBadge.innerHTML = `<i class="fa-solid fa-heart text-red"></i> ${wishes.length} Pesan Tertempel`;
    }

    if (btnClearAllWishes) {
      btnClearAllWishes.style.display = wishes.length > 0 ? 'inline-flex' : 'none';
    }

    if (wishes.length === 0) {
      wishesList.innerHTML = `
        <div class="wishes-empty-board">
          <div class="wishes-empty-icon" aria-hidden="true">
            <i class="fa-solid fa-envelope-open-text"></i>
          </div>
          <h4 class="wishes-empty-title">Papan Pesan Masih Terbuka & Bersih</h4>
          <p class="wishes-empty-desc">
            Tuliskan kata-kata manis, doa, atau harapan indahmu di formulir di atas. Pesanmu akan tertempel abadi di Papan Pesan Cinta ini!
          </p>
          <button type="button" class="btn-insert-sample-wish" id="btnInsertSampleWish">
            <i class="fa-solid fa-heart text-red"></i> Tempelkan Pesan Contoh Romantis
          </button>
        </div>
      `;

      const sampleBtn = document.getElementById('btnInsertSampleWish');
      if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
          const sampleWishes = [
            {
              id: 'sample_firhan_' + Date.now(),
              author: 'Firhan',
              text: 'Terima kasih sudah menjadi wanita terhebat dan terindah selama 7 tahun ini. Aku berjanji akan selalu ada di sampingmu di setiap langkah perjalanan kita menuju selamanya ❤️',
              time: '16 Des 2026, 00:00',
              likes: 7
            },
            {
              id: 'sample_sayang_' + Date.now() + 1,
              author: 'Sayangku',
              text: 'Selamat 7 tahun hubungan kita sayang! Semoga cinta kita selalu hangat, penuh tawa, dan selalu diberkahi kebahagiaan hingga maut memisahkan 💙✨',
              time: '16 Des 2026, 00:07',
              likes: 7
            }
          ];
          saveWishes(sampleWishes);
          renderWishes(sampleWishes[0].id);
          if (window.triggerParticleBurst) {
            window.triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 45);
          }
          if (window.showToast) {
            showToast('Pesan contoh romantis berhasil tertempel di papan! 💕', 'success');
          }
        });
      }
      return;
    }

    wishesList.innerHTML = wishes.map(w => {
      const isRed = w.author.toLowerCase().includes('firhan') || w.author.toLowerCase().includes('cowok');
      const avatarColor = isRed ? 'red' : 'blue';
      const initial = (w.author.trim()[0] || '❤️').toUpperCase();
      const isHighlight = highlightId && w.id === highlightId;

      return `
        <div class="wish-note-card ${isHighlight ? 'new-wish-highlight' : ''}" data-id="${w.id}">
          <div class="wish-pin" aria-hidden="true">
            <i class="fa-solid fa-thumbtack"></i>
          </div>
          <div class="wish-note-top">
            <div class="wish-author-info">
              <div class="wish-avatar ${avatarColor}">${initial}</div>
              <div class="wish-author-meta">
                <span class="wish-author-name">${escapeHtml(w.author)}</span>
                <span class="wish-item-time"><i class="fa-regular fa-clock"></i> ${escapeHtml(w.time)}</span>
              </div>
            </div>
          </div>
          <div class="wish-note-body">${escapeHtml(w.text)}</div>
          <div class="wish-note-footer">
            <button type="button" class="btn-wish-like ${w.liked ? 'liked' : ''}" data-id="${w.id}" aria-label="Beri tanda cinta pada pesan ini">
              <i class="fa-solid fa-heart"></i> <span class="like-num">${w.likes || 1}</span>
            </button>
            <button type="button" class="btn-wish-delete" data-id="${w.id}" title="Hapus pesan ini dari papan" aria-label="Hapus pesan ini">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Highlight scroll if needed
    if (highlightId) {
      setTimeout(() => {
        const el = document.querySelector(`.wish-note-card[data-id="${highlightId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  // Interactive Likes and Deletes via delegation
  if (wishesList) {
    wishesList.addEventListener('click', (e) => {
      // Like button click
      const likeBtn = e.target.closest('.btn-wish-like');
      if (likeBtn) {
        const id = likeBtn.getAttribute('data-id');
        const wishes = getStoredWishes();
        const target = wishes.find(w => w.id === id);
        if (target) {
          if (!target.liked) {
            target.likes = (target.likes || 0) + 1;
            target.liked = true;
            likeBtn.classList.add('liked');
            const numEl = likeBtn.querySelector('.like-num');
            if (numEl) numEl.textContent = target.likes;
            if (window.triggerParticleBurst) {
              const rect = likeBtn.getBoundingClientRect();
              window.triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
            }
          } else {
            target.likes = Math.max(1, (target.likes || 1) - 1);
            target.liked = false;
            likeBtn.classList.remove('liked');
            const numEl = likeBtn.querySelector('.like-num');
            if (numEl) numEl.textContent = target.likes;
          }
          saveWishes(wishes);
        }
        return;
      }

      // Delete button click
      const delBtn = e.target.closest('.btn-wish-delete');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        if (confirm('Apakah kamu yakin ingin menghapus pesan cinta ini dari papan?')) {
          let wishes = getStoredWishes();
          wishes = wishes.filter(w => w.id !== id);
          saveWishes(wishes);
          renderWishes();
          if (window.showToast) {
            showToast('Pesan berhasil dihapus dari papan.', 'info');
          }
        }
      }
    });
  }

  // Clear all button click
  if (btnClearAllWishes) {
    btnClearAllWishes.addEventListener('click', () => {
      if (confirm('Apakah kamu yakin ingin membersihkan dan mengosongkan semua pesan di papan?')) {
        saveWishes([]);
        renderWishes();
        if (window.showToast) {
          showToast('Papan pesan telah dibersihkan.', 'info');
        }
      }
    });
  }

  // Form Submission
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = wishAuthor.value.trim();
      const message = wishMessage.value.trim();

      if (!author || !message) return;

      const newId = 'wish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const wishes = getStoredWishes();
      const newWish = {
        id: newId,
        author: author,
        text: message,
        time: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        likes: 1,
        liked: true
      };

      wishes.unshift(newWish);
      saveWishes(wishes);
      wishAuthor.value = '';
      wishMessage.value = '';
      renderWishes(newId);

      if (window.triggerParticleBurst) {
        window.triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 45);
      }
      if (window.showToast) {
        showToast(`Pesan dari "${escapeHtml(author)}" berhasil tertempel di Papan Pesan Cinta! 💌✨`, 'success');
      }
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

/* 11. Responsive Navigation & ScrollSpy for Mobile & Laptop */
function initScrollSpyAndNav() {
  const sections = document.querySelectorAll('main section[id]');
  const desktopLinks = document.querySelectorAll('.nav-links a');
  const mobileLinks = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-link');

  // Smooth scroll with calibrated header offset for mobile vs laptop
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = window.innerWidth < 860 ? 60 : 80;
          const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Dynamic Scrollspy Highlight
  function handleScrollSpy() {
    const scrollPos = window.scrollY + (window.innerWidth < 860 ? 120 : 160);
    let activeId = '';

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        activeId = sec.getAttribute('id');
      }
    });

    if (activeId) {
      desktopLinks.forEach(link => {
        const isMatch = link.getAttribute('href') === `#${activeId}`;
        link.classList.toggle('active', isMatch);
      });
      mobileLinks.forEach(link => {
        const isMatch = link.dataset.section === activeId;
        link.classList.toggle('active', isMatch);
      });
    }
  }

  window.addEventListener('scroll', handleScrollSpy, { passive: true });
  handleScrollSpy();
}
