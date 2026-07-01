# 🎂 Birthday Website Generator

A modern, browser-based **Birthday Website Generator** built with **Vue 3**, **IndexedDB**, **JSZip**, and **FileSaver.js**.

This application allows users to create personalized birthday websites without requiring a backend or database server. Projects are stored locally in the browser using **IndexedDB** and can be exported as fully functional static websites containing HTML, CSS, JavaScript, and optional images.

---

# 📖 Table of Contents

* Overview
* Features
* Technologies Used
* Application Flow
* Project Structure
* How It Works
* Themes
* Templates
* Export System
* Data Storage
* Screenshots
* Future Improvements
* Running the Project
* License

---

# 🎉 Overview

Birthday Website Generator is a lightweight web application that allows users to generate beautiful birthday websites for friends and family.

Users can:

* Create multiple birthday website projects
* Customize themes and templates
* Upload an image
* Add birthday details and a custom message
* Preview the generated website live
* Export the project as a standalone website

The exported website can be hosted anywhere (GitHub Pages, Netlify, Vercel, Hostinger, etc.) without requiring Vue or any additional dependencies.

---

# ✨ Features

### Dashboard

* Create unlimited birthday projects
* View all saved projects
* Edit existing projects
* Delete projects
* Preview projects
* Export projects

### Project Editor

* Birthday person's name
* Birthday date
* Personal birthday message
* Theme selection
* Template selection
* Image upload
* Live preview

### Preview

* Real-time website rendering
* Full page preview
* Return to editor
* Export directly

### Export

Generates a ZIP containing:

```text
BirthdayProject.zip

│
├── index.html
├── style.css
├── script.js
└── assets/
    └── images/
        └── photo.jpg (optional)
```

The exported website works completely offline.

---

# 🛠 Technologies Used

* Vue 3 (CDN Version)
* IndexedDB
* JSZip
* FileSaver.js
* HTML5
* CSS3
* JavaScript (ES6)

No backend is required.

---

# 🔄 Application Flow

```text
Application Starts
        │
        ▼
Initialize IndexedDB
        │
        ▼
Load Saved Projects
        │
        ▼
Dashboard
        │
        ├─────────────► Create New Project
        │                     │
        │                     ▼
        │               Project Editor
        │                     │
        │                     ▼
        │             Live Preview Updates
        │                     │
        │                     ▼
        │                 Save Project
        │                     │
        │                     ▼
        │                IndexedDB Storage
        │
        ▼
Open Existing Project
        │
        ▼
Preview
        │
        ▼
Export ZIP
```

---

# 📂 Project Structure

Although the application exists as a single HTML file, it is logically divided into modules.

```text
Birthday Website Generator

│
├── HTML Layout
│
├── CSS
│   ├── Reset
│   ├── Layout
│   ├── Dashboard
│   ├── Editor
│   ├── Preview
│   ├── Components
│   └── Responsive Design
│
├── Theme Definitions
│
├── Template Definitions
│
├── IndexedDB Service
│
├── Export Service
│
├── Vue Application
│
├── Live Preview Generator
│
└── ZIP Export
```

---

# 🎨 Themes

Themes define the color palette used throughout the generated website.

Each theme contains:

* Background color
* Surface color
* Text color
* Primary accent
* Secondary accent
* Display emoji

Current themes include:

* Pink 🌸
* Blue 💙
* Purple 🟣
* Dark 🌙
* Light ☀️
* Rainbow 🌈
* Gold ✨
* Red ❤️
* Green 💚

Adding a new theme only requires creating another object inside the `THEMES` configuration.

---

# 🖼 Templates

Templates control the overall appearance of the generated website.

Current templates:

### Cute

* Rounded corners
* Pastel colors
* Comic-style font
* Playful decorations

### Elegant

* Serif typography
* Premium appearance
* Minimal design
* Gold styling

### Gaming

* Neon colors
* Pixel-inspired visuals
* Dark interface
* Animated effects

Unlike themes, templates modify the layout and styling rather than colors.

---

# 💾 Data Storage

Projects are stored locally using **IndexedDB**.

Each project contains:

```text
Project

• ID
• Name
• Birthday Date
• Message
• Theme
• Template
• Image
• Created Date
• Updated Date
```

No information is uploaded to any server.

Everything remains inside the user's browser.

---

# 📦 Export System

When exporting a project:

1. HTML is generated dynamically.
2. CSS is generated based on the selected theme and template.
3. JavaScript animations are generated.
4. Uploaded images are copied into the ZIP.
5. JSZip packages everything.
6. FileSaver downloads the ZIP.

The exported project is completely standalone.

---

# 🖥 Live Preview

The editor contains an embedded preview powered by an iframe.

Instead of creating temporary files, the application:

* Generates HTML
* Generates CSS
* Generates JavaScript
* Injects everything into the iframe
* Displays the website instantly

This allows users to see changes in real time before exporting.

---

# 📸 Screenshots

## Dashboard

![Dashboard](/BG%20App/ReadmeScreenshots/dashboard.png)

---

## Project Editor

![Editor](/BG%20App/ReadmeScreenshots/editor.png)
---

## Live Preview

![Live Preview](/BG%20App/ReadmeScreenshots/previewLive.png)
---

## Exported Website

![Dashboard](/BG%20App/ReadmeScreenshots/dashboard.png)
---

# 🚀 Future Improvements

Potential features planned for future versions:

* Background music support
* Additional templates
* Custom fonts
* More animations
* Confetti customization
* GIF support
* Video backgrounds
* Countdown timer
* Password-protected birthday pages
* Shareable project links
* Drag-and-drop editor
* Multi-language support
* More export formats
* Import existing projects
* Cloud synchronization
* PWA (Offline Support)

---

# ▶ Running the Project

Since the application is fully client-side:

1. Download the project.
2. Open the HTML file in a modern browser.

Or serve it locally using:

```bash
python -m http.server
```

or

```bash
npx serve
```

No installation is required.

---

# 🤝 Contributing

Contributions are welcome.

Ideas, bug fixes, UI improvements, new templates, animations, and feature additions are greatly appreciated.

Feel free to fork the project and submit a Pull Request.

---

# 📄 License

This project is open-source and available under the MIT License.

---

# ❤️ Acknowledgements

Built using:

* Vue 3
* IndexedDB
* JSZip
* FileSaver.js

Special thanks to the open-source community for making browser-based applications like this possible.
