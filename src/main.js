// לוגיקת האפליקציה הראשית

import { StorageManager } from './storage.js';
import { WheelCanvas } from './wheel.js';
import { YouTubeHelper } from './youtube.js';
import { soundEngine } from './audio.js';
import { ConfettiEngine } from './confetti.js';

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
    // אלמנטים בסרגל עליון
    this.gameSelect = document.getElementById('game-set-select');
    this.btnResetWheel = document.getElementById('btn-reset-wheel');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.soundIcon = document.getElementById('sound-icon');
    this.spinTimeRange = document.getElementById('spin-time-range');
    this.spinTimeVal = document.getElementById('spin-time-val');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnOpenAdmin = document.getElementById('btn-open-admin');

    // אזור משחק
    this.activeGameTitle = document.getElementById('active-game-title');
    this.questionsCountBadge = document.getElementById('questions-count-badge');
    this.wheelContainer = document.getElementById('wheel-container');
    this.canvas = document.getElementById('wheel-canvas');
    this.btnSpinMain = document.getElementById('btn-spin-main');

    // מודאל זכייה
    this.victoryModal = document.getElementById('victory-modal');
    this.btnCloseVictory = document.getElementById('btn-close-victory');
    this.victoryQuestionText = document.getElementById('victory-question-text');
    this.youtubePlayerContainer = document.getElementById('youtube-player-container');
    this.btnRemoveAndNext = document.getElementById('btn-remove-and-next');
    this.btnKeepInWheel = document.getElementById('btn-keep-in-wheel');

    // מודאל ניהול
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

    // טופס הוספת שאלה
    this.formAddQuestion = document.getElementById('form-add-question');
    this.inputQuestionText = document.getElementById('input-question-text');
    this.inputYoutubeUrl = document.getElementById('input-youtube-url');
    this.inputItemColor = document.getElementById('input-item-color');

    // רשימת שאלות בניהול
    this.adminItemsCount = document.getElementById('admin-items-count');
    this.questionsAdminList = document.getElementById('questions-admin-list');
    this.btnToggleBulkImport = document.getElementById('btn-toggle-bulk-import');
    this.bulkImportContainer = document.getElementById('bulk-import-container');
    this.textareaBulkText = document.getElementById('textarea-bulk-text');
    this.btnSubmitBulk = document.getElementById('btn-submit-bulk');

    // מודאל עריכת שאלה
    this.editQuestionModal = document.getElementById('edit-question-modal');
    this.btnCloseEditQuestion = document.getElementById('btn-close-edit-question');
    this.formEditQuestion = document.getElementById('form-edit-question');
    this.editQuestionId = document.getElementById('edit-question-id');
    this.editQuestionText = document.getElementById('edit-question-text');
    this.editYoutubeUrl = document.getElementById('edit-youtube-url');
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

    // הגדרת כותרת ואינדיקטורים
    this.activeGameTitle.textContent = this.activeGameSet.title;
    this.inputSetTitle.value = this.activeGameSet.title;
    this.inputSetDesc.value = this.activeGameSet.description || '';
    this.spinTimeRange.value = duration;
    this.adminSpinDuration.value = duration;
    this.spinTimeVal.textContent = `${duration}s`;
    this.wheel.setSpinDuration(parseInt(duration, 10));

    // סינון שאלות שהוסרו בסיבוב האקטיבי
    const removedIds = StorageManager.getRemovedItemIds(this.activeGameSet.id);
    const allItems = this.activeGameSet.items || [];
    this.activeItems = allItems.filter(item => !removedIds.includes(item.id) && item.active !== false);

    // עדכון הגלגל
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
    // בחירת משחק מסרגל עליון
    this.gameSelect.addEventListener('change', (e) => {
      StorageManager.setActiveGameId(e.target.value);
      this.loadActiveGameSet();
    });

    // כפתור סיבוב
    this.btnSpinMain.addEventListener('click', () => this.triggerSpin());
    this.wheelContainer.addEventListener('click', () => this.triggerSpin());

    // כפתור איפוס גלגל
    this.btnResetWheel.addEventListener('click', () => this.resetActiveGameWheel());

    // בקרת שמע
    this.btnToggleSound.addEventListener('click', () => {
      soundEngine.enabled = !soundEngine.enabled;
      this.soundIcon.className = soundEngine.enabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill';
      this.btnToggleSound.style.opacity = soundEngine.enabled ? '1' : '0.5';
    });

    // זמן סיבוב בסרגל עליון
    this.spinTimeRange.addEventListener('input', (e) => {
      this.updateSpinDuration(parseInt(e.target.value, 10));
    });

    // זמן סיבוב בממשק הניהול (דרישה #1)
    this.adminSpinDuration.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 6;
      this.updateSpinDuration(val);
    });

    // מסך מלא
    this.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // ניהול (Admin Modal)
    this.btnOpenAdmin.addEventListener('click', () => this.showAdminModal(true));
    this.btnCloseAdmin.addEventListener('click', () => this.showAdminModal(false));

    // יצירת סט חדש
    this.btnNewGameSet.addEventListener('click', () => {
      const name = prompt('הכנס שם למשחק החדש:', 'משחק חדש');
      if (name) {
        const newSet = StorageManager.createNewGameSet(name);
        this.renderGameSelectOptions();
        this.loadActiveGameSet();
      }
    });

    // שכפול סט
    this.btnDuplicateSet.addEventListener('click', () => {
      if (!this.activeGameSet) return;
      const copySet = JSON.parse(JSON.stringify(this.activeGameSet));
      copySet.id = 'game-' + Date.now();
      copySet.title += ' (עותק)';
      StorageManager.saveGameSet(copySet);
      this.renderGameSelectOptions();
      this.loadActiveGameSet();
    });

    // מחיקת סט
    this.btnDeleteGameSet.addEventListener('click', () => {
      if (confirm(`האם אתה בטוח שברצונך למחוק את המשחק "${this.activeGameSet.title}"?`)) {
        if (StorageManager.deleteGameSet(this.activeGameSet.id)) {
          this.renderGameSelectOptions();
          this.loadActiveGameSet();
        }
      }
    });

    // יצוא/יבוא JSON
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

    // עדכון כותרת ותיאור המשחק בלייב
    this.inputSetTitle.addEventListener('change', () => this.updateGameSetMeta());
    this.inputSetDesc.addEventListener('change', () => this.updateGameSetMeta());

    // הוספת שאלה בטופס
    this.formAddQuestion.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addQuestionFromForm();
    });

    // יבוא מהיר בבלוק טקסט
    this.btnToggleBulkImport.addEventListener('click', () => {
      this.bulkImportContainer.classList.toggle('hidden');
    });
    this.btnSubmitBulk.addEventListener('click', () => this.handleBulkAdd());

    // מודאל עריכת שאלה קיימת (דרישה #2)
    this.btnCloseEditQuestion.addEventListener('click', () => this.showEditQuestionModal(false));
    this.formEditQuestion.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveQuestionEdit();
    });

    // מודאל זכייה - כפתורי פעולה
    this.btnCloseVictory.addEventListener('click', () => this.showVictoryModal(false));
    this.btnKeepInWheel.addEventListener('click', () => this.showVictoryModal(false));

    // הסרת השאלה שנענתה והמשך לסיבוב הבא
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

  handleSpinWinner(winningItem) {
    if (!winningItem) return;
    this.currentWinnerItem = winningItem;

    // הצגת השאלה במודאל בגדול
    this.victoryQuestionText.textContent = winningItem.text;

    // ניתוח והטמעת נגן YouTube במידה וקיים קישור
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

    // הפעלת חגיגת קונפטי
    ConfettiEngine.launch(3500);

    // פתיחת המודאל
    this.showVictoryModal(true);
  }

  showVictoryModal(show) {
    if (show) {
      this.victoryModal.classList.remove('hidden');
    } else {
      this.victoryModal.classList.add('hidden');
      this.youtubePlayerContainer.innerHTML = '';
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
      active: true
    };

    if (!this.activeGameSet.items) this.activeGameSet.items = [];
    this.activeGameSet.items.push(newItem);
    StorageManager.saveGameSet(this.activeGameSet);

    // איפוס שדות
    this.inputQuestionText.value = '';
    this.inputYoutubeUrl.value = '';

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
      return `
        <div class="question-item-row">
          <div class="item-color-dot" style="background: ${item.color || '#3b82f6'};"></div>
          <div class="item-text-content">
            <strong>#${index + 1}</strong> ${this.escapeHTML(item.text)}
          </div>
          ${hasYoutube ? '<span class="item-youtube-badge"><i class="bi-youtube"></i> וידאו</span>' : ''}
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

    // חיבור אירועי עריכה ומחיקה
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
