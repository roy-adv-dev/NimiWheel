// מודול אחסון מקומי וניהול סטים של משחקים ב-LocalStorage

import { PRESET_GAME_SETS } from './presets.js';

const STORAGE_KEY_GAMES = 'wheel_game_sets_v1';
const STORAGE_KEY_ACTIVE_ID = 'wheel_active_game_id_v1';
const STORAGE_KEY_REMOVED_PREFIX = 'wheel_removed_items_v1_';

export class StorageManager {
  static getGameSets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GAMES);
      if (!raw) {
        // ראשוני: שמירת התבניות ב-LocalStorage
        this.saveGameSets(PRESET_GAME_SETS);
        return [...PRESET_GAME_SETS];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...PRESET_GAME_SETS];
    } catch (e) {
      console.error('Error loading game sets:', e);
      return [...PRESET_GAME_SETS];
    }
  }

  static saveGameSets(sets) {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(sets));
    } catch (e) {
      console.error('Error saving game sets:', e);
    }
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
        { id: 'item-' + Date.now() + '-1', text: 'שאלה ראשונה למשחק', color: '#ec4899', youtubeUrl: '', active: true },
        { id: 'item-' + Date.now() + '-2', text: 'שאלה שנייה למשחק', color: '#3b82f6', youtubeUrl: '', active: true },
        { id: 'item-' + Date.now() + '-3', text: 'שאלה שלישית למשחק', color: '#10b981', youtubeUrl: '', active: true }
      ]
    };
    this.saveGameSet(newSet);
    return newSet;
  }

  // --- ניהול פריטים שנענו/הוסרו מהגלגל בסיבוב אקטיבי ---

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

  // --- יבוא ויצוא בפורמט JSON ---

  static exportGameSetsJSON() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      gameSets: this.getGameSets()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wheel-games-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importGameSetsJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.gameSets && Array.isArray(parsed.gameSets)) {
        this.saveGameSets(parsed.gameSets);
        if (parsed.gameSets[0]?.id) {
          this.setActiveGameId(parsed.gameSets[0].id);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing JSON:', e);
      return false;
    }
  }
}
