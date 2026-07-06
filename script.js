const { createApp, ref, reactive, computed, watch, onMounted } = Vue;
/* ============================================================
   THEME DEFINITIONS
   Themes are plain JS objects. Their values replace the
   - {{PRIMARY}}
   - {{SECONDARY}}
   - {{BACKGROUND}}
   - {{SURFACE}}
   - {{TEXT}}
   - {{ACCENT}}
   - {{GLOW}} 
   placeholders inside templates. */
const THEMES = {
  // palette (see TEMPLATE_DEFAULT_COLORS) instead of a fixed color set.
  original: { name: 'Default Template Colors', emoji: '🎨', primary: '#ff5d73', secondary: '#ff8e72', accent: '#ffd166', background: '#ff6b81', surface: '#ffffff', text: '#333333' },
  pink: { name: 'Pink', emoji: '🌸', primary: '#e84393', secondary: '#fd79a8', accent: '#fdcb6e', background: '#fff0f5', surface: '#ffffff', text: '#4a2c3a' },
  blue: { name: 'Blue', emoji: '💙', primary: '#0984e3', secondary: '#74b9ff', accent: '#55efc4', background: '#eef5ff', surface: '#ffffff', text: '#1e3a5f' },
  purple: { name: 'Purple', emoji: '🟣', primary: '#6c5ce7', secondary: '#a29bfe', accent: '#fd79a8', background: '#f5f0ff', surface: '#ffffff', text: '#3a2c4a' },
  dark: { name: 'Dark', emoji: '🌙', primary: '#e94560', secondary: '#533483', accent: '#f5d061', background: '#1a1a2e', surface: '#16213e', text: '#e0e0e0' },
  light: { name: 'Light', emoji: '☀️', primary: '#00b894', secondary: '#55efc4', accent: '#74b9ff', background: '#fafafa', surface: '#ffffff', text: '#2c2c2c' },
  rainbow: { name: 'Rainbow', emoji: '🌈', primary: '#e84393', secondary: '#fdcb6e', accent: '#55efc4', background: '#1a1a2e', surface: '#16213e', text: '#ffffff' },
  gold: { name: 'Gold', emoji: '✨', primary: '#d4af37', secondary: '#ffd700', accent: '#f5f6fa', background: '#1a1a1a', surface: '#2c2c2c', text: '#f5d061' },
  red: { name: 'Red', emoji: '❤️', primary: '#e74c3c', secondary: '#ff7675', accent: '#fdcb6e', background: '#fff0f0', surface: '#ffffff', text: '#5a1a1a' },
  green: { name: 'Green', emoji: '💚', primary: '#27ae60', secondary: '#55efc4', accent: '#fdcb6e', background: '#f0faf0', surface: '#ffffff', text: '#1a3a1a' },
};
/* ============================================================
   TEMPLATE DEFINITIONS
   Each id maps to a self-contained file:
   templates/<id>/<id>.html  (CSS + JS live inside the HTML).
   To add a new template: create the folder + file, then
   register it here. Nothing else needs to change. */
const TEMPLATES = {
  default: { id: 'default', name: 'Default', emoji: '🎈', description: 'Warm, playful, classic card', supportedThemes: ['pink', 'blue', 'purple', 'light', 'red', 'green'] },
  glassy: { id: 'glassy', name: 'Glassy', emoji: '🫧', description: 'Frosted glass, bubbles, ambient light', supportedThemes: ['blue', 'purple', 'dark', 'light'] },
  gaming: { id: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Dark mode, neon, pixel', supportedThemes: ['dark', 'purple', 'rainbow', 'blue'] },
  romantic: { id: 'romantic', name: 'Romantic', emoji: '💌', description: 'Storybook with a click-to-open cover', supportedThemes: ['pink', 'red', 'purple', 'light'] },
};

const DEFAULT_TEMPLATE_ID = 'default';
const DEFAULT_THEME_ID = 'pink';

// shown when a project has no uploaded photo
const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const templateService = {
  resolveId(templateId) {
    if (TEMPLATES[templateId]) return templateId;
    if (LEGACY_TEMPLATES[templateId]) return LEGACY_TEMPLATES[templateId];
    return DEFAULT_TEMPLATE_ID;
  },
  // Always fetched fresh so edits to template files show up
  // on the next preview/export without restarting the app.
  async load(templateId) {
    const id = this.resolveId(templateId);
    const url = 'templates/' + id + '/' + id + '.html';
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      throw new Error('Could not fetch "' + url + '". Run the app from a local web server (e.g. VS Code Live Server) — template files cannot be loaded over file://');
    }
    if (!res.ok) throw new Error('Template file missing: ' + url + ' (HTTP ' + res.status + ')');
    return res.text();
  },
};
/* ============================================================
   ORIGINAL TEMPLATE PALETTES
   The exact colors each template shipped with before its :root
   was tokenized — used by the "Default Template Colors" theme. */
const TEMPLATE_DEFAULT_COLORS = {
  default: { primary: '#ff5d73', secondary: '#ff8e72', accent: '#ffd166', background: '#ff6b81', surface: '#ffffff', text: '#333333' },
  glassy: { primary: '#5cc8ff', secondary: '#9ee8ff', accent: '#9ee8ff', background: '#0f1626', surface: '#ffffff', text: '#ffffff' },
  gaming: { primary: '#a855f7', secondary: '#f472b6', accent: '#22d3ee', background: '#0b0518', surface: '#1e0f3c', text: '#f3f0ff' },
  romantic: { primary: '#e63956', secondary: '#f7a8bc', accent: '#f7a8bc', background: '#ffe8ee', surface: '#ffffff', text: '#5c3a45', glow: '#ff3c5f' },
};

/*
 * The "original" theme is template-dependent, so every theme lookup
 * goes through here with the project's template id.
 */
function resolveTheme(themeId, templateId) {
  if (themeId === 'original') {
    const id = templateService.resolveId(templateId);
    return TEMPLATE_DEFAULT_COLORS[id] || TEMPLATE_DEFAULT_COLORS.default;
  }
  return THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
}
// Date Format
function formatBirthdayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Replaces every {{PLACEHOLDER}} (spaces inside braces allowed) in a
 * template with project data and theme colors. Unknown placeholders
 * are left untouched so template authors can spot typos.
 *
 * options.imageSrc overrides what {{IMAGE}} becomes:
 *   preview → base64 data URL, export → "assets/images/photo.png"
 */
function replacePlaceholders(content, project, theme, options = {}) {
  const imageSrc = options.imageSrc !== undefined && options.imageSrc !== null && options.imageSrc !== '' ? options.imageSrc : (project.image || PLACEHOLDER_IMAGE);
  const values = {
    NAME: project.name || '',
    MESSAGE: project.message || 'Wishing you the Happiest Birthday!',
    DATE: formatBirthdayDate(project.birthdayDate),
    TITLE: 'Happy Birthday ' + (project.name || '') + '!',
    IMAGE: imageSrc,
    PRIMARY: theme.primary,
    SECONDARY: theme.secondary,
    BACKGROUND: theme.background,
    SURFACE: theme.surface,
    TEXT: theme.text,
    ACCENT: theme.accent || theme.secondary,
    GLOW: theme.glow || theme.primary,
  };
  return content.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}
/*
 * Templates live in templates/<id>/ and reference shared images as
 * "../../assets/...". Previews render from the app root and exports
 * put assets/ next to index.html, so both need the prefix flattened. */
function rewriteAssetPaths(html) {
  return html.replaceAll('../../assets/', 'assets/');
}
/* ============================================================
   EXPORT SERVICE - packs the processed template into a ZIP  */
const exportService = {
  async exportZIP(project) {
    const theme = resolveTheme(project.theme, project.template);
    const raw = await templateService.load(project.template);
    let html = replacePlaceholders(raw, project, theme, { imageSrc: project.image ? 'assets/images/photo.png' : PLACEHOLDER_IMAGE, });
    const zip = new JSZip();
    // Bundle every shared asset the template references
    // (decorative PNGs, background images, ...) so the exported
    // site works standalone.
    const assetPaths = [...new Set([...html.matchAll(/\.\.\/\.\.\/assets\/([^"')]+)/g)].map(m => m[1]))];
    for (const path of assetPaths) {
      try {
        const res = await fetch('assets/' + path);
        if (res.ok) zip.file('assets/' + path, await res.blob());
      } catch (e) {
        console.warn('Skipping missing asset:', path);
      }
    }
    html = rewriteAssetPaths(html);
    zip.file('index.html', html);
    if (project.image) {
      const base64Data = project.image.split(',')[1] || project.image;
      zip.folder('assets').folder('images').file('photo.png', base64Data, { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'BirthdayProject.zip');
    return true;
  },
};

// INDEXEDDB SERVICE
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
        if (!db.objectStoreNames.contains(STORE_NAME)) { db.createObjectStore(STORE_NAME, { keyPath: 'id' }); }
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

// VUE APP
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
      name: '', birthdayDate: '', message: '', theme: DEFAULT_THEME_ID,
      template: DEFAULT_TEMPLATE_ID, image: null,
    });
    const themes = Object.entries(THEMES).map(([id, t]) => ({ id, ...t }));
    const templates = Object.values(TEMPLATES);
    
    // Toast
    function showToast(message, type = 'info') {
      const icons = { success: '✅', error: '❌', info: '💡' };
      const id = Date.now() + Math.random();
      toasts.value.push({ id, message, type, icon: icons[type] || '💡' });
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
      }, 3000);
    }

    // Date helpers
    function formatDate(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    function uid() { return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
    // Load projects
    async function loadProjects() {
      loading.value = true; loadingText.value = 'Loading projects...';
      try {
        projects.value = await dbService.readAll();
        projects.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      } catch (e) {
        showToast('Failed to Load Projects', 'error');
      } finally {
        loading.value = false;
      }
    }
    // Navigation
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
      form.theme = DEFAULT_THEME_ID; form.template = DEFAULT_TEMPLATE_ID; form.image = null;
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
      form.template = templateService.resolveId(p.template); form.image = p.image;
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
    // Selectors
    function selectTheme(id) { form.theme = id; markDirty(); }
    function selectTemplate(id) { form.template = id; markDirty(); }
    function markDirty() { isDirty.value = true; }

    // Image Upload
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
    
    // Save
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

    // Export
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
        showToast('Exported Successfully! Check Your Downloads.', 'success');
      } catch (e) {
        showToast('Export Failed: ' + e.message, 'error');
      } finally {
        loading.value = false;
      }
    }

    // Delete
    function confirmDelete(project) {
      deleteTarget.value = project;
      showDeleteModal.value = true;
    }
    async function deleteProject() {
      if (!deleteTarget.value) return;
      loading.value = true; loadingText.value = 'Deleting...';
      try {
        await dbService.remove(deleteTarget.value.id);
        showToast('Project Deleted', 'success');
        showDeleteModal.value = false;
        deleteTarget.value = null;
        await loadProjects();
      } catch (e) {
        showToast('Delete Failed', 'error');
      } finally {
        loading.value = false;
      }
    }
    /* ============================================================
       PREVIEW - loads the real template file, replaces
       placeholders, and feeds the result to the iframe srcdoc.
       The template file is refetched only when the selected
       template changes; typing just re-runs the string replace.  */
    const editorTemplateHtml = ref('');
    watch(() => form.template, async (id) => {
      try {
        const html = await templateService.load(id);
        if (form.template !== id) return;
        editorTemplateHtml.value = html;
      } catch (e) {
        if (form.template !== id) return;
        editorTemplateHtml.value = '';
        showToast(e.message, 'error');
      }
    }, { immediate: true });

    // Live Preview HTML
    const livePreviewHtml = computed(() => {
      if (!editorTemplateHtml.value) return '';
      const theme = resolveTheme(form.theme, form.template);
      const html = replacePlaceholders(editorTemplateHtml.value, form, theme);
      return rewriteAssetPaths(html);
    });

    // Preview page HTML
    const previewTemplateHtml = ref('');
    watch(previewProjectData, async (p) => {
      if (!p) { previewTemplateHtml.value = ''; return; }
      try {
        const html = await templateService.load(p.template);
        if (previewProjectData.value !== p) return;
        previewTemplateHtml.value = html;
      } catch (e) {
        if (previewProjectData.value !== p) return;
        previewTemplateHtml.value = '';
        showToast(e.message, 'error');
      }
    });
    const previewHtml = computed(() => {
      const p = previewProjectData.value;
      if (!p || !previewTemplateHtml.value) return '';
      const theme = resolveTheme(p.theme, p.template);
      const html = replacePlaceholders(previewTemplateHtml.value, p, theme);
      return rewriteAssetPaths(html);
    });

    // Init
    onMounted(async () => {
      try {
        await dbService.init();
        await loadProjects();
      } catch (e) { showToast('Failed to initialize database', 'error');}
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