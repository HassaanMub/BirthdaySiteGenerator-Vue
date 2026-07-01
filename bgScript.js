const { createApp, ref, reactive, computed, onMounted } = Vue;

/* ============================================================
   THEME DEFINITIONS
   ============================================================ */
const THEMES = {
  pink: { name: 'Pink', emoji: '🌸', bg: '#fff0f5', surface: '#ffffff', text: '#4a2c3a', accent: '#e84393', accent2: '#fd79a8' },
  blue: { name: 'Blue', emoji: '💙', bg: '#eef5ff', surface: '#ffffff', text: '#1e3a5f', accent: '#0984e3', accent2: '#74b9ff' },
  purple: { name: 'Purple', emoji: '🟣', bg: '#f5f0ff', surface: '#ffffff', text: '#3a2c4a', accent: '#6c5ce7', accent2: '#a29bfe' },
  dark: { name: 'Dark', emoji: '🌙', bg: '#1a1a2e', surface: '#16213e', text: '#e0e0e0', accent: '#e94560', accent2: '#533483' },
  light: { name: 'Light', emoji: '☀️', bg: '#fafafa', surface: '#ffffff', text: '#2c2c2c', accent: '#00b894', accent2: '#55efc4' },
  rainbow: { name: 'Rainbow', emoji: '🌈', bg: '#1a1a2e', surface: '#16213e', text: '#ffffff', accent: '#e84393', accent2: '#fdcb6e' },
  gold: { name: 'Gold', emoji: '✨', bg: '#1a1a1a', surface: '#2c2c2c', text: '#f5d061', accent: '#d4af37', accent2: '#ffd700' },
  red: { name: 'Red', emoji: '❤️', bg: '#fff0f0', surface: '#ffffff', text: '#5a1a1a', accent: '#e74c3c', accent2: '#ff7675' },
  green: { name: 'Green', emoji: '💚', bg: '#f0faf0', surface: '#ffffff', text: '#1a3a1a', accent: '#27ae60', accent2: '#55efc4' },
};

/* ============================================================
   TEMPLATE DEFINITIONS
   ============================================================ */
const TEMPLATES = {
  cute: { id: 'cute', name: 'Cute', emoji: '🎈', description: 'Pastel, rounded, playful', supportedThemes: ['pink', 'blue', 'purple', 'light', 'red', 'green'] },
  elegant: { id: 'elegant', name: 'Elegant', emoji: '🥂', description: 'Minimal, white, gold, premium', supportedThemes: ['gold', 'light', 'dark', 'purple'] },
  gaming: { id: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Dark mode, neon, pixel', supportedThemes: ['dark', 'purple', 'rainbow', 'blue'] },
};

/* ============================================================
   INDEXEDDB SERVICE
   ============================================================ */
const DB_NAME = 'BirthdayGeneratorDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

const dbService = {
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
      req.onerror = (e) => reject(e.target.error);
    });
  },

  _tx(mode) {
    return this.db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  },

  create(project) {
    return new Promise((resolve, reject) => {
      const req = this._tx('readwrite').add(project);
      req.onsuccess = () => resolve(project);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  read(id) {
    return new Promise((resolve, reject) => {
      const req = this._tx('readonly').get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  readAll() {
    return new Promise((resolve, reject) => {
      const req = this._tx('readonly').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  update(project) {
    return new Promise((resolve, reject) => {
      const req = this._tx('readwrite').put(project);
      req.onsuccess = () => resolve(project);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  remove(id) {
    return new Promise((resolve, reject) => {
      const req = this._tx('readwrite').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },

  clear() {
    return new Promise((resolve, reject) => {
      const req = this._tx('readwrite').clear();
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },
};

/* ============================================================
   EXPORT SERVICE - generates static HTML/CSS/JS
   ============================================================ */
const exportService = {

  generateHTML(project, theme, template) {
    const imgTag = project.image
      ? `<img src="assets/images/photo.jpg" alt="${project.name}" class="hero-image">`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Happy Birthday ${project.name}!</title>
<link rel="stylesheet" href="style.css">
</head>
<body class="template-${template.id} theme-${project.theme}">
<div class="confetti-layer" id="confettiLayer"></div>
<div class="container">
  ${imgTag}
  <h1 class="birthday-name">${project.name}</h1>
  <p class="birthday-date">${project.birthdayDate || ''}</p>
  <div class="message-box">
    <p class="birthday-message">${project.message || 'Wishing you the happiest of birthdays!'}</p>
  </div>
  <div class="decorations">
    <span class="deco">🎈</span><span class="deco">🎂</span><span class="deco">🎉</span>
  </div>
</div>
<script src="script.js"><\/script>
</body>
</html>`;
  },

  generateCSS(project, theme, template) {
    const t = theme;
    const tpl = template.id;

    // Shared base styles
    let css = `
:root {
  --bg: ${t.bg};
  --surface: ${t.surface};
  --text: ${t.text};
  --accent: ${t.accent};
  --accent2: ${t.accent2};
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: var(--font, 'Segoe UI', sans-serif);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
}
.container {
  text-align: center;
  padding: 40px 24px;
  max-width: 600px;
  width: 100%;
  z-index: 2;
  position: relative;
}
.hero-image {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 24px;
  border: 5px solid var(--accent);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.birthday-name {
  font-size: 2.8rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.birthday-date { font-size: 1.1rem; opacity: 0.7; margin-bottom: 24px; }
.message-box {
  background: var(--surface);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.birthday-message { font-size: 1.15rem; line-height: 1.7; }
.decorations { font-size: 2rem; display: flex; gap: 16px; justify-content: center; }
.deco { animation: bounce 1.5s ease infinite; }
.deco:nth-child(2) { animation-delay: 0.3s; }
.deco:nth-child(3) { animation-delay: 0.6s; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.confetti-layer {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 1; overflow: hidden;
}
.confetti-piece {
  position: absolute; width: 10px; height: 10px; opacity: 0.8;
  animation: confettiFall linear forwards;
}
@keyframes confettiFall {
  to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
`;

    // Template-specific overrides
    if (tpl === 'cute') {
      css += `
body { font-family: 'Comic Sans MS', 'Chalkboard SE', cursive; --font: 'Comic Sans MS'; }
.hero-image { border-radius: 30px; border: 5px dashed var(--accent); }
.message-box { border: 3px dashed var(--accent2); border-radius: 24px; }
.birthday-name { font-size: 3rem; }
.decorations { font-size: 2.5rem; }
.container::before {
  content: '🎁'; position: absolute; top: 10px; left: 20px; font-size: 2rem; opacity: 0.3;
}
.container::after {
  content: '🎀'; position: absolute; bottom: 10px; right: 20px; font-size: 2rem; opacity: 0.3;
}
`;
    } else if (tpl === 'elegant') {
      css += `
body { font-family: 'Georgia', 'Times New Roman', serif; --font: 'Georgia'; letter-spacing: 0.02em; }
.birthday-name {
  font-size: 2.4rem; font-weight: 400;
  -webkit-text-fill-color: var(--accent);
  background: none;
}
.hero-image { border-radius: 4px; border: 2px solid var(--accent); width: 200px; height: 200px; }
.message-box {
  border-radius: 4px; padding: 40px 32px;
  border: 1px solid rgba(212,175,55,0.3);
  background: var(--surface);
}
.birthday-message { font-size: 1.05rem; font-style: italic; }
.decorations { display: none; }
.birthday-date { text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.9rem; }
.container { padding: 60px 24px; }
`;
    } else if (tpl === 'gaming') {
      css += `
body {
  font-family: 'Courier New', monospace; --font: 'Courier New';
  background: var(--bg);
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}
.birthday-name {
  font-size: 3rem; text-transform: uppercase;
  text-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent2);
  -webkit-text-fill-color: var(--accent);
  background: none;
  letter-spacing: 0.1em;
}
.hero-image {
  border-radius: 0; border: 4px solid var(--accent);
  box-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent2);
  image-rendering: pixelated;
}
.message-box {
  border: 2px solid var(--accent); border-radius: 0;
  background: rgba(0,0,0,0.3); box-shadow: 0 0 15px var(--accent);
}
.birthday-message { font-size: 1.1rem; text-shadow: 0 0 10px var(--accent2); }
.decorations { font-size: 1.8rem; }
.deco { filter: drop-shadow(0 0 8px var(--accent)); }
.birthday-date { color: var(--accent2); text-transform: uppercase; letter-spacing: 0.15em; }
`;
    }

    // Rainbow theme special: animated gradient background
    if (project.theme === 'rainbow') {
      css += `
body {
  background: linear-gradient(270deg, #e84393, #fdcb6e, #55efc4, #74b9ff, #a29bfe, #e84393);
  background-size: 1200% 1200%;
  animation: rainbowShift 8s ease infinite;
}
@keyframes rainbowShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
    }

    return css;
  },

  generateJS(project, template) {
    let js = `
// Birthday Website - Auto-generated script
document.addEventListener("DOMContentLoaded", () => {
    const colors = [ "#e84393", "#fdcb6e", "#55efc4", "#74b9ff", "#a29bfe", "#fd79a8", "#d4af37" ];
    const layer = document.getElementById("confettiLayer");
    if (!layer) return;
    function spawnConfetti(count) {
        for (let i = 0; i < count; i++) {
            const piece = document.createElement("div");
            piece.className = "confetti-piece";
            piece.style.left = Math.random() * 100 + "%";
            piece.style.top = "-20px";
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = (2 + Math.random() * 3) + "s";
            piece.style.animationDelay = (Math.random() * 2) + "s";
            const size = 6 + Math.random() * 8;
            piece.style.width = size + "px";
            piece.style.height = size + "px";
            piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
            layer.appendChild(piece);
            setTimeout(() => { piece.remove(); }, 6000);
        }
    }
    spawnConfetti(50);
    setInterval(() => { spawnConfetti(20); }, 3000);
});
`;
    if (template.id === "gaming") {
      js += `
document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const layer = document.getElementById("confettiLayer");
    if (!layer) return;
    const colors = [ "#e94560", "#533483", "#f5d061", "#e84393" ];
    for (let i = 0; i < 30; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (1.5 + Math.random() * 2) + "s";
        const size = 8 + Math.random() * 10;
        piece.style.width = size + "px";
        piece.style.height = size + "px";
        layer.appendChild(piece);
        setTimeout(() => { piece.remove(); }, 4000);
    }
});
`;
    }
    return js;
  },

  async exportZIP(project) {
    const theme = THEMES[project.theme] || THEMES.pink;
    const template = TEMPLATES[project.template] || TEMPLATES.cute;

    const html = this.generateHTML(project, theme, template);
    const css = this.generateCSS(project, theme, template);
    const js = this.generateJS(project, template);

    const zip = new JSZip();
    zip.file('index.html', html);
    zip.file('style.css', css);
    zip.file('script.js', js);

    // Add image if exists
    if (project.image) {
      const base64Data = project.image.split(',')[1] || project.image;
      const ext = project.image.includes('image/png') ? 'png' : 'jpg';
      zip.folder('assets').folder('images').file('photo.' + ext, base64Data, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'BirthdayProject.zip');
    return true;
  },
};

/* ============================================================
   VUE APP
   ============================================================ */
createApp({
  setup() {
    const currentView = ref('dashboard');
    const projects = ref([]);
    const loading = ref(false);
    const loadingText = ref('');
    const toasts = ref([]);
    const showDeleteModal = ref(false);
    const deleteTarget = ref(null);
    const editingId = ref(null);
    const isDirty = ref(false);
    const previewProjectData = ref(null);

    const form = reactive({
      name: '', birthdayDate: '', message: '', theme: 'pink',
      template: 'cute', image: null,
    });

    const themes = Object.entries(THEMES).map(([id, t]) => ({ id, ...t }));
    const templates = Object.values(TEMPLATES);

    /* ---- Toast ---- */
    function showToast(message, type = 'info') {
      const icons = { success: '✅', error: '❌', info: '💡' };
      const id = Date.now() + Math.random();
      toasts.value.push({ id, message, type, icon: icons[type] || '💡' });
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
      }, 3000);
    }

    /* ---- Date helpers ---- */
    function formatDate(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function uid() {
      return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    /* ---- Load projects ---- */
    async function loadProjects() {
      loading.value = true; loadingText.value = 'Loading projects...';
      try {
        projects.value = await dbService.readAll();
        projects.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      } catch (e) {
        showToast('Failed to load projects', 'error');
      } finally {
        loading.value = false;
      }
    }

    /* ---- Navigation ---- */
    function goDashboard() {
      if (isDirty.value && currentView.value === 'editor') {
        if (!confirm('You have unsaved changes. Leave anyway?')) return;
      }
      currentView.value = 'dashboard';
      isDirty.value = false;
      loadProjects();
    }

    function newProject() {
      editingId.value = null;
      form.name = ''; form.birthdayDate = ''; form.message = '';
      form.theme = 'pink'; form.template = 'cute'; form.image = null;
      isDirty.value = false;
      currentView.value = 'editor';
    }

    async function openProject(id) {
      loading.value = true; loadingText.value = 'Opening project...';
      const p = await dbService.read(id);
      loading.value = false;
      if (!p) { showToast('Project not found', 'error'); return; }
      editingId.value = id;
      form.name = p.name; form.birthdayDate = p.birthdayDate;
      form.message = p.message; form.theme = p.theme;
      form.template = p.template; form.image = p.image;
      isDirty.value = false;
      currentView.value = 'editor';
    }

    async function previewProject(id) {
      loading.value = true; loadingText.value = 'Loading preview...';
      const p = await dbService.read(id);
      loading.value = false;
      if (!p) { showToast('Project not found', 'error'); return; }
      previewProjectData.value = p;
      currentView.value = 'preview';
    }

    function previewFromEditor() {
      previewProjectData.value = {
        id: editingId.value || 'draft',
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      currentView.value = 'preview';
    }

    function editFromPreview() {
      if (previewProjectData.value && previewProjectData.value.id !== 'draft') {
        openProject(previewProjectData.value.id);
      } else {
        currentView.value = 'editor';
      }
    }

    /* ---- Selectors ---- */
    function selectTheme(id) { form.theme = id; markDirty(); }
    function selectTemplate(id) { form.template = id; markDirty(); }
    function markDirty() { isDirty.value = true; }

    /* ---- Image upload ---- */
    function handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large (max 2MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => { form.image = ev.target.result; markDirty(); };
      reader.readAsDataURL(file);
      e.target.value = '';
    }

    function removeImage() { form.image = null; markDirty(); }

    /* ---- Save ---- */
    async function saveProject() {
      if (!form.name.trim()) {
        showToast('Please enter a name', 'error');
        return;
      }
      loading.value = true; loadingText.value = 'Saving project...';

      const now = new Date().toISOString();

      if (editingId.value) {
        const existing = await dbService.read(editingId.value);
        const updated = {
          ...existing,
          name: form.name, birthdayDate: form.birthdayDate, message: form.message,
          theme: form.theme, template: form.template, image: form.image,
          updatedAt: now,
        };
        await dbService.update(updated);
        showToast('Project saved!', 'success');
      } else {
        const project = {
          id: uid(),
          name: form.name, birthdayDate: form.birthdayDate, message: form.message,
          theme: form.theme, template: form.template, image: form.image,
          createdAt: now, updatedAt: now,
        };
        await dbService.create(project);
        editingId.value = project.id;
        showToast('Project created!', 'success');
      }

      isDirty.value = false;
      loading.value = false;
      await loadProjects();
    }

    async function saveAndExport() {
      await saveProject();
      if (editingId.value) {
        await exportProject(editingId.value);
      }
    }

    /* ---- Export ---- */
    async function exportProject(id) {
      loading.value = true; loadingText.value = 'Generating ZIP...';
      try {
        let project;
        if (id === 'draft' || !id) {
          project = { ...form, id: 'draft' };
        } else {
          project = await dbService.read(id);
        }
        if (!project) { showToast('Project not found', 'error'); loading.value = false; return; }
        await exportService.exportZIP(project);
        showToast('Exported successfully! Check your downloads.', 'success');
      } catch (e) {
        showToast('Export failed: ' + e.message, 'error');
      } finally {
        loading.value = false;
      }
    }

    /* ---- Delete ---- */
    function confirmDelete(project) {
      deleteTarget.value = project;
      showDeleteModal.value = true;
    }

    async function deleteProject() {
      if (!deleteTarget.value) return;
      loading.value = true; loadingText.value = 'Deleting...';
      try {
        await dbService.remove(deleteTarget.value.id);
        showToast('Project deleted', 'success');
        showDeleteModal.value = false;
        deleteTarget.value = null;
        await loadProjects();
      } catch (e) {
        showToast('Delete failed', 'error');
      } finally {
        loading.value = false;
      }
    }

    /* ---- Live Preview HTML (for editor iframe) ---- */
    const livePreviewHtml = computed(() => {
      const draftProject = {
        ...form,
        id: 'live',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const theme = THEMES[form.theme] || THEMES.pink;
      const template = TEMPLATES[form.template] || TEMPLATES.cute;
      const html = exportService.generateHTML(draftProject, theme, template);
      const css = exportService.generateCSS(draftProject, theme, template);
      const js = exportService.generateJS(draftProject, template);

      // Inline everything for live preview (no external files)
      let combined = html
        .replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
        .replace('<script src="script.js"><\/script>', '<script>' + js + '<\/script>');

      // Replace image path with base64 data for live preview
      if (form.image) {
        combined = combined.replace('src="assets/images/photo.jpg"', 'src="' + form.image + '"');
      }

      return combined;
    });

    /* ---- Preview page HTML ---- */
    const previewHtml = computed(() => {
      if (!previewProjectData.value) return '';
      const p = previewProjectData.value;
      const theme = THEMES[p.theme] || THEMES.pink;
      const template = TEMPLATES[p.template] || TEMPLATES.cute;
      const html = exportService.generateHTML(p, theme, template);
      const css = exportService.generateCSS(p, theme, template);
      const js = exportService.generateJS(p, template);

      let combined = html
        .replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
        .replace('<script src="script.js"><\/script>', '<script>' + js + '<\/script>');

      if (p.image) {
        combined = combined.replace('src="assets/images/photo.jpg"', 'src="' + p.image + '"');
      }

      return combined;
    });

    /* ---- Init ---- */
    onMounted(async () => {
      try {
        await dbService.init();
        await loadProjects();
      } catch (e) {
        showToast('Failed to initialize database', 'error');
      }
    });

    return {
      currentView, projects, loading, loadingText, toasts,
      showDeleteModal, deleteTarget, editingId, isDirty,
      previewProjectData, form, themes, templates,
      livePreviewHtml, previewHtml,
      goDashboard, newProject, openProject, previewProject,
      previewFromEditor, editFromPreview,
      selectTheme, selectTemplate, markDirty,
      handleImageUpload, removeImage,
      saveProject, saveAndExport, exportProject,
      confirmDelete, deleteProject, formatDate,
    };
  }
}).mount('#app');