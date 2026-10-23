(() => {
  const $ = (id) => document.getElementById(id);
  const storageKey = "browser-file-studio-v1";
  const starter = [
    {id: crypto.randomUUID(), name:"welcome.md", content:`# Welcome to Browser File Studio

यह आपका अपना browser-based file editor है।

## शुरुआत कैसे करें
- New file पर क्लिक करके .txt, .md, .html, .css, .js, .py जैसी फाइल बनाएँ।
- लिखते ही बदलाव इस browser में अपने-आप सेव होते हैं।
- Download से मौजूदा फाइल डाउनलोड करें।
- Export project से सभी फाइलों का ZIP डाउनलोड करें।

> ध्यान दें: GitHub Pages पर चलने वाली वेबसाइट आपके डिवाइस की किसी भी जगह सीधे फाइल सेव नहीं कर सकती। डाउनलोड/इम्पोर्ट का इस्तेमाल करें।`},
    {id: crypto.randomUUID(), name:"index.html", content:`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, world!</h1>
  <script src="app.js"></script>
</body>
</html>`},
    {id: crypto.randomUUID(), name:"style.css", content:`body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  background: #f4f7fb;
  color: #172033;
}
h1 { color: #2864c5; }`},
    {id: crypto.randomUUID(), name:"app.js", content:"console.log('Hello from your project!');"},
  ];
  let files = [];
  let activeId = null;
  let toastTimer;
  const editor = $("editor");

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && Array.isArray(saved.files) && saved.files.length) {
        files = saved.files.filter(f => f && typeof f.name === "string" && typeof f.content === "string" && f.id);
        activeId = saved.activeId;
      }
    } catch (_) {}
    if (!files.length) files = starter.map(f => ({...f}));
    if (!files.some(f => f.id === activeId)) activeId = files[0].id;
  }
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({files, activeId}));
      $("saveState").textContent = "Saved locally";
    } catch (_) {
      $("saveState").textContent = "Local storage full";
    }
  }
  function current() { return files.find(f => f.id === activeId); }
  function ext(name) { return (name.split(".").pop() || "txt").toLowerCase(); }
  function glyph(name) {
    const e = ext(name);
    return ({html:"HTML",htm:"HTML",css:"CSS",js:"JS",mjs:"JS",cjs:"JS",py:"PY",md:"MD",txt:"TXT",json:"JSON",xml:"XML",csv:"CSV",svg:"SVG",yml:"YML",yaml:"YML",sh:"SH",ts:"TS",tsx:"TSX",jsx:"JSX",java:"JAVA",c:"C",cpp:"C++",rs:"RS",go:"GO",sql:"SQL"})[e] || e.toUpperCase().slice(0,5);
  }
  function language(name) {
    const e = ext(name);
    return ({html:"HTML",htm:"HTML",css:"CSS",js:"JavaScript",mjs:"JavaScript",py:"Python",md:"Markdown",txt:"Plain text",json:"JSON",xml:"XML",csv:"CSV",svg:"SVG",yml:"YAML",yaml:"YAML",sh:"Shell script",ts:"TypeScript",tsx:"TypeScript JSX",jsx:"JavaScript JSX",java:"Java",c:"C",cpp:"C++",rs:"Rust",go:"Go",sql:"SQL"})[e] || "Plain text";
  }
  function render() {
    const list = $("fileList"); list.replaceChildren();
    files.forEach(f => {
      const b = document.createElement("button");
      b.className = "file-item" + (f.id === activeId ? " active" : "");
      b.innerHTML = `<span class="file-glyph"></span><span class="file-name"></span>`;
      b.querySelector(".file-glyph").textContent = glyph(f.name);
      b.querySelector(".file-name").textContent = f.name;
      b.title = f.name; b.onclick = () => switchFile(f.id); list.appendChild(b);
    });
    const tabs = $("tabs"); tabs.replaceChildren();
    files.filter(f => f.id === activeId).forEach(f => {
      const b = document.createElement("button"); b.className = "tab active"; b.textContent = f.name; tabs.appendChild(b);
    });
    const f = current();
    if (!f) return;
    $("filename").value = f.name;
    $("fileIcon").textContent = glyph(f.name);
    $("languageStatus").textContent = language(f.name);
    editor.value = f.content;
    updateStats();
    updateLines();
  }
  function switchFile(id) {
    syncContent(); activeId = id; persist(); render();
  }
  function syncContent() {
    const f = current(); if (f) f.content = editor.value;
  }
  function updateLines() {
    const count = editor.value.split("\n").length;
    $("lineNumbers").textContent = Array.from({length:count}, (_,i)=>i+1).join("\n");
    $("lineNumbers").scrollTop = editor.scrollTop;
  }
  function updateStats() {
    const text = editor.value;
    const before = text.slice(0, editor.selectionStart);
    const line = before.split("\n").length;
    const col = before.length - before.lastIndexOf("\\n");
    $("cursorStatus").textContent = `Ln ${line}, Col ${col}`;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    $("wordStatus").textContent = `${words} words · ${text.length} chars`;
  }
  function notify(msg) {
    const el = $("toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove("show"), 2300);
  }
  function safeFilename(name) {
    return (name || "untitled.txt").replace(/[\\\\/:*?"<>|]/g, "_").trim() || "untitled.txt";
  }
  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = safeFilename(name); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }
  function downloadCurrent() {
    syncContent(); const f = current(); if (!f) return;
    downloadBlob(f.name, new Blob([f.content], {type:"text/plain;charset=utf-8"}));
    persist(); notify(`Downloaded ${f.name}`);
  }
  function makeFile(name, content="") {
    name = safeFilename(name);
    if (files.some(f=>f.name.toLowerCase() === name.toLowerCase())) {
      notify("इस नाम की फाइल पहले से मौजूद है"); return;
    }
    const f = {id: crypto.randomUUID(), name, content}; files.push(f); activeId=f.id; persist(); render(); notify(`Created ${name}`);
  }
  function openNew() {
    $("newName").value = ""; $("newDialog").showModal(); $("newName").focus();
  }
  $("newBtn").onclick = openNew; $("addBtn").onclick = openNew;
  $("newForm").addEventListener("submit", e => {
    e.preventDefault(); const name = $("newName").value.trim();
    if (!name) return;
    if (!name.includes(".")) { notify("कृपया फाइल extension भी लिखें, जैसे notes.txt"); return; }
    makeFile(name); $("newDialog").close();
  });
  document.querySelectorAll("[data-ext]").forEach(b => b.onclick = () => {
    const ext = b.dataset.ext; $("newName").value = `untitled.${ext}`; $("newName").focus();
  });
  editor.addEventListener("input", () => {
    syncContent(); updateLines(); updateStats(); persist();
  });
  editor.addEventListener("scroll", () => $("lineNumbers").scrollTop = editor.scrollTop);
  editor.addEventListener("click", updateStats); editor.addEventListener("keyup", updateStats);
  editor.addEventListener("keydown", e => {
    if (e.key === "Tab") {
      e.preventDefault(); const start = editor.selectionStart, end = editor.selectionEnd;
      editor.setRangeText("  ", start, end, "end"); syncContent(); updateLines(); updateStats(); persist();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); downloadCurrent(); }
  });
  $("filename").addEventListener("change", () => {
    const f = current(); if (!f) return;
    const name = safeFilename($("filename").value);
    if (files.some(other => other.id !== f.id && other.name.toLowerCase() === name.toLowerCase())) {
      notify("इस नाम की फाइल पहले से मौजूद है"); $("filename").value = f.name; return;
    }
    f.name = name; persist(); render();
  });
  $("renameBtn").onclick = () => { $("filename").focus(); $("filename").select(); notify("ऊपर फाइल का नाम बदलकर Enter दबाएँ"); };
  $("duplicateBtn").onclick = () => {
    syncContent(); const f = current(); if (!f) return;
    const dot = f.name.lastIndexOf("."); const name = dot > 0 ? `${f.name.slice(0,dot)}-copy${f.name.slice(dot)}` : `${f.name}-copy`;
    makeFile(name, f.content);
  };
  $("deleteBtn").onclick = () => {
    const f = current(); if (!f) return;
    if (!confirm(`क्या आप "${f.name}" को इस editor से हटाना चाहते हैं?`)) return;
    files = files.filter(x=>x.id!==activeId);
    if (!files.length) files.push({id:crypto.randomUUID(),name:"untitled.txt",content:""});
    activeId=files[0].id; persist(); render(); notify("File removed from editor");
  };
  $("downloadBtn").onclick = downloadCurrent;
  $("importBtn").onclick = () => $("fileInput").click();
  $("fileInput").addEventListener("change", async e => {
    const selected = [...e.target.files];
    for (const file of selected) {
      try {
        const content = await file.text();
        const existing = files.find(f=>f.name.toLowerCase()===file.name.toLowerCase());
        if (existing) { existing.content=content; activeId=existing.id; }
        else { const f={id:crypto.randomUUID(),name:safeFilename(file.name),content}; files.push(f); activeId=f.id; }
      } catch (_) { notify(`Could not import ${file.name}`); }
    }
    persist(); render(); e.target.value=""; if(selected.length) notify(`Imported ${selected.length} file(s)`);
  });
  $("downloadAllBtn").onclick = async () => {
    syncContent(); persist();
    if (!window.JSZip) { notify("ZIP library loading नहीं हुई; पेज refresh करके फिर कोशिश करें"); return; }
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    try {
      const blob = await zip.generateAsync({type:"blob"});
      downloadBlob("browser-file-studio-project.zip", blob);
      notify("Project ZIP exported");
    } catch (_) { notify("ZIP बनाते समय समस्या हुई"); }
  };
  // Keyboard-friendly editor; Enter in filename accepts rename.
  $("filename").addEventListener("keydown", e => { if (e.key==="Enter") { e.preventDefault(); $("filename").blur(); } });
  load(); render(); persist();
})();