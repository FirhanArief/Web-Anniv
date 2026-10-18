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

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  initPhotoboothParallax();
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

  // Auto-lock on browser/tab close: use sessionStorage so closing the web re-locks it
  try {
    localStorage.removeItem('anniversary_gate_unlocked'); // Clean up any old permanent unlock
    if (sessionStorage.getItem('anniversary_session_unlocked') === 'true') {
      if (gate) gate.classList.add('open');
      if (mainContent) mainContent.classList.remove('hidden');
      if (window.updatePhotoboothParallax) setTimeout(window.updatePhotoboothParallax, 50);
    }
  } catch (e) {}

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

  const WRONG_PIN_MESSAGES = [
    'Hayo, ini siapa ya? Kalau ayang beneran masa lupa tanggal keramat kita 😜',
    'Tetot, salah! Hayo ngaku, penyusup mau ngintip ya? 🤨',
    'Waduh salah... masa hari jadian sendiri amnesia? Coba inget-inget lagi deh 🤭',
    'Bukan itu kuncinya! Awas ya kalau sampai beneran lupa hari jadian kita 😤',
    'Salah woy! Akses khusus ayang tersayang doang, yang lain dilarang kepo 🤫'
  ];
  let wrongPinAttemptIndex = 0;

  const HINT_MESSAGES = [
    'Clue: 8 digit hari paling bersejarah buat kita berdua (DDMMYYYY). Jangan pura-pura lupa ya! 😉',
    'Petunjuk: Tanggal waktu kamu resmi jadi milikku (DDMMYYYY). Masa nggak inget sih? 😜',
    'Clue: Hari pertama cerita kita resmi dimulai (format: DDMMYYYY). Mikir keras ya! 🤭'
  ];
  let hintAttemptIndex = 0;

  function showHint() {
    const hintMsg = HINT_MESSAGES[hintAttemptIndex % HINT_MESSAGES.length];
    hintAttemptIndex++;
    setStatus(hintMsg, 'normal');
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
      try {
        sessionStorage.setItem('anniversary_session_unlocked', 'true');
        localStorage.removeItem('anniversary_gate_unlocked');
      } catch (e) {}
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
        const letterBadge = envelope.querySelector('.letter-badge');
        if (letterBadge) {
          letterBadge.textContent = '16-12-2019';
        }
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
        if (window.updatePhotoboothParallax) window.updatePhotoboothParallax();
        isChecking = false;
      }, 950);
    } else {
      // ERROR: Incorrect PIN
      if (displayWrapper) {
        displayWrapper.classList.remove('success');
        displayWrapper.classList.add('error');
      }
      const errMsg = WRONG_PIN_MESSAGES[wrongPinAttemptIndex % WRONG_PIN_MESSAGES.length];
      wrongPinAttemptIndex++;
      setStatus(errMsg, 'error');

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
        setStatus('Ketik 8 digit dulu ya, jangan buru-buru! 😜', 'error');
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
        setStatus('Ketik 8 digit dulu ya, jangan buru-buru! 😜', 'error');
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
      try {
        sessionStorage.removeItem('anniversary_session_unlocked');
        localStorage.removeItem('anniversary_gate_unlocked');
      } catch (e) {}
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

/* 6. Robust Album Gallery & IndexedDB Storage (AnniversaryAlbumDB_v2) */
const ALBUM_DB_NAME = 'AnniversaryAlbumDB_v2';
const ALBUM_DB_VERSION = 2;
const ALBUM_STORE_NAME = 'album_photos';
const USER_MOMENTS_STORAGE_KEY = 'anniversary_user_moments_v2';

/* Cloudinary Unsigned Upload Configuration */
const CLOUDINARY_CONFIG = {
  cloudName: 'dxjcwv7a',
  uploadPreset: 'anniv_preset',
  uploadUrl: 'https://api.cloudinary.com/v1_1/dxjcwv7a/image/upload',
  autoUploadUrl: 'https://api.cloudinary.com/v1_1/dxjcwv7a/auto/upload',
  videoUploadUrl: 'https://api.cloudinary.com/v1_1/dxjcwv7a/video/upload'
};

const CLOUDINARY_MOMENTS_STORAGE_KEY = 'anniversary_cloudinary_moments_v1';
const CLOUDINARY_DELETED_KEY = 'anniversary_deleted_cld_ids_v1';
const CLOUDINARY_SYNCED_TOMBSTONES_KEY = 'anniversary_synced_tombstones_v1';
const CLOUDINARY_PENDING_DELETIONS_KEY = 'anniversary_pending_deletions_v1';

function getDeletedCloudinaryIds() {
  try {
    const raw = localStorage.getItem(CLOUDINARY_DELETED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function getSyncedTombstones() {
  try {
    const raw = localStorage.getItem(CLOUDINARY_SYNCED_TOMBSTONES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function markTombstoneSynced(id) {
  try {
    const list = getSyncedTombstones();
    const str = String(id).trim();
    if (str && !list.includes(str)) {
      list.push(str);
      localStorage.setItem(CLOUDINARY_SYNCED_TOMBSTONES_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

function markCloudinaryMomentDeleted(id) {
  if (!id) return;
  try {
    const list = getDeletedCloudinaryIds();
    const strId = String(id).trim();
    const cleanPublicId = strId.replace(/^cld_/, '');
    const cldKey = 'cld_' + cleanPublicId.replace(/[^a-zA-Z0-9]/g, '_');

    let updated = false;
    [strId, cleanPublicId, cldKey].forEach(val => {
      if (val && !list.includes(val)) {
        list.push(val);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(CLOUDINARY_DELETED_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

function getPendingDeletions() {
  try {
    const raw = localStorage.getItem(CLOUDINARY_PENDING_DELETIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function savePendingDeletions(list) {
  try {
    localStorage.setItem(CLOUDINARY_PENDING_DELETIONS_KEY, JSON.stringify(list || []));
  } catch (e) {}
}

async function broadcastCloudinaryDeletion(publicId, momentId, deleteToken = '') {
  const cleanId = String(publicId || momentId || '').replace(/^cld_/, '').trim();
  if (!cleanId) return true;

  markCloudinaryMomentDeleted(cleanId);
  markCloudinaryMomentDeleted(momentId);

  // If token is available, attempt direct deletion from Cloudinary API
  if (deleteToken) {
    try {
      fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/delete_by_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `token=${encodeURIComponent(deleteToken)}`
      }).catch(() => {});
    } catch (e) {}
  }

  // Check if tombstone has already been broadcasted
  const synced = getSyncedTombstones();
  if (synced.includes(cleanId)) {
    return true;
  }

  try {
    const formData = new FormData();
    formData.append('file', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('tags', 'anniversary_album');
    formData.append('context', `is_tombstone=1|deleted_id=${encodeURIComponent(cleanId)}|deleted_at=${Date.now()}`);

    const res = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      markTombstoneSynced(cleanId);
      const pending = getPendingDeletions().filter(id => id !== cleanId);
      savePendingDeletions(pending);
      return true;
    } else {
      throw new Error(`Cloudinary marker returned ${res.status}`);
    }
  } catch (err) {
    console.warn('Queueing deletion marker for retry due to network:', err);
    const pending = getPendingDeletions();
    if (!pending.includes(cleanId)) {
      pending.push(cleanId);
      savePendingDeletions(pending);
    }
    return false;
  }
}

async function retryPendingDeletions() {
  const pending = getPendingDeletions();
  if (!pending || !pending.length) return;
  for (const id of [...pending]) {
    try {
      await broadcastCloudinaryDeletion(id, id);
    } catch (e) {}
  }
}

function isDummyOrInvalidMedia(item) {
  if (!item) return true;
  const src = item.src || item.thumb || item.dataUrl || '';
  if (!src || typeof src !== 'string') return true;
  const clean = src.trim();
  if (!clean || clean === 'undefined' || clean === 'null') return true;
  if (clean.startsWith('data:image/gif;base64,R0lGODlhAQAB')) return true;
  if (clean.includes('fcgec44k1fqakjbjfw4g') || clean.includes('ofjdk5cfzxcivh5xzz1u') || clean.includes('k2qsf1sdkvnmeyjbxqdz')) return true;
  const deletedIds = getDeletedCloudinaryIds();
  const strId = String(item.id || '');
  const cleanId = strId.replace(/^cld_/, '');
  if (deletedIds.includes(strId) || deletedIds.includes(cleanId)) return true;
  if (item.cloudinaryPublicId && (deletedIds.includes(String(item.cloudinaryPublicId)) || deletedIds.includes('cld_' + String(item.cloudinaryPublicId).replace(/[^a-zA-Z0-9]/g, '_')))) return true;
  return false;
}

function getStoredCloudinaryMoments() {
  try {
    const raw = localStorage.getItem(CLOUDINARY_MOMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(m => !isDummyOrInvalidMedia(m));
        if (valid.length !== parsed.length) {
          localStorage.setItem(CLOUDINARY_MOMENTS_STORAGE_KEY, JSON.stringify(valid));
        }
        return valid;
      }
    }
  } catch (err) {
    console.warn('LocalStorage read error for Cloudinary moments:', err);
  }
  return [];
}

function persistCloudinaryMoments(momentsList) {
  try {
    const cleanList = (momentsList || []).filter(m => !isDummyOrInvalidMedia(m));
    localStorage.setItem(CLOUDINARY_MOMENTS_STORAGE_KEY, JSON.stringify(cleanList));
  } catch (err) {
    console.warn('LocalStorage save error for Cloudinary moments:', err);
  }
}

function saveCloudinaryMoment(momentItem) {
  if (isDummyOrInvalidMedia(momentItem)) return;
  const current = getStoredCloudinaryMoments().filter(m => String(m.id) !== String(momentItem.id));
  current.unshift(momentItem);
  persistCloudinaryMoments(current);
}

function removeCloudinaryMoment(id) {
  if (!id) return;
  markCloudinaryMomentDeleted(id);
  const strId = String(id).trim();
  const cleanId = strId.replace(/^cld_/, '');
  const cldKey = 'cld_' + cleanId.replace(/[^a-zA-Z0-9]/g, '_');

  const current = getStoredCloudinaryMoments().filter(m => {
    const mId = String(m.id || '');
    const mPub = String(m.cloudinaryPublicId || '');
    if (mId === strId || mId === cleanId || mId === cldKey) return false;
    if (mPub && (mPub === strId || mPub === cleanId || mPub === cldKey)) return false;
    return true;
  });
  persistCloudinaryMoments(current);
}

function setCloudinaryProgressUI(show, label = '', percent = 0) {
  const progressContainer = document.getElementById('cloudinaryUploadProgress');
  const progressLabel = document.getElementById('cloudinaryProgressLabel');
  const progressPercent = document.getElementById('cloudinaryProgressPercent');
  const progressBarFill = document.getElementById('cloudinaryProgressBarFill');

  if (progressContainer) {
    progressContainer.style.display = show ? 'block' : 'none';
  }
  if (progressLabel && label) {
    progressLabel.innerHTML = label;
  }
  if (progressPercent) {
    progressPercent.textContent = `${percent}%`;
  }
  if (progressBarFill) {
    progressBarFill.style.width = `${percent}%`;
  }
}

async function uploadToCloudinary(file, onProgress, extraData = {}) {
  const isVideo = isVideoFile(file);
  const endpoint = isVideo ? CLOUDINARY_CONFIG.videoUploadUrl : CLOUDINARY_CONFIG.uploadUrl;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  // Auto-sync tag across all devices
  formData.append('tags', 'anniversary_album');

  if (extraData && extraData.title) {
    const safeCaption = (extraData.caption || 'Foto kenangan manis').replace(/[\r\n|]/g, ' ').slice(0, 200);
    const safeTitle = (extraData.title || 'Foto Kenangan').replace(/[\r\n|]/g, ' ').slice(0, 100);
    formData.append('context', `caption=${encodeURIComponent(safeCaption)}|alt=${encodeURIComponent(safeTitle)}`);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data);
        } else {
          const msg = (data.error && data.error.message) ? data.error.message : `HTTP ${xhr.status}`;
          reject(new Error(msg));
        }
      } catch (err) {
        reject(new Error('Gagal membaca respons dari Cloudinary.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Koneksi internet bermasalah saat mengunggah ke Cloudinary. Pastikan koneksi internet aktif.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Waktu unggah ke Cloudinary habis (timeout).'));
    };

    xhr.send(formData);
  });
}

/* Auto-sync from Cloudinary Resource List (anniversary_album tag) */
async function fetchCloudinaryRemoteGallery() {
  const cloudNames = [CLOUDINARY_CONFIG.cloudName];
  const endpoints = ['image', 'video'];
  const allResources = [];
  const deletedIds = getDeletedCloudinaryIds();

  for (const cname of cloudNames) {
    for (const type of endpoints) {
      try {
        const url = `https://res.cloudinary.com/${cname}/${type}/list/anniversary_album.json?_t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.resources)) {
            allResources.push(...data.resources.map(r => ({ ...r, _resourceType: type, _cloudName: cname })));
          }
        }
      } catch (err) {
        // Silently skip if endpoint has no resources or network fails
      }
    }
  }

  // Discover all tombstones from Cloudinary across all devices
  let newlyDiscoveredCount = 0;
  for (const res of allResources) {
    if (!res) continue;
    let isTombstone = false;
    let deletedTarget = '';

    if (res.context && res.context.custom) {
      if (res.context.custom.is_tombstone === '1' || res.context.custom.is_tombstone === 'true') {
        isTombstone = true;
      }
      if (res.context.custom.deleted_id) {
        deletedTarget = decodeURIComponent(res.context.custom.deleted_id);
        isTombstone = true;
      }
    }

    if (isTombstone && deletedTarget) {
      const cleanTarget = String(deletedTarget).trim();
      markTombstoneSynced(cleanTarget);
      if (!deletedIds.includes(cleanTarget)) {
        deletedIds.push(cleanTarget);
        markCloudinaryMomentDeleted(cleanTarget);
        removeCloudinaryMoment(cleanTarget);
        dbDeleteAlbumPhoto(cleanTarget);
        newlyDiscoveredCount++;
      }
      const cldKey = 'cld_' + cleanTarget.replace(/[^a-zA-Z0-9]/g, '_');
      if (!deletedIds.includes(cldKey)) {
        deletedIds.push(cldKey);
        markCloudinaryMomentDeleted(cldKey);
        removeCloudinaryMoment(cldKey);
        dbDeleteAlbumPhoto(cldKey);
        newlyDiscoveredCount++;
      }
    }
  }

  // Retry sending any pending deletions
  retryPendingDeletions().catch(() => {});

  // Sync any local deletions that were made previously but not yet on Cloudinary
  const localDeletions = getDeletedCloudinaryIds();
  const syncedTombstones = getSyncedTombstones();
  for (const localId of localDeletions) {
    const clean = String(localId).replace(/^cld_/, '').trim();
    if (clean && !syncedTombstones.includes(clean) && !['fcgec44k1fqakjbjfw4g', 'ofjdk5cfzxcivh5xzz1u', 'k2qsf1sdkvnmeyjbxqdz'].includes(clean)) {
      broadcastCloudinaryDeletion(clean, clean).catch(() => {});
    }
  }

  const validPhotos = allResources
    .filter(photo => {
      if (!photo || !photo.public_id || !photo.format) return false;
      // Filter out tombstones & 1x1 dummy gifs
      if (photo.context && photo.context.custom && (photo.context.custom.is_tombstone === '1' || photo.context.custom.deleted_id)) return false;
      if (photo.width && photo.height && (photo.width <= 10 || photo.height <= 10)) return false;
      if (['fcgec44k1fqakjbjfw4g', 'ofjdk5cfzxcivh5xzz1u', 'k2qsf1sdkvnmeyjbxqdz'].includes(photo.public_id)) return false;
      // Filter out deleted photos
      const pubId = String(photo.public_id);
      const cldKey = 'cld_' + pubId.replace(/[^a-zA-Z0-9]/g, '_');
      if (deletedIds.includes(pubId) || deletedIds.includes(cldKey)) return false;
      return true;
    })
    .map(photo => {
      const cname = photo._cloudName || CLOUDINARY_CONFIG.cloudName;
      const isVideo = photo._resourceType === 'video' || ['mp4', 'webm', 'mov'].includes(photo.format);
      const versionStr = photo.version ? `v${photo.version}/` : '';
      const formatStr = photo.format || (isVideo ? 'mp4' : 'jpg');
      const mediaType = isVideo ? 'video' : 'image';
      const fullSrc = `https://res.cloudinary.com/${cname}/${mediaType}/upload/${versionStr}${photo.public_id}.${formatStr}`;

      let thumbSrc = fullSrc;
      if (isVideo) {
        thumbSrc = `https://res.cloudinary.com/${cname}/video/upload/c_fill,g_auto,w_600,h_800,so_auto/${versionStr}${photo.public_id}.jpg`;
      } else {
        thumbSrc = `https://res.cloudinary.com/${cname}/image/upload/c_fill,g_auto,w_600,h_800,q_auto,f_auto/${versionStr}${photo.public_id}.${formatStr}`;
      }

      let title = isVideo ? 'Video Kenangan Cinta' : 'Foto Kenangan Cinta';
      let caption = 'Foto kenangan manis yang tersimpan di Cloudinary.';
      if (photo.context && photo.context.custom) {
        if (photo.context.custom.alt) {
          try { title = decodeURIComponent(photo.context.custom.alt); } catch (e) { title = photo.context.custom.alt; }
        }
        if (photo.context.custom.caption) {
          try { caption = decodeURIComponent(photo.context.custom.caption); } catch (e) { caption = photo.context.custom.caption; }
        }
      }

      let formattedDate = 'Hari Ini';
      if (photo.created_at) {
        try {
          const d = new Date(photo.created_at);
          formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {}
      }

      const cleanPublicId = photo.public_id;
      const standardId = 'cld_' + cleanPublicId.replace(/[^a-zA-Z0-9]/g, '_');

      return {
        id: standardId,
        name: `${cleanPublicId}.${formatStr}`,
        type: isVideo ? 'video' : 'image',
        src: fullSrc,
        thumb: thumbSrc,
        thumbUrl: thumbSrc,
        title: title,
        caption: caption,
        date: formattedDate,
        year: 'user',
        timestamp: photo.created_at ? new Date(photo.created_at).getTime() : Date.now(),
        isPreset: false,
        isUserUpload: true,
        isCloudinary: true,
        cloudinaryPublicId: cleanPublicId
      };
    });

  return { photos: validPhotos, deletedCount: newlyDiscoveredCount, deletedIds: Array.from(new Set(deletedIds)) };
}

let albumDBInstance = null;

function initIndexedDB() {
  allMomentsCache = [...ASET_FOTO_ITEMS];
  currentVisibleMoments = [...ASET_FOTO_ITEMS];

  setupDropZoneAndUpload();
  setupGalleryFilters();
  setupLightbox();

  openAlbumDatabase().then((database) => {
    albumDBInstance = database;
    db = database; // Backwards compatibility
    loadGalleryMoments();
  }).catch((err) => {
    console.warn('Database initialization fallback:', err);
    loadGalleryMoments();
  });
}

function openAlbumDatabase() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported in this browser, using LocalStorage.');
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(ALBUM_DB_NAME, ALBUM_DB_VERSION);

      request.onupgradeneeded = (e) => {
        const dbInstance = e.target.result;
        if (!dbInstance.objectStoreNames.contains(ALBUM_STORE_NAME)) {
          dbInstance.createObjectStore(ALBUM_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        resolve(e.target.result);
      };

      request.onerror = (e) => {
        console.warn('IndexedDB error on open:', e);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB open exception:', err);
      resolve(null);
    }
  });
}

/* Upload & Storage Helpers */
function getStoredUserMoments() {
  try {
    const raw = localStorage.getItem(USER_MOMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const legacy = localStorage.getItem('anniversary_user_moments_v1');
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      persistUserMoments(parsedLegacy);
      return parsedLegacy;
    }
    return [];
  } catch (err) {
    console.warn('LocalStorage read error:', err);
    return [];
  }
}

function persistUserMoments(momentsList) {
  try {
    const safeList = momentsList.map(m => {
      const isVideo = m.type === 'video';
      const validThumb = (m.thumb && m.thumb.length < 300000 && !m.thumb.startsWith('blob:')) ? m.thumb : (m.thumbUrl && m.thumbUrl.length < 300000 && !m.thumbUrl.startsWith('blob:') ? m.thumbUrl : '');
      const validSrc = (!isVideo && m.src && m.src.length < 400000 && !m.src.startsWith('blob:')) ? m.src : '';
      return {
        id: m.id,
        name: m.name,
        type: m.type,
        thumb: validThumb,
        thumbUrl: validThumb,
        src: validSrc,
        title: m.title,
        caption: m.caption,
        date: m.date,
        year: m.year,
        timestamp: m.timestamp,
        isPreset: false,
        isUserUpload: true
      };
    });
    localStorage.setItem(USER_MOMENTS_STORAGE_KEY, JSON.stringify(safeList));
  } catch (err) {
    console.warn('LocalStorage save error (storage quota protected):', err);
    try {
      const ultraCompact = momentsList.slice(0, 20).map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        thumb: (m.thumb && m.thumb.length < 150000 && !m.thumb.startsWith('blob:')) ? m.thumb : '',
        title: m.title,
        caption: m.caption,
        date: m.date,
        year: m.year,
        timestamp: m.timestamp,
        isPreset: false,
        isUserUpload: true
      }));
      localStorage.setItem(USER_MOMENTS_STORAGE_KEY, JSON.stringify(ultraCompact));
    } catch (e2) {}
  }
}

function dbGetAllAlbumPhotos() {
  return new Promise((resolve) => {
    if (!albumDBInstance) {
      resolve(getStoredUserMoments());
      return;
    }
    try {
      const tx = albumDBInstance.transaction(ALBUM_STORE_NAME, 'readonly');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        resolve(results.length > 0 ? results : getStoredUserMoments());
      };
      req.onerror = () => resolve(getStoredUserMoments());
    } catch (e) {
      resolve(getStoredUserMoments());
    }
  });
}

function dbSaveAlbumPhoto(photoItem) {
  return new Promise((resolve) => {
    try {
      const local = getStoredUserMoments().filter(m => String(m.id) !== String(photoItem.id));
      const compactMirror = {
        id: photoItem.id,
        name: photoItem.name || 'Momen Spesial',
        type: photoItem.type || 'image',
        thumb: (photoItem.thumb && photoItem.thumb.length < 250000) ? photoItem.thumb : (photoItem.thumbUrl && photoItem.thumbUrl.length < 250000 ? photoItem.thumbUrl : ''),
        src: (photoItem.src && photoItem.src.length < 400000 && !photoItem.src.startsWith('blob:')) ? photoItem.src : '',
        title: photoItem.title || 'Momen Spesial',
        caption: photoItem.caption || '',
        date: photoItem.date || 'Hari Ini',
        year: photoItem.year || 'user',
        timestamp: photoItem.timestamp || Date.now(),
        isPreset: false,
        isUserUpload: true
      };
      local.unshift(compactMirror);
      persistUserMoments(local);
    } catch (err) {}

    if (albumDBInstance) {
      try {
        const tx = albumDBInstance.transaction(ALBUM_STORE_NAME, 'readwrite');
        const store = tx.objectStore(ALBUM_STORE_NAME);

        const recordToStore = {
          id: photoItem.id,
          name: photoItem.name || 'Momen Spesial',
          type: photoItem.type || 'image',
          src: (photoItem.src && !photoItem.src.startsWith('blob:')) ? photoItem.src : '',
          thumb: photoItem.thumb || photoItem.thumbUrl || '',
          thumbUrl: photoItem.thumbUrl || photoItem.thumb || '',
          title: photoItem.title || 'Momen Spesial',
          caption: photoItem.caption || '',
          date: photoItem.date || 'Hari Ini',
          year: photoItem.year || 'user',
          timestamp: photoItem.timestamp || Date.now(),
          isPreset: false,
          isUserUpload: true
        };

        if (photoItem.blob instanceof Blob) {
          recordToStore.blob = photoItem.blob;
        }

        const req = store.put(recordToStore);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    } else {
      resolve(true);
    }
  });
}

function dbDeleteAlbumPhoto(id) {
  return new Promise((resolve) => {
    if (!id) return resolve(true);
    const strId = String(id).trim();
    const cleanId = strId.replace(/^cld_/, '');
    const cldKey = 'cld_' + cleanId.replace(/[^a-zA-Z0-9]/g, '_');

    try {
      const local = getStoredUserMoments().filter(m => {
        const mId = String(m.id || '');
        const mPub = String(m.cloudinaryPublicId || '');
        if (mId === strId || mId === cleanId || mId === cldKey) return false;
        if (mPub && (mPub === strId || mPub === cleanId || mPub === cldKey)) return false;
        return true;
      });
      persistUserMoments(local);
    } catch (e) {}

    if (albumDBInstance) {
      try {
        const tx = albumDBInstance.transaction(ALBUM_STORE_NAME, 'readwrite');
        const store = tx.objectStore(ALBUM_STORE_NAME);
        store.delete(strId);
        if (cleanId !== strId) store.delete(cleanId);
        if (cldKey !== strId && cldKey !== cleanId) store.delete(cldKey);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    } else {
      resolve(true);
    }
  });
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

function compressImageFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.78) {
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

function compressImageDual(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onerror = () => resolve({ highRes: dataUrl, thumb: dataUrl });
      img.onload = () => {
        const highRes = renderCanvasResized(img, 1280, 1280, 0.78);
        const thumb = renderCanvasResized(img, 480, 480, 0.72);
        resolve({ highRes, thumb });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function renderCanvasResized(img, maxWidth, maxHeight, quality) {
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
  return canvas.toDataURL('image/jpeg', quality);
}

let pendingFilesQueue = [];
let currentPreviewIndex = 0;
let currentPreviewDataUrl = null;
let currentPreviewBlob = null;
let currentPreviewThumbUrl = null;
let currentPreviewFileType = 'image';

function isMediaFile(file) {
  if (!file) return false;
  if (file.type && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
    return true;
  }
  const ext = (file.name || '').split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif', 'mp4', 'webm', 'mov', 'm4v', 'ogg', 'avi', 'mkv', '3gp'].includes(ext);
}

function isVideoFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('video/')) return true;
  const ext = (file.name || '').split('.').pop().toLowerCase();
  return ['mp4', 'webm', 'mov', 'm4v', 'ogg', 'avi', 'mkv', '3gp'].includes(ext);
}

function extractVideoThumbnail(file) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(url);
          resolve(createVideoPlaceholder(file ? file.name : ''));
        }
      }, 3500);

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 1) / 2);
      };

      video.onseeked = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 480;
          let w = video.videoWidth || 480;
          let h = video.videoHeight || 360;
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, w, h);
          const thumb = canvas.toDataURL('image/jpeg', 0.78);
          URL.revokeObjectURL(url);
          resolve(thumb);
        } catch (e) {
          URL.revokeObjectURL(url);
          resolve(createVideoPlaceholder(file ? file.name : ''));
        }
      };

      video.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          resolve(createVideoPlaceholder(file ? file.name : ''));
        }
      };
    } catch (e) {
      resolve(createVideoPlaceholder(file ? file.name : ''));
    }
  });
}

function createVideoPlaceholder(filename) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 480, 480);
    grad.addColorStop(0, '#1f1325');
    grad.addColorStop(0.5, '#0e1828');
    grad.addColorStop(1, '#090b14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 480);

    ctx.strokeStyle = 'rgba(230, 57, 70, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(240, 220, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(230, 57, 70, 0.85)';
    ctx.beginPath();
    ctx.arc(240, 220, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(232, 203);
    ctx.lineTo(256, 220);
    ctx.lineTo(232, 237);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Video Kenangan Cinta', 240, 325);

    const clean = (filename || '').replace(/\.[^/.]+$/, '').slice(0, 26);
    if (clean) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px sans-serif';
      ctx.fillText(clean, 240, 355);
    }

    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (e) {
    return '';
  }
}

function setupDropZoneAndUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const albumQuickInput = document.getElementById('albumQuickInput');
  const btnTriggerAlbumUpload = document.getElementById('btnTriggerAlbumUpload');
  const btnTriggerDropzoneUpload = document.getElementById('btnTriggerDropzoneUpload');
  const albumQuickCameraBtn = document.getElementById('albumQuickCameraBtn');
  const btnBackupAlbum = document.getElementById('btnBackupAlbum');
  const btnRestoreAlbum = document.getElementById('btnRestoreAlbum');
  const albumRestoreInput = document.getElementById('albumRestoreInput');
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

  if (previewDateInput) {
    const today = new Date().toISOString().split('T')[0];
    previewDateInput.value = today;
  }

  // Quick Album Toolbar Buttons
  if (btnTriggerAlbumUpload && albumQuickInput) {
    btnTriggerAlbumUpload.addEventListener('click', (e) => {
      e.preventDefault();
      albumQuickInput.click();
    });
  }

  if (btnTriggerDropzoneUpload && fileInput) {
    btnTriggerDropzoneUpload.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });
  }

  if (albumQuickInput) {
    albumQuickInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesSelected(e.target.files);
        e.target.value = '';
      }
    });
  }

  if (albumQuickCameraBtn) {
    albumQuickCameraBtn.addEventListener('click', () => {
      const openLiveCameraBtn = document.getElementById('openLiveCameraBtn');
      if (openLiveCameraBtn) {
        openLiveCameraBtn.click();
      } else if (nativeCameraPhoto) {
        nativeCameraPhoto.click();
      }
    });
  }

  if (btnBackupAlbum) {
    btnBackupAlbum.addEventListener('click', exportAlbumBackup);
  }

  if (btnRestoreAlbum && albumRestoreInput) {
    btnRestoreAlbum.addEventListener('click', () => albumRestoreInput.click());
    albumRestoreInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        importAlbumBackup(e.target.files[0]);
        e.target.value = '';
      }
    });
  }

  // Native camera inputs
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

  // DropZone Drag-and-drop
  if (dropZone) {
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
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFilesSelected(files);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesSelected(e.target.files);
        e.target.value = '';
      }
    });
  }

  async function handleFilesSelected(files) {
    const fileList = Array.from(files);
    const validFiles = fileList.filter(file => isMediaFile(file));

    if (validFiles.length === 0) {
      showToast('Pilih file berformat foto atau video (JPG, PNG, WEBP, MP4, MOV, dsb).', 'info');
      return;
    }

    await handleImmediateUpload(validFiles);
  }

  async function handleImmediateUpload(filesList) {
    const total = filesList.length;
    showToast(`Mengunggah ${total} kenangan ke Cloudinary... ☁️✨`, 'info');

    const btnTriggerAlbumUpload = document.getElementById('btnTriggerAlbumUpload');
    const btnTriggerDropzoneUpload = document.getElementById('btnTriggerDropzoneUpload');
    const origAlbumHtml = btnTriggerAlbumUpload ? btnTriggerAlbumUpload.innerHTML : '';
    const origDropHtml = btnTriggerDropzoneUpload ? btnTriggerDropzoneUpload.innerHTML : '';

    if (btnTriggerAlbumUpload) {
      btnTriggerAlbumUpload.disabled = true;
      btnTriggerAlbumUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';
    }
    if (btnTriggerDropzoneUpload) {
      btnTriggerDropzoneUpload.disabled = true;
      btnTriggerDropzoneUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';
    }

    setCloudinaryProgressUI(true, `Menyiapkan ${total} foto/video untuk Cloudinary...`, 0);

    let successCount = 0;
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    let lastSavedId = null;
    let lastErrorMsg = null;

    try {
      for (let i = 0; i < total; i++) {
        const file = filesList[i];
        const isVideo = isVideoFile(file);
        const rawTitle = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : (isVideo ? 'Video Kenangan' : 'Foto Kenangan');
        const cleanTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

        setCloudinaryProgressUI(
          true,
          `<i class="fa-solid fa-cloud-arrow-up fa-bounce"></i> Mengunggah (${i + 1}/${total}): <strong>${escapeHtml(file.name || cleanTitle)}</strong>...`,
          Math.round((i / total) * 100)
        );

        try {
          const cldRes = await uploadToCloudinary(file, (percent) => {
            const overallPercent = Math.round(((i + (percent / 100)) / total) * 100);
            setCloudinaryProgressUI(
              true,
              `<i class="fa-solid fa-cloud-arrow-up fa-spin"></i> Mengunggah (${i + 1}/${total}): ${percent}%`,
              overallPercent
            );
          }, { title: cleanTitle, caption: 'Foto kenangan manis yang tersimpan di Cloudinary.' });

          if (cldRes && cldRes.secure_url) {
            const secureUrl = cldRes.secure_url;
            let thumbUrl = secureUrl;
            if (isVideo) {
              thumbUrl = secureUrl.replace(/\.[^/.]+$/, '.jpg').replace('/upload/', '/upload/c_fill,g_auto,w_600,h_800,so_auto/');
            } else {
              thumbUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_auto,w_600,h_800,q_auto,f_auto/');
            }

            const cleanPublicId = cldRes.public_id || '';
            const newId = cleanPublicId ? ('cld_' + cleanPublicId.replace(/[^a-zA-Z0-9]/g, '_')) : ('cld_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
            const momentItem = {
              id: newId,
              name: file.name || (cleanTitle + (isVideo ? '.mp4' : '.jpg')),
              type: isVideo ? 'video' : 'image',
              src: secureUrl,
              thumb: thumbUrl,
              thumbUrl: thumbUrl,
              title: cleanTitle,
              caption: 'Foto kenangan manis yang tersimpan di Cloudinary.',
              date: todayFormatted,
              year: 'user',
              timestamp: Date.now(),
              isPreset: false,
              isUserUpload: true,
              isCloudinary: true,
              cloudinaryPublicId: cleanPublicId,
              deleteToken: cldRes.delete_token || ''
            };

            saveCloudinaryMoment(momentItem);
            await dbSaveAlbumPhoto(momentItem);

            allMomentsCache = [momentItem, ...allMomentsCache.filter(m => String(m.id) !== String(newId))];

            currentFilter = 'all';
            const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn:not(.btn-clear-all)');
            filterBtns.forEach(btn => {
              btn.classList.toggle('active', btn.dataset.filter === 'all');
            });
            applyFilterAndRender();

            lastSavedId = newId;
            successCount++;
          }
        } catch (uploadErr) {
          console.warn('Cloudinary upload error for file:', file.name, uploadErr);
          lastErrorMsg = uploadErr.message;
        }
      }
    } finally {
      setCloudinaryProgressUI(false);
      if (btnTriggerAlbumUpload) {
        btnTriggerAlbumUpload.disabled = false;
        btnTriggerAlbumUpload.innerHTML = origAlbumHtml || '<i class="fa-solid fa-cloud-arrow-up"></i><span>Upload Foto / Video</span>';
      }
      if (btnTriggerDropzoneUpload) {
        btnTriggerDropzoneUpload.disabled = false;
        btnTriggerDropzoneUpload.innerHTML = origDropHtml || '<i class="fa-solid fa-photo-film"></i> Pilih Foto / Video';
      }
    }

    if (successCount > 0) {
      if (window.triggerParticleBurst) {
        window.triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 45);
      }

      showToast(
        successCount === 1 
          ? `Foto berhasil diunggah ke Cloudinary & tampil instan di Galeri! ☁️❤️` 
          : `${successCount} foto berhasil diunggah ke Cloudinary & tampil instan di Galeri! ☁️❤️`,
        'success'
      );

      setTimeout(() => {
        const targetCard = lastSavedId 
          ? document.querySelector(`.moment-card[data-id="${lastSavedId}"]`)
          : document.getElementById('galleryGrid');
        if (targetCard) {
          targetCard.classList.add('new-moment-highlight');
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 250);
    } else {
      showToast(
        lastErrorMsg ? `Gagal upload ke Cloudinary: ${lastErrorMsg}` : 'Gagal mengunggah ke Cloudinary. Silakan periksa koneksi dan coba lagi.',
        'error',
        6000
      );
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  function closePreview() {
    if (previewBox) previewBox.classList.remove('active');
    if (previewVideo) {
      previewVideo.pause();
      previewVideo.src = '';
    }
    if (previewImg) previewImg.src = '';
    if (fileInput) fileInput.value = '';
    if (albumQuickInput) albumQuickInput.value = '';
    pendingFilesQueue = [];
    currentPreviewDataUrl = null;
    currentPreviewBlob = null;
    currentPreviewThumbUrl = null;
  }

  if (btnCancelUpload) {
    btnCancelUpload.addEventListener('click', closePreview);
  }

  if (btnConfirmUpload) {
    btnConfirmUpload.addEventListener('click', async () => {
      if ((!currentPreviewDataUrl && !currentPreviewBlob) || pendingFilesQueue.length === 0) return;

      const file = pendingFilesQueue[currentPreviewIndex] || currentPreviewBlob;
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
      btnConfirmUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah ke Cloudinary...';
      setCloudinaryProgressUI(true, 'Mengunggah ke Cloudinary...', 15);

      try {
        let secureUrl = '';
        let thumbUrl = '';
        let publicId = '';
        let deleteToken = '';

        if (file instanceof Blob || file instanceof File) {
          const cldRes = await uploadToCloudinary(file, (percent) => {
            setCloudinaryProgressUI(true, `Mengunggah ke Cloudinary: ${percent}%`, percent);
          }, { title: title || 'Momen Baru', caption: caption || 'Momen manis yang diabadikan bersama.' });
          if (cldRes && cldRes.secure_url) {
            secureUrl = cldRes.secure_url;
            publicId = cldRes.public_id || '';
            deleteToken = cldRes.delete_token || '';
            if (currentPreviewFileType === 'video') {
              thumbUrl = secureUrl.replace(/\.[^/.]+$/, '.jpg').replace('/upload/', '/upload/c_fill,g_auto,w_600,h_800,so_auto/');
            } else {
              thumbUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_auto,w_600,h_800,q_auto,f_auto/');
            }
          }
        }

        if (!secureUrl) {
          secureUrl = currentPreviewDataUrl || (currentPreviewBlob ? URL.createObjectURL(currentPreviewBlob) : '');
          thumbUrl = currentPreviewThumbUrl || secureUrl;
        }

        const newId = publicId ? ('cld_' + publicId.replace(/[^a-zA-Z0-9]/g, '_')) : ('cld_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
        const momentItem = {
          id: newId,
          name: file && file.name ? file.name : (title + (currentPreviewFileType === 'video' ? '.mp4' : '.jpg')),
          type: currentPreviewFileType,
          src: secureUrl,
          thumb: thumbUrl || secureUrl,
          thumbUrl: thumbUrl || secureUrl,
          title: title || (file && file.name ? file.name.replace(/\.[^/.]+$/, "") : 'Momen Baru'),
          caption: caption || 'Foto kenangan manis yang diabadikan bersama.',
          date: formattedDate,
          year: category,
          timestamp: Date.now(),
          isPreset: false,
          isUserUpload: true,
          isCloudinary: !!publicId,
          cloudinaryPublicId: publicId,
          deleteToken: deleteToken
        };

        if (publicId) {
          saveCloudinaryMoment(momentItem);
        }
        await dbSaveAlbumPhoto(momentItem);

        allMomentsCache = [momentItem, ...allMomentsCache.filter(m => String(m.id) !== String(newId))];
        currentFilter = 'all';
        const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn:not(.btn-clear-all)');
        filterBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        applyFilterAndRender();

        if (window.triggerParticleBurst) {
          window.triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 45);
        }

        showToast(`Momen "${escapeHtml(momentItem.title)}" berhasil disimpan ke Album Cinta! ☁️❤️`, 'success');

        closePreview();

        setTimeout(() => {
          const card = document.querySelector(`.moment-card[data-id="${newId}"]`);
          if (card) {
            card.classList.add('new-moment-highlight');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 250);
      } catch (err) {
        console.warn('Confirm upload error:', err);
        showToast(`Gagal mengunggah: ${err.message}`, 'error', 6000);
      } finally {
        setCloudinaryProgressUI(false);
        btnConfirmUpload.disabled = false;
        btnConfirmUpload.innerHTML = '<i class="fa-solid fa-heart-circle-plus"></i> Simpan ke Galeri Cinta';
      }
    });
  }
}

async function saveNewUploadedMoment({ file, blob, dataUrl, thumbUrl, type, title, caption, date, category }) {
  const newId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  let mediaBlob = null;
  if (blob instanceof Blob) {
    mediaBlob = blob;
  } else if (file instanceof Blob) {
    mediaBlob = file;
  }

  let displaySrc = dataUrl || '';
  if (!displaySrc && mediaBlob) {
    displaySrc = URL.createObjectURL(mediaBlob);
  }

  let finalThumb = thumbUrl || displaySrc;
  if (!finalThumb && type === 'video') {
    finalThumb = createVideoPlaceholder(title || (file ? file.name : 'Video Kenangan'));
  }

  const momentItem = {
    id: newId,
    name: file && file.name ? file.name : (title + (type === 'video' ? '.mp4' : '.jpg')),
    type: type,
    blob: mediaBlob,
    src: displaySrc,
    thumb: finalThumb,
    thumbUrl: finalThumb,
    title: title || 'Momen Spesial',
    caption: caption || 'Momen manis yang diabadikan bersama.',
    date: date || 'Hari Ini',
    year: category || 'user',
    timestamp: Date.now(),
    isPreset: false,
    isUserUpload: true
  };

  await dbSaveAlbumPhoto(momentItem);

  allMomentsCache = [momentItem, ...allMomentsCache.filter(m => String(m.id) !== String(newId))];

  // Switch filter to 'all' so new upload is immediately rendered and visible
  currentFilter = 'all';
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn:not(.btn-clear-all)');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
  });

  applyFilterAndRender();

  return momentItem;
}

function exportAlbumBackup() {
  const cldMoments = getStoredCloudinaryMoments();
  dbGetAllAlbumPhotos().then(photos => {
    const userPhotos = photos.filter(p => !p.isPreset);
    const map = new Map();
    userPhotos.forEach(p => map.set(String(p.id), p));
    cldMoments.forEach(c => map.set(String(c.id), c));
    const allUserList = Array.from(map.values());

    if (allUserList.length === 0) {
      showToast('Belum ada foto yang diunggah untuk dicadangkan.', 'info');
      return;
    }
    const backupData = {
      app: 'Happy-7th-Anniversary-Album',
      exportDate: new Date().toISOString(),
      photos: allUserList.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type || 'image',
        thumb: p.thumb || p.thumbUrl || '',
        src: p.src || '',
        title: p.title || 'Foto Kenangan',
        caption: p.caption || '',
        date: p.date || 'Hari Ini',
        year: p.year || 'user',
        timestamp: p.timestamp || Date.now(),
        isPreset: false,
        isUserUpload: true,
        isCloudinary: !!p.isCloudinary || (typeof p.src === 'string' && p.src.includes('cloudinary.com'))
      }))
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-album-cinta-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Berhasil mendownload cadangan ${allUserList.length} foto album! 💾`, 'success');
  });
}

function importAlbumBackup(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || !Array.isArray(data.photos)) {
        showToast('Format file cadangan tidak valid.', 'error');
        return;
      }
      let imported = 0;
      for (const p of data.photos) {
        if (p.thumb || p.src) {
          if (p.isCloudinary || (typeof p.src === 'string' && p.src.includes('cloudinary.com'))) {
            saveCloudinaryMoment(p);
          }
          await dbSaveAlbumPhoto(p);
          imported++;
        }
      }
      await loadGalleryMoments();
      showToast(`Sukses memulihkan ${imported} foto ke Album! ❤️💙`, 'success');
    } catch (err) {
      showToast('Gagal membaca file cadangan: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function setDirectMediaPreview({ type, dataUrl, blob = null, thumbUrl = null, defaultTitle = '', fileInfo = '' }) {
  const previewBox = document.getElementById('uploadPreviewBox');
  const previewImg = document.getElementById('previewImg');
  const previewVideo = document.getElementById('previewVideo');
  const previewFileBadge = document.getElementById('previewFileBadge');
  const previewTitleInput = document.getElementById('previewTitleInput');
  const previewDateInput = document.getElementById('previewDateInput');

  if (!previewBox) return;

  currentPreviewFileType = type;
  currentPreviewDataUrl = dataUrl;
  currentPreviewBlob = blob;
  currentPreviewThumbUrl = thumbUrl || (type === 'image' ? dataUrl : null);
  pendingFilesQueue = [blob || { name: defaultTitle + (type === 'video' ? '.mp4' : '.jpg') }];
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

    mediaRecorder.onstop = async () => {
      clearInterval(recordTimerInterval);
      if (recBadge) recBadge.style.display = 'none';
      if (recordVideoBtn) recordVideoBtn.classList.remove('recording');

      const blob = new Blob(recordedVideoChunks, { type: mediaRecorder.mimeType || 'video/mp4' });
      const videoObjectUrl = URL.createObjectURL(blob);
      const thumb = await extractVideoThumbnail(blob);
      closeCamera();

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setDirectMediaPreview({
        type: 'video',
        dataUrl: videoObjectUrl,
        blob: blob,
        thumbUrl: thumb,
        defaultTitle: `Video Rekaman Kita (${timeStr})`,
        fileInfo: `Rekaman Kamera (${(blob.size / 1024 / 1024).toFixed(2)} MB)`
      });
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
    src: 'AsetFoto/IMG_0421.JPG?v=2',
    thumb: 'AsetFoto/thumbs/IMG_0421.JPG?v=2',
    title: 'Momen Manis Bersamamu',
    caption: 'Awal musim semi penuh senyum dan kehangatan langkah kita.',
    date: 'Sorotan Spesial',
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
    src: 'AsetFoto/IMG_0821.JPG?v=2',
    thumb: 'AsetFoto/thumbs/IMG_0821.JPG?v=2',
    title: 'Senyuman Terindahmu',
    caption: 'Tatapan dan senyum manis yang selalu menenangkan duniaku.',
    date: 'Sorotan Spesial',
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
    caption: 'Menikmati langit senja bersama Syifanaa yang paling kucintai.',
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
    src: 'AsetFoto/IMG_2112.JPG?v=2',
    thumb: 'AsetFoto/thumbs/IMG_2112.JPG?v=2',
    title: 'Perjalanan Berharga',
    caption: 'Setiap kilometer terasa begitu istimewa saat ada kamu di sisiku.',
    date: 'Sorotan Spesial',
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
    caption: 'Malam syahdu bertabur cahaya bersama Syifanaa impian hatiku.',
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
    caption: 'Keceriaan manis yang selalu menyegarkan jiwa di setiap langkah.',
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
    date: 'Sorotan Spesial',
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
      imgEl.setAttribute('data-id', item.id);
      imgEl.style.objectPosition = item.id === 'preset_1' ? 'center 55%' : (item.id === 'preset_8' ? 'center 35%' : '');
      if (titleEl) titleEl.textContent = `${item.title} ❤️`;
      if (dateEl) {
        dateEl.innerHTML = '';
        dateEl.style.display = 'none';
      }
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
    { id: 'preset_1', tag: '', title: 'Kenangan Tak Terlupakan', item: ASET_FOTO_ITEMS[0] },
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
        ${m.tag ? `<span class="hl-tag">${m.tag}</span>` : ''}
        <h4 class="hl-title">${m.title}</h4>
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

let isSyncingGallery = false;

/* Realtime Gallery Synchronization Across Devices */
async function syncRemoteGallery(isBackground = false) {
  if (isSyncingGallery) return;
  isSyncingGallery = true;

  try {
    const result = await fetchCloudinaryRemoteGallery();
    const remotePhotos = (result && result.photos) ? result.photos : [];
    const deletedIds = getDeletedCloudinaryIds();

    let stateChanged = false;

    // 1. Purge any moments currently in memory or DOM that are deleted
    const deletedInCache = allMomentsCache.filter(m => {
      if (m.isPreset) return false;
      const strId = String(m.id || '');
      const cleanId = strId.replace(/^cld_/, '');
      const pubId = String(m.cloudinaryPublicId || '');
      const cldKey = 'cld_' + (pubId || cleanId).replace(/[^a-zA-Z0-9]/g, '_');

      if (deletedIds.includes(strId) || deletedIds.includes(cleanId) || deletedIds.includes(cldKey)) return true;
      if (pubId && (deletedIds.includes(pubId) || deletedIds.includes('cld_' + pubId.replace(/[^a-zA-Z0-9]/g, '_')))) return true;
      return false;
    });

    if (deletedInCache.length > 0) {
      deletedInCache.forEach(m => {
        const card = document.querySelector(`.moment-card[data-id="${m.id}"]`);
        if (card) {
          card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.85)';
          setTimeout(() => card.remove(), 250);
        }
        removeCloudinaryMoment(m.id);
        dbDeleteAlbumPhoto(m.id);
        if (m.cloudinaryPublicId) {
          removeCloudinaryMoment(m.cloudinaryPublicId);
          dbDeleteAlbumPhoto(m.cloudinaryPublicId);
        }
        if (activeMomentId !== null && (String(activeMomentId) === String(m.id) || String(activeMomentId) === String(m.cloudinaryPublicId))) {
          closeLightbox();
        }
      });

      const deletedIdSet = new Set(deletedInCache.map(d => String(d.id)));
      allMomentsCache = allMomentsCache.filter(m => !deletedIdSet.has(String(m.id)));
      currentVisibleMoments = currentVisibleMoments.filter(m => !deletedIdSet.has(String(m.id)));
      stateChanged = true;
    }

    // 2. Add any new remote photos uploaded from other devices
    remotePhotos.forEach(rp => {
      if (isDummyOrInvalidMedia(rp)) return;
      const exists = allMomentsCache.some(m => 
        String(m.id) === String(rp.id) || 
        (m.cloudinaryPublicId && rp.cloudinaryPublicId && String(m.cloudinaryPublicId) === String(rp.cloudinaryPublicId))
      );
      if (!exists) {
        saveCloudinaryMoment(rp);
        allMomentsCache.unshift(rp);
        stateChanged = true;
      }
    });

    if (stateChanged) {
      const userItems = allMomentsCache.filter(m => !m.isPreset && !isDummyOrInvalidMedia(m)).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      allMomentsCache = [...userItems, ...ASET_FOTO_ITEMS];
      applyFilterAndRender();
    }
  } catch (err) {
    if (!isBackground) {
      console.warn('Sync remote gallery error:', err);
    }
  } finally {
    isSyncingGallery = false;
  }
}

// Background live sync triggers across devices
if (!window._gallerySyncListenersAttached) {
  window._gallerySyncListenersAttached = true;
  setInterval(() => {
    syncRemoteGallery(true);
  }, 12000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncRemoteGallery(true);
    }
  });

  window.addEventListener('focus', () => {
    syncRemoteGallery(true);
  });

  window.addEventListener('online', () => {
    syncRemoteGallery(true);
  });
}

/* Gallery Moments Loader & Renderer */
async function loadGalleryMoments() {
  try {
    const storedCloudinary = getStoredCloudinaryMoments();
    let userPhotos = [];
    try {
      userPhotos = await dbGetAllAlbumPhotos();
    } catch (e) {
      console.warn('IndexedDB read fallback:', e);
      userPhotos = getStoredUserMoments();
    }

    const combinedMap = new Map();

    (userPhotos || []).forEach(u => {
      if (isDummyOrInvalidMedia(u)) return;
      let src = u.src || u.dataUrl || '';
      if (u.blob instanceof Blob) {
        src = URL.createObjectURL(u.blob);
      }
      let thumb = u.thumb || u.thumbUrl || src || '';
      if (!thumb && u.type === 'video') {
        thumb = createVideoPlaceholder(u.title || u.name || 'Video Kita');
      }
      const item = {
        id: u.id,
        src: src || thumb,
        blob: u.blob || null,
        thumb: thumb,
        thumbUrl: thumb,
        title: u.title || u.name || 'Momen Spesial',
        caption: u.caption || 'Momen kenangan manis yang tersimpan di Album Cinta.',
        date: u.date || 'Unggahan Baru',
        year: u.year || 'user',
        timestamp: u.timestamp || Date.now(),
        type: u.type || 'image',
        isPreset: false,
        isUserUpload: true,
        isCloudinary: !!u.isCloudinary || (typeof u.src === 'string' && u.src.includes('cloudinary.com')),
        cloudinaryPublicId: u.cloudinaryPublicId || '',
        deleteToken: u.deleteToken || ''
      };
      combinedMap.set(String(item.id), item);
    });

    (storedCloudinary || []).forEach(c => {
      if (isDummyOrInvalidMedia(c)) return;
      const item = {
        id: c.id,
        src: c.src,
        thumb: c.thumb || c.thumbUrl || c.src,
        thumbUrl: c.thumbUrl || c.thumb || c.src,
        title: c.title || 'Foto Kenangan Cinta',
        caption: c.caption || 'Foto kenangan manis yang tersimpan di Cloudinary.',
        date: c.date || 'Unggahan Baru',
        year: c.year || 'user',
        timestamp: c.timestamp || Date.now(),
        type: c.type || 'image',
        isPreset: false,
        isUserUpload: true,
        isCloudinary: true,
        cloudinaryPublicId: c.cloudinaryPublicId || '',
        deleteToken: c.deleteToken || ''
      };
      combinedMap.set(String(item.id), item);
    });

    const dedupedUserPhotos = Array.from(combinedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    allMomentsCache = [...dedupedUserPhotos, ...ASET_FOTO_ITEMS];
    applyFilterAndRender();

    // Trigger full live sync with Cloudinary (tombstones & remote uploads)
    syncRemoteGallery();
  } catch (err) {
    console.warn('Error loading gallery moments:', err);
    const storedCloudinary = getStoredCloudinaryMoments();
    allMomentsCache = [...storedCloudinary, ...getStoredUserMoments(), ...ASET_FOTO_ITEMS];
    applyFilterAndRender();
  }
}

function applyFilterAndRender() {
  const userCount = allMomentsCache.filter(item => !item.isPreset && !isDummyOrInvalidMedia(item)).length;
  const totalCount = allMomentsCache.filter(item => !isDummyOrInvalidMedia(item)).length;

  const countAllEl = document.getElementById('filterCountAll');
  if (countAllEl) countAllEl.textContent = totalCount;

  const countUserEl = document.getElementById('filterCountUser');
  if (countUserEl) countUserEl.textContent = userCount;

  const userFilterBtn = document.querySelector('.filter-btn[data-filter="user"]');
  if (userFilterBtn) {
    userFilterBtn.innerHTML = `<i class="fa-solid fa-sparkles text-red"></i> Unggahan Kita (${userCount})`;
  }

  currentVisibleMoments = allMomentsCache.filter(item => {
    if (isDummyOrInvalidMedia(item)) return false;
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

  // Filter out any dummy / invalid item without a valid media source
  const validMoments = (moments || []).filter(item => {
    if (!item) return false;
    if (isDummyOrInvalidMedia(item)) return false;
    const src = item.src || item.thumb;
    if (!src || typeof src !== 'string' || src.trim() === '') return false;
    return true;
  });

  if (validMoments.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: #94a3b8;">
        <i class="fa-solid fa-camera-retro" style="font-size: 3rem; color: #e63946; margin-bottom: 15px;" aria-hidden="true"></i>
        <h3 style="color: #fff; font-size: 1.3rem; margin-bottom: 8px;">Belum ada momen untuk kategori ini</h3>
        <p style="font-size: 0.9rem;">Klik tombol "Upload Foto / Video" di atas untuk menambahkan kenangan manis berdua!</p>
      </div>
    `;
    return;
  }

  validMoments.forEach(item => {
    const card = document.createElement('div');
    card.className = `moment-card ${!item.isPreset ? 'user-uploaded' : ''}`;
    card.dataset.id = item.id;
    card.dataset.year = item.year || 'all';

    const isVideo = item.type === 'video';
    const mediaHtml = isVideo
      ? `<div class="moment-media-video-wrap">
          <img src="${item.thumb || item.src}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="const c=this.closest('.moment-card'); if(c) c.remove();">
          <span class="video-play-indicator" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
        </div>`
      : `<img src="${item.thumb || item.src}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="const c=this.closest('.moment-card'); if(c) c.remove();">`;

    const isCloud = !!item.isCloudinary || (typeof item.src === 'string' && item.src.includes('cloudinary.com'));
    const badgeText = item.isPreset ? (item.year || 'Kenangan') : (isCloud ? (isVideo ? 'Cloud Video' : 'Cloud Foto') : (isVideo ? 'Video Kita' : 'Foto Kita'));
    const badgeIcon = isVideo ? 'fa-video' : (item.isPreset ? 'fa-heart' : (isCloud ? 'fa-cloud' : 'fa-sparkles'));
    const overlayIcon = isVideo ? 'fa-play' : 'fa-magnifying-glass-plus';

    card.innerHTML = `
      <div class="polaroid-tape" aria-hidden="true"></div>
      <div class="moment-media" role="button" tabindex="0" aria-label="Buka ${isVideo ? 'video' : 'foto'} ${escapeHtml(item.title)} di resolusi penuh">
        ${mediaHtml}
        <span class="media-type-badge ${isVideo ? 'video' : 'photo'} ${!item.isPreset ? 'user-badge' : ''} ${isCloud ? 'cld-badge' : ''}">
          <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
        </span>
        <div class="moment-overlay" aria-hidden="true">
          <i class="fa-solid ${overlayIcon}"></i>
        </div>
      </div>
      <div class="moment-details">
        <div class="moment-footer">
          <span class="moment-date">${item.date === 'Sorotan Spesial' ? '<i class=\"fa-solid fa-sparkles text-blue\"></i> Sorotan Spesial' : '<i class=\"fa-regular fa-calendar-check\"></i> ' + item.date}</span>
          <div class="moment-card-actions">
            <button type="button" class="btn-card-star" onclick="setAsHeroPhoto('${item.id}')" title="Jadikan Sorotan Utama di Beranda" aria-label="Jadikan sorotan utama">
              <i class="fa-regular fa-star"></i>
            </button>
            ${!item.isPreset ? `
              <button type="button" class="moment-del-btn" onclick="deleteMoment('${item.id}')" title="Hapus Foto ini dari Album" aria-label="Hapus foto ini">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : `
              <span class="badge-permanent" title="Kenangan Abadi"><i class="fa-solid fa-heart"></i> <span class="badge-text">Kenangan</span></span>
            `}
          </div>
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

window.setAsHeroPhoto = function(id) {
  const item = allMomentsCache.find(m => String(m.id) === String(id));
  if (!item) return;

  const heroImg = document.getElementById('heroFeaturedImg');
  const heroTitle = document.getElementById('heroPhotoTitle');
  const heroDate = document.getElementById('heroPhotoDate');
  const heroPolaroid = document.getElementById('heroPolaroid');

  if (heroImg) {
    heroImg.src = item.src || item.thumb;
    heroImg.onerror = () => { if (item.thumb) heroImg.src = item.thumb; };
    heroImg.alt = item.title;
  }
  if (heroTitle) heroTitle.textContent = `${item.title} ❤️`;
  if (heroDate) {
    heroDate.innerHTML = '';
    heroDate.style.display = 'none';
  }

  if (heroPolaroid) {
    heroPolaroid.classList.remove('switched');
    void heroPolaroid.offsetWidth;
    heroPolaroid.classList.add('switched');
  }

  showToast(`Foto "${escapeHtml(item.title)}" dijadikan sorotan utama di Beranda! 🌟❤️`, 'success');

  const heroSec = document.querySelector('.hero-section');
  if (heroSec) {
    heroSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.deleteMoment = async function(id) {
  if (!confirm('Apakah kamu yakin ingin menghapus foto kenangan ini dari Album? Foto juga akan terhapus otomatis di semua perangkat lain.')) return;

  const targetItem = allMomentsCache.find(m => String(m.id) === String(id)) || null;
  const cleanPublicId = targetItem?.cloudinaryPublicId || (String(id).startsWith('cld_') ? String(id).replace(/^cld_/, '') : String(id));
  const deleteToken = targetItem?.deleteToken || '';
  const cldKey = 'cld_' + cleanPublicId.replace(/[^a-zA-Z0-9]/g, '_');

  // 1. Remove element immediately from DOM with smooth transition
  const card = document.querySelector(`.moment-card[data-id="${id}"]`);
  if (card) {
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.85)';
    setTimeout(() => card.remove(), 250);
  }

  // 2. Blacklist locally so it will never be pulled again
  markCloudinaryMomentDeleted(id);
  markCloudinaryMomentDeleted(cleanPublicId);
  markCloudinaryMomentDeleted(cldKey);

  // 3. Remove from Cloudinary localStorage
  removeCloudinaryMoment(id);
  removeCloudinaryMoment(cleanPublicId);
  removeCloudinaryMoment(cldKey);

  // 4. Remove from IndexedDB
  await dbDeleteAlbumPhoto(id);
  await dbDeleteAlbumPhoto(cleanPublicId);
  await dbDeleteAlbumPhoto(cldKey);

  // 5. Update state arrays
  allMomentsCache = allMomentsCache.filter(m => 
    String(m.id) !== String(id) && 
    String(m.id) !== String(cleanPublicId) && 
    String(m.id) !== String(cldKey) &&
    String(m.cloudinaryPublicId) !== String(cleanPublicId)
  );
  currentVisibleMoments = currentVisibleMoments.filter(m => 
    String(m.id) !== String(id) && 
    String(m.id) !== String(cleanPublicId) && 
    String(m.id) !== String(cldKey) &&
    String(m.cloudinaryPublicId) !== String(cleanPublicId)
  );

  if (activeMomentId !== null && (String(activeMomentId) === String(id) || String(activeMomentId) === String(cleanPublicId))) {
    closeLightbox();
  }

  setTimeout(() => {
    applyFilterAndRender();
  }, 260);

  showToast('Menghapus dan menyinkronkan ke seluruh perangkat... ☁️', 'info');

  // 6. Broadcast deletion tombstone to Cloudinary so all devices remove it
  const broadcastOk = await broadcastCloudinaryDeletion(cleanPublicId, id, deleteToken);
  if (broadcastOk) {
    showToast('Foto kenangan berhasil dihapus dari semua perangkat! 🗑️✨', 'success');
  } else {
    showToast('Foto berhasil dihapus secara lokal dan akan disinkronkan saat terhubung kembali.', 'info');
  }
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

      const userItems = allMomentsCache.filter(m => !m.isPreset);
      userItems.forEach(item => {
        const cleanPublicId = item.cloudinaryPublicId || (String(item.id).startsWith('cld_') ? String(item.id).replace(/^cld_/, '') : String(item.id));
        markCloudinaryMomentDeleted(item.id);
        markCloudinaryMomentDeleted(cleanPublicId);
        broadcastCloudinaryDeletion(cleanPublicId, item.id, item.deleteToken || '').catch(() => {});
      });

      persistUserMoments([]);
      persistCloudinaryMoments([]);

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
      showToast('Seluruh unggahan baru berhasil dibersihkan dan disinkronkan!', 'info');
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

  const starBtn = document.getElementById('lightboxStarBtn');
  if (starBtn) {
    starBtn.addEventListener('click', () => {
      if (activeMomentId !== null) {
        setAsHeroPhoto(activeMomentId);
        closeLightbox();
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
      ? `<video src="${item.src}" controls autoplay playsinline style="max-height: 68vh; max-width: 100%; border-radius: 14px; background: #000; box-shadow: 0 10px 40px rgba(0,0,0,0.8);"></video>`
      : `<img src="${item.src}" alt="${escapeHtml(item.title)}" onerror="this.src='${item.thumb}'" style="max-height: 68vh; max-width: 100%; border-radius: 14px; object-fit: contain; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">`;
  }

  if (titleEl) titleEl.textContent = item.title;
  if (dateEl) {
    dateEl.innerHTML = item.date === 'Sorotan Spesial'
      ? `<i class="fa-solid fa-sparkles text-blue"></i> Sorotan Spesial`
      : `<i class="fa-regular fa-calendar"></i> ${item.date}`;
  }
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
  if (mediaWrapper) {
    const video = mediaWrapper.querySelector('video');
    if (video) {
      video.pause();
      video.src = '';
    }
    mediaWrapper.innerHTML = '';
  }
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
        "Hai, Sayaaang. Tujuh tahun ya kita sama-sama. Kalau dipikir-pikir, waktu rasanya berjalan cepat banget, tapi kalau diingat-ingat lagi, udah banyak banget momen dan cerita yang kita lewati berdua sejak 16 Desember 2019.",
        "Aku cuma mau bilang terima kasih. Terima kasih udah selalu sabar, udah mau dengerin hal-hal random yang aku ceritain, dan yang paling penting, terima kasih udah selalu jadi tempat paling nyaman buat aku pulang pas lagi capek-capeknya. Tumbuh dan belajar bareng kamu adalah bagian terbaik dalam hidupku.",
        "Kita sama-sama tahu perjalanan tujuh tahun ini nggak selalu mulus. Tapi satu hal yang pasti: aku nggak pernah menyesal memilih kamu. Semua ketawa kita, jalan-jalan kita, sampai ngambek-ngambek kecilnya, itu semua yang bikin hubungan ini hidup dan berharga.",
        "Happy 7th Anniversary, Syifana. Terima kasih udah bertahan dan berjuang bareng aku sejauh ini. Mari terus gandengan tangan dan bikin lebih banyak memori lagi, hari ini, besok, dan selamanya."
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
              text: 'Terima kasih Syifanaa sudah menjadi sosok terhebat dan terindah selama 7 tahun ini. Aku berjanji akan selalu ada di sampingmu di setiap langkah perjalanan kita menuju selamanya ❤️',
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

/* 12. Fixed Static Background Handler (Smooth 60/120fps Mobile & Desktop Scrolling) */
function initPhotoboothParallax() {
  const strip = document.getElementById('photoboothParallaxStrip');
  if (!strip) return;

  function updateParallax() {
    if (strip) {
      strip.style.transform = 'translateZ(0)';
    }
  }

  window.updatePhotoboothParallax = updateParallax;
  updateParallax();
}

