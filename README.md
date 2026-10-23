# Browser File Studio

A small, static browser-based text/code file editor designed for GitHub Pages.

## Features
- Create and edit `.txt`, `.md`, `.html`, `.css`, `.js`, `.py`, `.json`, `.xml`, `.csv`, and other text-based files.
- Import local text files.
- Autosave drafts in browser `localStorage`.
- Download the active file, or export the project as a ZIP.
- Rename, duplicate, and delete files from the editor.
- Mobile-friendly layout; no server or build step required.

## Deploy on GitHub Pages
1. Extract this ZIP on your computer, or upload the ZIP contents to a GitHub repository (do not upload the ZIP itself if you want the site to run).
2. Ensure `index.html`, `style.css`, and `app.js` are at the repository root.
3. Open repository **Settings → Pages**.
4. Under build/deployment, choose **Deploy from a branch**, select your branch (usually `main`) and folder `/ (root)`, then Save.
5. Wait for GitHub Pages to publish and open the URL shown there.

## Important limitations
- This is a static website. It cannot directly save files to arbitrary folders on your device. Use **Download** or **Import file**.
- Drafts are stored in the current browser's local storage. Clearing browser site data may remove them; download backups for important work.
- ZIP export uses JSZip from a CDN, so the first ZIP export needs an internet connection. The core editor and individual file downloads work without that library.
- This edits text/code files. It does not execute Python, install packages, or provide a full operating-system file manager.
- Opening an HTML file inside the editor does not run it. Download it and open it separately to preview.
