// --- גלגל השאלות והסרטונים - קובץ יישום מאוחד ---

// 1. תבניות משחק מוכנות מראש
const PRESET_GAME_SETS = [
  {
    id: 'preset-music-trivia',
    title: '🎵 חידון מוזיקה, תמונות וסרטונים',
    description: 'משחק טריוויה מגוון המשלב שאלות, סרטוני יוטיוב ותמונות סטילס',
    spinDuration: 6,
    items: [
      {
        id: 'item-m1',
        text: 'זהה את הקלאסיקה! צפה בסרטון וענה: באיזה עשור יצא השיר?',
        color: '#ec4899',
        youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        imageUrl: '',
        active: true
      },
      {
        id: 'item-m2',
        text: 'זהה את המקום בתמונה: באיזו עיר מדובר?',
        color: '#10b981',
        youtubeUrl: '',
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        active: true
      },
      {
        id: 'item-m3',
        text: 'מהו השיר הישראלי שנמצא בסרטון וזכה באירוויזיון?',
        color: '#3b82f6',
        youtubeUrl: 'https://www.youtube.com/watch?v=84LBjXaeKk4',
        imageUrl: '',
        active: true
      },
      {
        id: 'item-m4',
        text: 'ספר על הופעה חיה או שיר ראשון שאי פעם אהבת במיוחד',
        color: '#f59e0b',
        youtubeUrl: '',
        imageUrl: '',
        active: true
      }
    ]
  },
  {
    id: 'preset-icebreaker',
    title: '🧊 שאלות שבור את הקרח',
    description: 'שאלות היכרות מהנות לצוותים, מסיבות ומפגשים חברתיים',
    spinDuration: 5,
    items: [
      {
        id: 'item-i1',
        text: 'מה היה היעד האחרון שטיילת בו, ומה הכי אהבת שם?',
        color: '#06b6d4',
        youtubeUrl: '',
        imageUrl: '',
        active: true
      },
      {
        id: 'item-i2',
        text: 'אם היית יכול לאכול רק מאכל אחד למשך שנה, מה היית בוחר?',
        color: '#84cc16',
        youtubeUrl: '',
        imageUrl: '',
        active: true
      },
      {
        id: 'item-i3',
        text: 'צפה בסרטון המצחיק הזה וספר על הפדיחה הכי מצחיקה שקרתה לך!',
        color: '#f97316',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        imageUrl: '',
        active: true
      },
      {
        id: 'item-i4',
        text: 'מהו הכישרון הסודי או התחביב שלמעטים ידוע עליו?',
        color: '#a855f7',
        youtubeUrl: '',
        imageUrl: '',
        active: true
      }
    ]
  }
];

// 2. מודול אחסון מקומי
const STORAGE_KEY_GAMES = 'wheel_game_sets_v1';
const STORAGE_KEY_ACTIVE_ID = 'wheel_active_game_id_v1';
const STORAGE_KEY_REMOVED_PREFIX = 'wheel_removed_items_v1_';

class StorageManager {
  static async loadInitialGameSetsAsync() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GAMES);
      if (raw) {
        return JSON.parse(raw);
      }
      try {
        const res = await fetch('./game-sets.json');
        if (res && res.ok) {
          const remoteGames = await res.json();
          const gamesList = Array.isArray(remoteGames) ? remoteGames : (remoteGames.gameSets || PRESET_GAME_SETS);
          this.saveGameSets(gamesList);
          return gamesList;
        }
      } catch (err) {
        // Fetch failed on local file:// protocol or offline - fallback safely
      }
    } catch (e) {
      console.log('Using default preset game sets');
    }
    this.saveGameSets(PRESET_GAME_SETS);
    return PRESET_GAME_SETS;
  }

  static getGameSets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GAMES);
      if (!raw) {
        this.saveGameSets(PRESET_GAME_SETS);
        return [...PRESET_GAME_SETS];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...PRESET_GAME_SETS];
    } catch (e) {
      return [...PRESET_GAME_SETS];
    }
  }

  static saveGameSets(sets) {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(sets));
    } catch (e) {}
  }

  static getActiveGameId() {
    const sets = this.getGameSets();
    const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (savedId && sets.some(s => s.id === savedId)) {
      return savedId;
    }
    return sets[0]?.id || 'preset-music-trivia';
  }

  static setActiveGameId(id) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  }

  static getActiveGameSet() {
    const activeId = this.getActiveGameId();
    const sets = this.getGameSets();
    return sets.find(s => s.id === activeId) || sets[0];
  }

  static saveGameSet(gameSet) {
    const sets = this.getGameSets();
    const index = sets.findIndex(s => s.id === gameSet.id);
    if (index >= 0) {
      sets[index] = gameSet;
    } else {
      sets.push(gameSet);
    }
    this.saveGameSets(sets);
    this.setActiveGameId(gameSet.id);
  }

  static deleteGameSet(id) {
    let sets = this.getGameSets();
    if (sets.length <= 1) {
      alert('לא ניתן למחוק את המשחק האחרון. עליך ליצור משחק נוסף תחילה.');
      return false;
    }
    sets = sets.filter(s => s.id !== id);
    this.saveGameSets(sets);
    if (this.getActiveGameId() === id) {
      this.setActiveGameId(sets[0].id);
    }
    this.resetRemovedItems(id);
    return true;
  }

  static createNewGameSet(title = 'משחק חדש') {
    const newSet = {
      id: 'game-' + Date.now(),
      title: title,
      description: 'ערכת שאלות מותאמת אישית',
      spinDuration: 6,
      items: [
        { id: 'item-' + Date.now() + '-1', text: 'שאלה ראשונה למשחק', color: '#ec4899', youtubeUrl: '', imageUrl: '', active: true },
        { id: 'item-' + Date.now() + '-2', text: 'שאלה שנייה למשחק', color: '#3b82f6', youtubeUrl: '', imageUrl: '', active: true },
        { id: 'item-' + Date.now() + '-3', text: 'שאלה שלישית למשחק', color: '#10b981', youtubeUrl: '', imageUrl: '', active: true }
      ]
    };
    this.saveGameSet(newSet);
    return newSet;
  }

  static getRemovedItemIds(gameId) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REMOVED_PREFIX + gameId);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  static addRemovedItemId(gameId, itemId) {
    const removed = this.getRemovedItemIds(gameId);
    if (!removed.includes(itemId)) {
      removed.push(itemId);
      localStorage.setItem(STORAGE_KEY_REMOVED_PREFIX + gameId, JSON.stringify(removed));
    }
  }

  static resetRemovedItems(gameId) {
    localStorage.removeItem(STORAGE_KEY_REMOVED_PREFIX + gameId);
  }

  static exportGameSetsJSON() {
    const gameSets = this.getGameSets();
    const jsonStr = JSON.stringify(gameSets, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-sets.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importGameSetsJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const list = Array.isArray(parsed) ? parsed : parsed.gameSets;
      if (Array.isArray(list) && list.length > 0) {
        this.saveGameSets(list);
        if (list[0]?.id) {
          this.setActiveGameId(list[0].id);
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

// 3. מודול נגן YouTube
class YouTubeHelper {
  static extractVideoId(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  static renderEmbedContainer(urlOrId) {
    const videoId = this.extractVideoId(urlOrId);
    if (!videoId) return '';
    return `
      <div class="youtube-wrapper">
        <div class="youtube-aspect-ratio">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
  }
}

// 4. מודול שמע Web Audio API
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.5;
    this.lastTickTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick(velocityRatio = 0.5) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastTickTime < 0.03) return;
    this.lastTickTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 400 + velocityRatio * 500;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = now + index * 0.08;
        const duration = 0.4;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.5, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }
}
const soundEngine = new SoundEngine();

// 5. מודול קונפטי
class ConfettiEngine {
  static launch(durationMs = 3500) {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '999999';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#eab308', '#f97316'];
    const particles = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 - 100,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1) * 14 - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    const startTime = Date.now();

    function render() {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.98;
        p.rotation += p.rSpeed;

        if (elapsed > durationMs - 800) {
          p.opacity = Math.max(0, p.opacity - 0.02);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (elapsed < durationMs) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    requestAnimationFrame(render);
  }
}

// 6. מנוע הקנבס והפיזיקה
class WheelCanvas {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.items = [];
    this.currentAngle = 0;
    this.isSpinning = false;
    this.spinDuration = options.spinDuration || 6;
    this.onSpinEnd = options.onSpinEnd || null;
    this.onSpinStart = options.onSpinStart || null;

    this.pointerAngle = (3 * Math.PI) / 2;
    this.lastPassedSegmentIndex = -1;
    this.pointerBounce = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  setItems(items) {
    this.items = items.filter(item => item.active !== false);
    this.draw();
  }

  setSpinDuration(seconds) {
    this.spinDuration = Math.max(2, Math.min(20, seconds));
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const size = Math.min(rect.width || 400, rect.height || 400, 560);
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.scale(dpr, dpr);
    this.displaySize = size;
    this.draw();
  }

  truncateText(text, maxLength = 22) {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.slice(0, maxLength - 1) + '...';
  }

  draw() {
    const size = this.displaySize || 400;
    const center = size / 2;
    const radius = center - 16;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, size, size);

    if (this.items.length === 0) {
      this.drawEmptyState(center, radius);
      this.drawPointer(center, radius);
      return;
    }

    const numSlices = this.items.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const item = this.items[i];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = item.color || this.getDefaultColor(i);
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      ctx.save();
      const textAngle = startAngle + sliceAngle / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      const fontSize = Math.max(12, Math.min(18, 260 / Math.sqrt(numSlices)));
      ctx.font = `600 ${fontSize}px "Heebo", "Outfit", sans-serif`;

      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      const shortText = this.truncateText(item.text, numSlices > 10 ? 16 : 24);
      ctx.fillText(shortText, radius - 28, 0);

      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Heebo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('סובב!', 0, 0);

    ctx.restore();

    this.drawPointer(center, radius);
  }

  drawEmptyState(center, radius) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(center, center);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px "Heebo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('כל השאלות הסתיימו!', 0, -10);
    ctx.font = '14px "Heebo", sans-serif';
    ctx.fillText('לחץ "אפס גלגל" למחזור חדש', 0, 16);

    ctx.restore();
  }

  drawPointer(center, radius) {
    const ctx = this.ctx;
    ctx.save();

    const pointerLength = 34;
    const pointerWidth = 22;
    const topY = center - radius - 10 + this.pointerBounce;

    ctx.translate(center, topY);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.moveTo(0, pointerLength);
    ctx.lineTo(-pointerWidth / 2, 0);
    ctx.lineTo(pointerWidth / 2, 0);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, pointerLength);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(1, '#e11d48');

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 4, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  getDefaultColor(index) {
    const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#84cc16'];
    return colors[index % colors.length];
  }

  spin() {
    if (this.isSpinning || this.items.length === 0) return;

    this.isSpinning = true;
    if (this.onSpinStart) this.onSpinStart();

    const duration = this.spinDuration * 1000;
    const startTime = performance.now();
    const startAngle = this.currentAngle;

    const extraRounds = Math.floor(Math.random() * 5) + 5;
    const randomAngle = Math.random() * Math.PI * 2;
    const totalRotation = extraRounds * Math.PI * 2 + randomAngle;

    const numSlices = this.items.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const easeOut = 1 - Math.pow(1 - progress, 4);
      this.currentAngle = startAngle + totalRotation * easeOut;

      const currentNorm = (this.currentAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const relativeAngle = (this.pointerAngle - currentNorm + Math.PI * 2) % (Math.PI * 2);
      const currentSegmentIndex = Math.floor(relativeAngle / sliceAngle);

      if (currentSegmentIndex !== this.lastPassedSegmentIndex && this.lastPassedSegmentIndex !== -1) {
        const velocityRatio = 1 - progress;
        soundEngine.playTick(velocityRatio);
        this.pointerBounce = -6;
      }
      this.lastPassedSegmentIndex = currentSegmentIndex;
      this.pointerBounce *= 0.85;

      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.pointerBounce = 0;
        this.draw();

        const finalWinnerIndex = this.getWinningIndex();
        const winningItem = this.items[finalWinnerIndex];

        soundEngine.playVictory();

        if (this.onSpinEnd) {
          this.onSpinEnd(winningItem, finalWinnerIndex);
        }
      }
    };

    requestAnimationFrame(animate);
  }

  getWinningIndex() {
    if (this.items.length === 0) return -1;
    const numSlices = this.items.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    const currentNorm = (this.currentAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const relativeAngle = (this.pointerAngle - currentNorm + Math.PI * 2) % (Math.PI * 2);

    let winnerIndex = Math.floor(relativeAngle / sliceAngle);
    if (winnerIndex >= numSlices) winnerIndex = numSlices - 1;
    if (winnerIndex < 0) winnerIndex = 0;

    return winnerIndex;
  }
}

// 7. מחלקת האפליקציה הראשית
class App {
  constructor() {
    this.activeGameSet = null;
    this.activeItems = [];
    this.currentWinnerItem = null;
    this.wheel = null;

    this.initElements();
    this.initWheel();
    this.loadState();
    this.bindEvents();
  }

  initElements() {
    this.gameSelect = document.getElementById('game-set-select');
    this.btnResetWheel = document.getElementById('btn-reset-wheel');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.soundIcon = document.getElementById('sound-icon');
    this.spinTimeRange = document.getElementById('spin-time-range');
    this.spinTimeVal = document.getElementById('spin-time-val');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnOpenAdmin = document.getElementById('btn-open-admin');

    this.activeGameTitle = document.getElementById('active-game-title');
    this.questionsCountBadge = document.getElementById('questions-count-badge');
    this.wheelContainer = document.getElementById('wheel-container');
    this.canvas = document.getElementById('wheel-canvas');
    this.btnSpinMain = document.getElementById('btn-spin-main');

    this.victoryModal = document.getElementById('victory-modal');
    this.btnCloseVictory = document.getElementById('btn-close-victory');
    this.victoryQuestionText = document.getElementById('victory-question-text');
    this.youtubePlayerContainer = document.getElementById('youtube-player-container');
    this.imagePlayerContainer = document.getElementById('image-player-container');
    this.btnRemoveAndNext = document.getElementById('btn-remove-and-next');
    this.btnKeepInWheel = document.getElementById('btn-keep-in-wheel');

    this.adminModal = document.getElementById('admin-modal');
    this.btnCloseAdmin = document.getElementById('btn-close-admin');
    this.btnNewGameSet = document.getElementById('btn-new-game-set');
    this.btnDuplicateSet = document.getElementById('btn-duplicate-set');
    this.btnExportJson = document.getElementById('btn-export-json');
    this.importJsonFile = document.getElementById('import-json-file');
    this.btnDeleteGameSet = document.getElementById('btn-delete-game-set');
    this.inputSetTitle = document.getElementById('input-set-title');
    this.inputSetDesc = document.getElementById('input-set-desc');
    this.adminSpinDuration = document.getElementById('admin-spin-duration');

    this.formAddQuestion = document.getElementById('form-add-question');
    this.inputQuestionText = document.getElementById('input-question-text');
    this.inputYoutubeUrl = document.getElementById('input-youtube-url');
    this.inputImageUrl = document.getElementById('input-image-url');
    this.inputItemColor = document.getElementById('input-item-color');

    this.adminItemsCount = document.getElementById('admin-items-count');
    this.questionsAdminList = document.getElementById('questions-admin-list');
    this.btnToggleBulkImport = document.getElementById('btn-toggle-bulk-import');
    this.bulkImportContainer = document.getElementById('bulk-import-container');
    this.textareaBulkText = document.getElementById('textarea-bulk-text');
    this.btnSubmitBulk = document.getElementById('btn-submit-bulk');

    this.editQuestionModal = document.getElementById('edit-question-modal');
    this.btnCloseEditQuestion = document.getElementById('btn-close-edit-question');
    this.formEditQuestion = document.getElementById('form-edit-question');
    this.editQuestionId = document.getElementById('edit-question-id');
    this.editQuestionText = document.getElementById('edit-question-text');
    this.editYoutubeUrl = document.getElementById('edit-youtube-url');
    this.editImageUrl = document.getElementById('edit-image-url');
    this.editItemColor = document.getElementById('edit-item-color');
  }

  initWheel() {
    this.wheel = new WheelCanvas(this.canvas, {
      spinDuration: parseInt(this.spinTimeRange.value, 10),
      onSpinStart: () => {
        this.btnSpinMain.disabled = true;
      },
      onSpinEnd: (winningItem) => {
        this.btnSpinMain.disabled = false;
        this.handleSpinWinner(winningItem);
      }
    });
  }

  async loadState() {
    await StorageManager.loadInitialGameSetsAsync();
    this.renderGameSelectOptions();
    this.loadActiveGameSet();
  }

  renderGameSelectOptions() {
    const sets = StorageManager.getGameSets();
    const activeId = StorageManager.getActiveGameId();

    this.gameSelect.innerHTML = sets.map(s => `
      <option value="${s.id}" ${s.id === activeId ? 'selected' : ''}>
        ${s.title} (${s.items ? s.items.length : 0} שאלות)
      </option>
    `).join('');
  }

  loadActiveGameSet() {
    this.activeGameSet = StorageManager.getActiveGameSet();
    if (!this.activeGameSet) return;

    const duration = this.activeGameSet.spinDuration || 6;

    this.activeGameTitle.textContent = this.activeGameSet.title;
    this.inputSetTitle.value = this.activeGameSet.title;
    this.inputSetDesc.value = this.activeGameSet.description || '';
    this.spinTimeRange.value = duration;
    this.adminSpinDuration.value = duration;
    this.spinTimeVal.textContent = `${duration}s`;
    this.wheel.setSpinDuration(parseInt(duration, 10));

    const removedIds = StorageManager.getRemovedItemIds(this.activeGameSet.id);
    const allItems = this.activeGameSet.items || [];
    this.activeItems = allItems.filter(item => !removedIds.includes(item.id) && item.active !== false);

    this.wheel.setItems(this.activeItems);
    this.updateStatsBadge(allItems.length, this.activeItems.length);
    this.renderAdminQuestionsList();
  }

  updateStatsBadge(total, activeCount) {
    if (activeCount === 0) {
      this.questionsCountBadge.textContent = 'כל השאלות הסתיימו!';
      this.questionsCountBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      this.questionsCountBadge.style.color = '#f87171';
    } else {
      this.questionsCountBadge.textContent = `נשארו ${activeCount} מתוך ${total} שאלות`;
      this.questionsCountBadge.style.background = 'rgba(139, 92, 246, 0.2)';
      this.questionsCountBadge.style.color = '#c084fc';
    }
  }

  bindEvents() {
    this.gameSelect.addEventListener('change', (e) => {
      StorageManager.setActiveGameId(e.target.value);
      this.loadActiveGameSet();
    });

    this.btnSpinMain.addEventListener('click', () => this.triggerSpin());
    this.wheelContainer.addEventListener('click', () => this.triggerSpin());

    this.btnResetWheel.addEventListener('click', () => this.resetActiveGameWheel());

    this.btnToggleSound.addEventListener('click', () => {
      soundEngine.enabled = !soundEngine.enabled;
      this.soundIcon.className = soundEngine.enabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill';
      this.btnToggleSound.style.opacity = soundEngine.enabled ? '1' : '0.5';
    });

    this.spinTimeRange.addEventListener('input', (e) => {
      this.updateSpinDuration(parseInt(e.target.value, 10));
    });

    this.adminSpinDuration.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 6;
      this.updateSpinDuration(val);
    });

    this.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    this.btnOpenAdmin.addEventListener('click', () => this.showAdminModal(true));
    this.btnCloseAdmin.addEventListener('click', () => this.showAdminModal(false));

    this.btnNewGameSet.addEventListener('click', () => {
      const name = prompt('הכנס שם למשחק החדש:', 'משחק חדש');
      if (name) {
        const newSet = StorageManager.createNewGameSet(name);
        this.renderGameSelectOptions();
        this.loadActiveGameSet();
      }
    });

    this.btnDuplicateSet.addEventListener('click', () => {
      if (!this.activeGameSet) return;
      const copySet = JSON.parse(JSON.stringify(this.activeGameSet));
      copySet.id = 'game-' + Date.now();
      copySet.title += ' (עותק)';
      StorageManager.saveGameSet(copySet);
      this.renderGameSelectOptions();
      this.loadActiveGameSet();
    });

    this.btnDeleteGameSet.addEventListener('click', () => {
      if (confirm(`האם אתה בטוח שברצונך למחוק את המשחק "${this.activeGameSet.title}"?`)) {
        if (StorageManager.deleteGameSet(this.activeGameSet.id)) {
          this.renderGameSelectOptions();
          this.loadActiveGameSet();
        }
      }
    });

    this.btnExportJson.addEventListener('click', () => StorageManager.exportGameSetsJSON());
    this.importJsonFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (StorageManager.importGameSetsJSON(event.target.result)) {
            alert('המשחקים יובאו בהצלחה!');
            this.renderGameSelectOptions();
            this.loadActiveGameSet();
          } else {
            alert('קובץ JSON לא תקין.');
          }
        };
        reader.readAsText(file);
      }
    });

    this.inputSetTitle.addEventListener('change', () => this.updateGameSetMeta());
    this.inputSetDesc.addEventListener('change', () => this.updateGameSetMeta());

    this.formAddQuestion.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addQuestionFromForm();
    });

    this.btnToggleBulkImport.addEventListener('click', () => {
      this.bulkImportContainer.classList.toggle('hidden');
    });
    this.btnSubmitBulk.addEventListener('click', () => this.handleBulkAdd());

    this.btnCloseEditQuestion.addEventListener('click', () => this.showEditQuestionModal(false));
    this.formEditQuestion.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveQuestionEdit();
    });

    this.btnCloseVictory.addEventListener('click', () => this.showVictoryModal(false));
    this.btnKeepInWheel.addEventListener('click', () => this.showVictoryModal(false));

    this.btnRemoveAndNext.addEventListener('click', () => {
      if (this.currentWinnerItem && this.activeGameSet) {
        StorageManager.addRemovedItemId(this.activeGameSet.id, this.currentWinnerItem.id);
        this.loadActiveGameSet();
      }
      this.showVictoryModal(false);
    });
  }

  updateSpinDuration(val) {
    const clamped = Math.max(3, Math.min(20, val));
    this.spinTimeRange.value = clamped;
    this.adminSpinDuration.value = clamped;
    this.spinTimeVal.textContent = `${clamped}s`;
    this.wheel.setSpinDuration(clamped);
    if (this.activeGameSet) {
      this.activeGameSet.spinDuration = clamped;
      StorageManager.saveGameSet(this.activeGameSet);
    }
  }

  triggerSpin() {
    if (this.activeItems.length === 0) {
      if (confirm('כל השאלות בגלגל הסתיימו! האם לאפס את הגלגל ולהחזיר את כל השאלות?')) {
        this.resetActiveGameWheel();
      }
      return;
    }
    soundEngine.init();
    this.wheel.spin();
  }

  normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';

    const driveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return trimmed;
  }

  handleSpinWinner(winningItem) {
    if (!winningItem) return;
    this.currentWinnerItem = winningItem;

    this.victoryQuestionText.textContent = winningItem.text;

    if (winningItem.youtubeUrl && winningItem.youtubeUrl.trim() !== '') {
      const embedHTML = YouTubeHelper.renderEmbedContainer(winningItem.youtubeUrl);
      if (embedHTML) {
        this.youtubePlayerContainer.innerHTML = embedHTML;
        this.youtubePlayerContainer.style.display = 'block';
      } else {
        this.youtubePlayerContainer.innerHTML = '';
        this.youtubePlayerContainer.style.display = 'none';
      }
    } else {
      this.youtubePlayerContainer.innerHTML = '';
      this.youtubePlayerContainer.style.display = 'none';
    }

    if (winningItem.imageUrl && winningItem.imageUrl.trim() !== '') {
      const directImageUrl = this.normalizeImageUrl(winningItem.imageUrl);
      this.imagePlayerContainer.innerHTML = `<img src="${directImageUrl}" class="victory-image" alt="תמונת שאלה" onerror="this.style.display='none';" />`;
      this.imagePlayerContainer.style.display = 'flex';
    } else {
      this.imagePlayerContainer.innerHTML = '';
      this.imagePlayerContainer.style.display = 'none';
    }

    ConfettiEngine.launch(3500);
    this.showVictoryModal(true);
  }

  showVictoryModal(show) {
    if (show) {
      this.victoryModal.classList.remove('hidden');
    } else {
      this.victoryModal.classList.add('hidden');
      this.youtubePlayerContainer.innerHTML = '';
      this.imagePlayerContainer.innerHTML = '';
      this.imagePlayerContainer.style.display = 'none';
    }
  }

  showAdminModal(show) {
    if (show) {
      this.adminModal.classList.remove('hidden');
    } else {
      this.adminModal.classList.add('hidden');
    }
  }

  showEditQuestionModal(show) {
    if (show) {
      this.editQuestionModal.classList.remove('hidden');
    } else {
      this.editQuestionModal.classList.add('hidden');
    }
  }

  resetActiveGameWheel() {
    if (!this.activeGameSet) return;
    StorageManager.resetRemovedItems(this.activeGameSet.id);
    this.loadActiveGameSet();
  }

  updateGameSetMeta() {
    if (!this.activeGameSet) return;
    this.activeGameSet.title = this.inputSetTitle.value.trim() || 'משחק ללא שם';
    this.activeGameSet.description = this.inputSetDesc.value.trim();
    StorageManager.saveGameSet(this.activeGameSet);
    this.renderGameSelectOptions();
    this.activeGameTitle.textContent = this.activeGameSet.title;
  }

  addQuestionFromForm() {
    if (!this.activeGameSet) return;
    const text = this.inputQuestionText.value.trim();
    if (!text) return;

    const newItem = {
      id: 'item-' + Date.now(),
      text: text,
      color: this.inputItemColor.value,
      youtubeUrl: this.inputYoutubeUrl.value.trim(),
      imageUrl: this.inputImageUrl.value.trim(),
      active: true
    };

    if (!this.activeGameSet.items) this.activeGameSet.items = [];
    this.activeGameSet.items.push(newItem);
    StorageManager.saveGameSet(this.activeGameSet);

    this.inputQuestionText.value = '';
    this.inputYoutubeUrl.value = '';
    this.inputImageUrl.value = '';

    this.loadActiveGameSet();
  }

  handleBulkAdd() {
    if (!this.activeGameSet) return;
    const raw = this.textareaBulkText.value;
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

    if (!this.activeGameSet.items) this.activeGameSet.items = [];

    lines.forEach((lineText, idx) => {
      this.activeGameSet.items.push({
        id: 'item-' + Date.now() + '-' + idx,
        text: lineText,
        color: colors[idx % colors.length],
        youtubeUrl: '',
        imageUrl: '',
        active: true
      });
    });

    StorageManager.saveGameSet(this.activeGameSet);
    this.textareaBulkText.value = '';
    this.bulkImportContainer.classList.add('hidden');
    this.loadActiveGameSet();
  }

  renderAdminQuestionsList() {
    if (!this.activeGameSet || !this.activeGameSet.items) {
      this.questionsAdminList.innerHTML = '<p class="text-muted">אין שאלות במשחק זה.</p>';
      this.adminItemsCount.textContent = '0';
      return;
    }

    const items = this.activeGameSet.items;
    this.adminItemsCount.textContent = items.length;

    this.questionsAdminList.innerHTML = items.map((item, index) => {
      const hasYoutube = item.youtubeUrl && item.youtubeUrl.trim() !== '';
      const hasImage = item.imageUrl && item.imageUrl.trim() !== '';
      return `
        <div class="question-item-row">
          <div class="item-color-dot" style="background: ${item.color || '#3b82f6'};"></div>
          <div class="item-text-content">
            <strong>#${index + 1}</strong> ${this.escapeHTML(item.text)}
          </div>
          ${hasYoutube ? '<span class="item-youtube-badge"><i class="bi-youtube"></i> וידאו</span>' : ''}
          ${hasImage ? '<span class="item-image-badge"><i class="bi-image"></i> תמונה</span>' : ''}
          <div class="item-actions">
            <button class="btn btn-sm btn-outline btn-edit-item" data-id="${item.id}" title="ערוך שאלה">
              <i class="bi-pencil-fill"></i> ערוך
            </button>
            <button class="btn btn-sm btn-danger btn-delete-item" data-id="${item.id}" title="מחק שאלה">
              <i class="bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.questionsAdminList.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditQuestion(id);
      });
    });

    this.questionsAdminList.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.deleteQuestion(id);
      });
    });
  }

  openEditQuestion(itemId) {
    if (!this.activeGameSet || !this.activeGameSet.items) return;
    const item = this.activeGameSet.items.find(i => i.id === itemId);
    if (!item) return;

    this.editQuestionId.value = item.id;
    this.editQuestionText.value = item.text || '';
    this.editYoutubeUrl.value = item.youtubeUrl || '';
    this.editImageUrl.value = item.imageUrl || '';
    this.editItemColor.value = item.color || '#3b82f6';

    this.showEditQuestionModal(true);
  }

  saveQuestionEdit() {
    if (!this.activeGameSet || !this.activeGameSet.items) return;
    const itemId = this.editQuestionId.value;
    const item = this.activeGameSet.items.find(i => i.id === itemId);
    if (!item) return;

    item.text = this.editQuestionText.value.trim();
    item.youtubeUrl = this.editYoutubeUrl.value.trim();
    item.imageUrl = this.editImageUrl.value.trim();
    item.color = this.editItemColor.value;

    StorageManager.saveGameSet(this.activeGameSet);
    this.showEditQuestionModal(false);
    this.loadActiveGameSet();
  }

  deleteQuestion(itemId) {
    if (!this.activeGameSet) return;
    this.activeGameSet.items = this.activeGameSet.items.filter(i => i.id !== itemId);
    StorageManager.saveGameSet(this.activeGameSet);
    this.loadActiveGameSet();
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// התחלת האפליקציה בטעינת העמוד
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
