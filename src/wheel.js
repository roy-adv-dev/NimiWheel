// מנוע הפיזיקה והקנבס של גלגל השאלות

import { soundEngine } from './audio.js';

export class WheelCanvas {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.items = [];
    this.currentAngle = 0; // ברדיאנים
    this.isSpinning = false;
    this.spinDuration = options.spinDuration || 6; // שניות
    this.onSpinEnd = options.onSpinEnd || null;
    this.onSpinStart = options.onSpinStart || null;

    this.pointerAngle = (3 * Math.PI) / 2; // המחוג מצביע כלפי מטה מלמעלה (270 מעלות)
    this.lastPassedSegmentIndex = -1;
    this.pointerBounce = 0;

    // התאמת גודל קנבס לרזולוציית המסך (High-DPI / Retina)
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
    const size = Math.min(rect.width, rect.height, 560);
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.scale(dpr, dpr);
    this.displaySize = size;
    this.draw();
  }

  /**
   * מקצר טקסט ארוך עבור תצוגת הגזרה בגלגל (עד כ-22 תווים + ...)
   */
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

    // 1. ציור גזרות הגלגל
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const item = this.items[i];

      // גזרה
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = item.color || this.getDefaultColor(i);
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // 2. ציור טקסט בתוך הגזרה
      ctx.save();
      const textAngle = startAngle + sliceAngle / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      // הגדרת גודל גופן מותאם למספר הגזרות
      const fontSize = Math.max(12, Math.min(18, 260 / Math.sqrt(numSlices)));
      ctx.font = `600 ${fontSize}px "Heebo", "Outfit", sans-serif`;

      // הוספת הצללה רכה לטקסט
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      const shortText = this.truncateText(item.text, numSlices > 10 ? 16 : 24);
      ctx.fillText(shortText, radius - 28, 0);

      ctx.restore();
    }

    // מעגל מרכזי מעוצב
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // טקסט "סובב" במרכז
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Heebo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('סובב!', 0, 0);

    ctx.restore();

    // 3. ציור המחוג העליון
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

    // הצללה למחוג
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // גוף המחוג (משולש זהב/אדום בוהק)
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

    // בורג המחוג
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

    // 5 עד 10 סיבובים מלאים + זווית אקראית
    const extraRounds = Math.floor(Math.random() * 5) + 5;
    const randomAngle = Math.random() * Math.PI * 2;
    const totalRotation = extraRounds * Math.PI * 2 + randomAngle;

    const numSlices = this.items.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // פונקציית תאוטה Quintic Ease-Out (סיבוב מהיר בהתחלה והאטה רכה)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      this.currentAngle = startAngle + totalRotation * easeOut;

      // בדיקת מעבר גזרות לצורך השמעת תקתוק
      const currentNorm = (this.currentAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      // מחוג עליון: זווית 270 מעלות
      const relativeAngle = (this.pointerAngle - currentNorm + Math.PI * 2) % (Math.PI * 2);
      const currentSegmentIndex = Math.floor(relativeAngle / sliceAngle);

      if (currentSegmentIndex !== this.lastPassedSegmentIndex && this.lastPassedSegmentIndex !== -1) {
        const velocityRatio = 1 - progress;
        soundEngine.playTick(velocityRatio);
        this.pointerBounce = -6; // אפקט קפיץ במחוג
      }
      this.lastPassedSegmentIndex = currentSegmentIndex;
      this.pointerBounce *= 0.85; // דעיכת הקפיץ

      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.pointerBounce = 0;
        this.draw();

        // חישוב הפריט המנצח
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
