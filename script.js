// ============================================
// AURORA PODCAST - ENHANCED SCRIPT
// ============================================

const player = document.getElementById("player");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const nowPlaying = document.getElementById("nowPlaying");
const npTitle = document.getElementById("npTitle");

let currentButton = null;

// Safe element access helper
const getEl = (id) => document.getElementById(id);

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================
const AppStorage = {
  getFavorites: () => JSON.parse(localStorage.getItem('aurora_favorites') || '[]'),
  
  addFavorite: (episode) => {
    const favs = AppStorage.getFavorites();
    if (!favs.find(f => f.file === episode.file)) {
      favs.push(episode);
      localStorage.setItem('aurora_favorites', JSON.stringify(favs));
      showNotification('Added to favorites', 'success');
    }
  },
  
  removeFavorite: (file) => {
    const favs = AppStorage.getFavorites().filter(f => f.file !== file);
    localStorage.setItem('aurora_favorites', JSON.stringify(favs));
    showNotification('Removed from favorites', 'info');
  },
  
  isFavorite: (file) => AppStorage.getFavorites().some(f => f.file === file),
  
  getHistory: () => JSON.parse(localStorage.getItem('aurora_history') || '[]'),
  
  addToHistory: (episode) => {
    let history = AppStorage.getHistory();
    history = history.filter(h => h.file !== episode.file);
    history.unshift(episode);
    history = history.slice(0, 20);
    localStorage.setItem('aurora_history', JSON.stringify(history));
    AppStorage.updateStats();
  },
  
  getReminders: () => JSON.parse(localStorage.getItem('aurora_reminders') || '[]'),
  
  addReminder: (event) => {
    const reminders = AppStorage.getReminders();
    if (!reminders.find(r => r.title === event.title)) {
      reminders.push(event);
      localStorage.setItem('aurora_reminders', JSON.stringify(reminders));
      showNotification(`Reminder set for ${event.title}`, 'success');
    }
  },
  
  removeReminder: (title) => {
    const reminders = AppStorage.getReminders().filter(r => r.title !== title);
    localStorage.setItem('aurora_reminders', JSON.stringify(reminders));
    showNotification('Reminder removed', 'info');
  },
  
  getDownloads: () => JSON.parse(localStorage.getItem('aurora_downloads') || '[]'),
  
  addDownload: (episode) => {
    const downloads = AppStorage.getDownloads();
    if (!downloads.find(d => d.file === episode.file)) {
      downloads.push({...episode, downloadedAt: new Date().toISOString()});
      localStorage.setItem('aurora_downloads', JSON.stringify(downloads));
      showNotification('Download added', 'success');
    }
  },
  
  removeDownload: (file) => {
    const downloads = AppStorage.getDownloads().filter(d => d.file !== file);
    localStorage.setItem('aurora_downloads', JSON.stringify(downloads));
    showNotification('Download removed', 'info');
  },
  
  updateStats: () => {
    const history = AppStorage.getHistory();
    const favorites = AppStorage.getFavorites();
    const listens = history.length;
    const hours = Math.round(listens * 0.3);
    
    const listensEl = document.getElementById('listensCount');
    const favsEl = document.getElementById('favoritesCount');
    const hoursEl = document.getElementById('hoursCount');
    
    if (listensEl) listensEl.textContent = listens;
    if (favsEl) favsEl.textContent = favorites.length;
    if (hoursEl) hoursEl.textContent = hours;
  },
  
  getSettings: () => JSON.parse(localStorage.getItem('aurora_settings') || '{"darkMode": false, "notifications": true, "autoPlay": false}'),
  
  updateSetting: (key, value) => {
    const settings = AppStorage.getSettings();
    settings[key] = value;
    localStorage.setItem('aurora_settings', JSON.stringify(settings));
  }
};

// ============================================
// DARK MODE
// ============================================
function toggleDark() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  AppStorage.updateSetting('darkMode', isDark);
  localStorage.setItem('aurora_dark', isDark);
  showNotification(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
}

// Initialize dark mode from storage
const storedDarkMode = localStorage.getItem('aurora_dark');
if (storedDarkMode === 'true' || AppStorage.getSettings().darkMode) {
  document.body.classList.add('dark');
}

// ============================================
// MENU FUNCTIONS
// ============================================
function toggleMenu() {
  if (drawer) drawer.classList.toggle("open");
  if (overlay) overlay.classList.toggle("active");
}

if (overlay) {
  overlay.addEventListener("click", toggleMenu);
}

// ============================================
// AUDIO PLAYER
// ============================================
function playAudio(file, btn) {
  if (!player) return;
  
  if (currentButton === btn && !player.paused) {
    player.pause();
    btn.innerHTML = "▶";
    btn.classList.remove("playing");
    showNotification('Paused', 'info');
    return;
  }
  
  document.querySelectorAll(".play-btn").forEach(b => {
    b.classList.remove("playing");
    b.innerHTML = "▶";
  });
  
  currentButton = btn;
  player.src = file;
  player.play();
  
  btn.classList.add("playing");
  btn.innerHTML = "⏸";
  
  const title = btn.closest(".episode-item")?.querySelector("h4")?.textContent || 
                btn.closest(".card")?.querySelector("h2")?.textContent || 
                btn.closest(".list-item")?.querySelector("h4")?.textContent ||
                "Audio";
  
  if (npTitle) npTitle.textContent = title;
  if (nowPlaying) nowPlaying.classList.add("show");
  
  AppStorage.addToHistory({ title, file, playedAt: new Date().toISOString() });
  showNotification(`Now playing: ${title}`, 'success');
}

function stopAudio() {
  if (!player) return;
  
  player.pause();
  player.currentTime = 0;
  
  document.querySelectorAll(".play-btn").forEach(b => {
    b.classList.remove("playing");
    b.innerHTML = "▶";
  });
  
  if (nowPlaying) nowPlaying.classList.remove("show");
  currentButton = null;
  showNotification('Stopped', 'info');
}

if (player) {
  player.onended = () => {
    if (currentButton) {
      currentButton.classList.remove("playing");
      currentButton.innerHTML = "▶";
      currentButton = null;
      if (nowPlaying) nowPlaying.classList.remove("show");
      showNotification('Finished playing', 'info');
    }
  };
}

// ============================================
// SUBSCRIBE BUTTON
// ============================================
function subscribe(btn) {
  btn.classList.toggle("subscribed");
  const isSubscribed = btn.classList.contains("subscribed");
  btn.textContent = isSubscribed ? "✓ Subscribed" : "➕ Subscribe";
  showNotification(isSubscribed ? 'Subscribed!' : 'Unsubscribed', isSubscribed ? 'success' : 'info');
}

// ============================================
// PLAYLIST FUNCTIONS
// ============================================
function playPlaylist(name) {
  showNotification(`Playing: ${name} playlist`, 'success');
  if (npTitle) npTitle.textContent = `Playlist: ${name}`;
  if (nowPlaying) nowPlaying.classList.add("show");
}

function addToFavorites(title, file, btn) {
  if (AppStorage.isFavorite(file)) {
    AppStorage.removeFavorite(file);
    btn.textContent = '♡';
    btn.style.color = '';
  } else {
    AppStorage.addFavorite({ title, file });
    btn.textContent = '♥';
    btn.style.color = '#ef4444';
  }
}

// ============================================
// EVENT REMINDERS
// ============================================
function addReminder(btn) {
  const eventItem = btn.closest('.episode-item') || btn.closest('.event-item');
  const title = eventItem?.querySelector('h4')?.textContent || 'Event';
  
  btn.classList.toggle("reminded");
  if (btn.classList.contains("reminded")) {
    btn.innerHTML = "✓";
    AppStorage.addReminder({ title, reminderAt: new Date().toISOString() });
  } else {
    btn.innerHTML = "🔔";
    AppStorage.removeReminder(title);
  }
}

// ============================================
// ALERTS PAGE FUNCTIONS
// ============================================
function filterAlerts(type, element) {
  document.querySelectorAll(".alert-tab").forEach(t => t.classList.remove("active"));
  element.classList.add("active");
  
  document.querySelectorAll(".episode-item, .notif-item").forEach(card => {
    const isUnread = card.classList.contains('unread');
    if (type === "all") {
      card.style.display = "flex";
    } else if (type === "unread" && isUnread) {
      card.style.display = "flex";
    } else if (type === "read" && !isUnread) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

function markAllRead() {
  document.querySelectorAll(".episode-item, .notif-item").forEach(card => {
    card.classList.remove("unread");
  });
  showNotification('All notifications marked as read', 'success');
}

function deleteAlert(btn) {
  const card = btn.closest(".episode-item") || btn.closest(".notif-item");
  if (card) {
    card.style.opacity = "0";
    card.style.transform = "translateX(100px)";
    setTimeout(() => card.remove(), 300);
    showNotification('Notification dismissed', 'info');
  }
}

// ============================================
// DOWNLOADS PAGE FUNCTIONS
// ============================================
function deleteDownload(btn) {
  const card = btn.closest(".list-item");
  if (card) {
    const title = card.querySelector('h4')?.textContent;
    card.style.opacity = "0";
    card.style.transform = "translateX(100px)";
    setTimeout(() => card.remove(), 300);
    showNotification('Download deleted', 'info');
  }
}

function deleteAllDownloads() {
  if (confirm("Delete all downloads?")) {
    document.querySelectorAll(".list-item").forEach(card => {
      card.style.opacity = "0";
      setTimeout(() => card.remove(), 300);
    });
    showNotification('All downloads deleted', 'success');
  }
}

function toggleOfflineMode(checkbox) {
  showNotification(checkbox.checked ? 'Offline mode enabled' : 'Offline mode disabled', 'info');
}

// ============================================
// SETTINGS FUNCTIONS
// ============================================
function toggleSetting(element) {
  const toggle = element.querySelector(".setting-toggle");
  toggle.classList.toggle("on");
  toggle.textContent = toggle.classList.contains("on") ? "✓" : "✕";
  showNotification('Setting updated', 'success');
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function initSearch() {
  const searchInput = document.querySelector('.search-box input');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.episode-item, .event-item, .list-item');
    
    items.forEach(item => {
      const title = item.querySelector('h4')?.textContent?.toLowerCase() || '';
      const desc = item.querySelector('p')?.textContent?.toLowerCase() || '';
      
      if (title.includes(query) || desc.includes(query)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// ============================================
// CATEGORY FILTERING
// ============================================
document.querySelectorAll(".cat").forEach(cat => {
  cat.addEventListener("click", function() {
    document.querySelectorAll(".cat").forEach(c => c.classList.remove("active"));
    this.classList.add("active");
    
    const category = this.dataset.category || this.textContent.toLowerCase();
    const items = document.querySelectorAll('.episode-item');
    
    items.forEach(item => {
      const icon = item.querySelector('.episode-icon')?.textContent || '';
      if (category === 'all' || category.includes('new')) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'flex';
      }
    });
  });
});

// ============================================
// BOTTOM NAV TAB SWITCHING
// ============================================
function switchTab(tabName, element) {
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  element.classList.add("active");
  
  switch(tabName) {
    case "home":
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    case "notifications":
      window.scrollTo({ top: 200, behavior: "smooth" });
      break;
    case "events":
      window.scrollTo({ top: 200, behavior: "smooth" });
      break;
  }
  
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// ============================================
// HAPTIC FEEDBACK
// ============================================
if (navigator.vibrate) {
  document.querySelectorAll(".play-btn, .subscribe-btn, .listen-live-btn").forEach(btn => {
    btn.addEventListener("click", () => navigator.vibrate(10));
  });
}

// ============================================
// PROGRESS BAR ANIMATION
// ============================================
function initProgressBars() {
  document.querySelectorAll('.play-btn.playing').forEach(btn => {
    btn.style.animation = 'none';
    setTimeout(() => {
      btn.style.animation = 'pulse 1s infinite';
    }, 10);
  });
}

// ============================================
// SHARE FUNCTIONALITY
// ============================================
function shareContent(title, url) {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url || window.location.href
    }).then(() => showNotification('Shared!', 'success'))
      .catch(() => showNotification('Share cancelled', 'info'));
  } else {
    navigator.clipboard.writeText(url || window.location.href);
    showNotification('Link copied!', 'success');
  }
}

// ============================================
// REFRESH DATA ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  AppStorage.updateStats();
  
  // Check for reminders
  const reminders = AppStorage.getReminders();
  if (reminders.length > 0) {
    showNotification(`${reminders.length} active reminders`, 'info');
  }
});

console.log("Aurora Podcast v2.0 Loaded - Enhanced Edition");
