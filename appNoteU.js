// appNoteU.js
(function() {
    function getNoteU1Files() {
        var files = [];
        if (window.noteQContent) files.push({ key: 'noteQ', label: 'NoteQ', emoji: window.noteQMeta?.emoji || '', content: window.noteQContent });
        if (window.notePContent) files.push({ key: 'noteP', label: 'NoteP', emoji: window.notePMeta?.emoji || '', content: window.notePContent });
        return files;
    }
    function getNoteU2Files() {
        var files = [];
        if (window.noteRContent) files.push({ key: 'noteR', label: 'NoteR', emoji: window.noteRMeta?.emoji || '', content: window.noteRContent });
        return files;
    }

    function getNoteUFiles() {
        var files = [];
        getNoteU1Files().forEach(f => files.push(f));
        getNoteU2Files().forEach(f => files.push(f));
        return files;
    }

    function injectNoteUDropdown() {
        if (document.querySelector('.noteu-dropdown')) return;
        var filesDropdown = document.querySelector('.files-dropdown');
        if (!filesDropdown) return;
        var noteUParent = document.createElement('div');
        noteUParent.className = 'noteu-dropdown';
        noteUParent.style.display = 'inline-block';
        noteUParent.style.position = 'relative';
        noteUParent.style.marginLeft = '8px';
        noteUParent.innerHTML = '<button class="noteu-btn" style="font-weight:bold;cursor:pointer;padding:10px 20px;border-radius:25px;border:none;background:#e0e7ff;">NoteU ▼</button>';
        var noteUSubmenu = document.createElement('div');
        noteUSubmenu.style.display = 'none';
        noteUSubmenu.style.position = 'absolute';
        noteUSubmenu.style.left = '0';
        noteUSubmenu.style.top = '110%';
        noteUSubmenu.style.background = '#fff';
        noteUSubmenu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        noteUSubmenu.style.borderRadius = '12px';
        noteUSubmenu.style.minWidth = '160px';
        noteUSubmenu.style.zIndex = '1001';
        noteUSubmenu.style.padding = '8px 0';

        // Nested NoteU1 dropdown
        var noteU1 = document.createElement('div');
        noteU1.className = 'noteu1-dropdown';
        noteU1.style.position = 'relative';
        noteU1.style.marginBottom = '4px';
        var noteU1Btn = document.createElement('button');
        noteU1Btn.className = 'noteu1-btn';
        noteU1Btn.innerHTML = 'NoteU1 ▼';
        noteU1Btn.type = 'button';
        noteU1Btn.style.fontWeight = 'bold';
        noteU1Btn.style.cursor = 'pointer';
        noteU1Btn.style.padding = '8px 18px';
        noteU1Btn.style.borderRadius = '18px';
        noteU1Btn.style.border = 'none';
        noteU1Btn.style.background = '#e0e7ff';
        noteU1Btn.style.marginBottom = '2px';
        var noteU1Submenu = document.createElement('div');
        noteU1Submenu.style.display = 'none';
        noteU1Submenu.style.position = 'absolute';
        noteU1Submenu.style.left = '100%';
        noteU1Submenu.style.top = '0';
        noteU1Submenu.style.background = '#fff';
        noteU1Submenu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        noteU1Submenu.style.borderRadius = '12px';
        noteU1Submenu.style.minWidth = '140px';
        noteU1Submenu.style.zIndex = '1002';
        noteU1Submenu.style.padding = '8px 0';
        getNoteU1Files().forEach(function(note) {
            var btn = document.createElement('button');
            btn.className = 'noteu-dropdown-item';
            btn.innerHTML = (note.emoji || '') + note.label;
            btn.type = 'button';
            btn.onclick = function(e) {
                e.stopPropagation();
                showNoteUContent(note.key);
                noteU1Submenu.style.display = 'none';
                noteUSubmenu.style.display = 'none';
            };
            noteU1Submenu.appendChild(btn);
        });
        noteU1.appendChild(noteU1Btn);
        noteU1.appendChild(noteU1Submenu);
        noteU1Btn.addEventListener('click', function(e) {
            e.stopPropagation();
            noteU1Submenu.style.display = (noteU1Submenu.style.display === 'block') ? 'none' : 'block';
        });
        noteU1.addEventListener('mouseleave', function() {
            noteU1Submenu.style.display = 'none';
        });
        noteUSubmenu.appendChild(noteU1);

        // Nested NoteU2 dropdown
        var noteU2 = document.createElement('div');
        noteU2.className = 'noteu2-dropdown';
        noteU2.style.position = 'relative';
        var noteU2Btn = document.createElement('button');
        noteU2Btn.className = 'noteu2-btn';
        noteU2Btn.innerHTML = 'NoteU2 ▼';
        noteU2Btn.type = 'button';
        noteU2Btn.style.fontWeight = 'bold';
        noteU2Btn.style.cursor = 'pointer';
        noteU2Btn.style.padding = '8px 18px';
        noteU2Btn.style.borderRadius = '18px';
        noteU2Btn.style.border = 'none';
        noteU2Btn.style.background = '#e0e7ff';
        noteU2Btn.style.marginBottom = '2px';
        var noteU2Submenu = document.createElement('div');
        noteU2Submenu.style.display = 'none';
        noteU2Submenu.style.position = 'absolute';
        noteU2Submenu.style.left = '100%';
        noteU2Submenu.style.top = '0';
        noteU2Submenu.style.background = '#fff';
        noteU2Submenu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        noteU2Submenu.style.borderRadius = '12px';
        noteU2Submenu.style.minWidth = '140px';
        noteU2Submenu.style.zIndex = '1002';
        noteU2Submenu.style.padding = '8px 0';
        getNoteU2Files().forEach(function(note) {
            var btn = document.createElement('button');
            btn.className = 'noteu-dropdown-item';
            btn.innerHTML = (note.emoji || '') + note.label;
            btn.type = 'button';
            btn.onclick = function(e) {
                e.stopPropagation();
                showNoteUContent(note.key);
                noteU2Submenu.style.display = 'none';
                noteUSubmenu.style.display = 'none';
            };
            noteU2Submenu.appendChild(btn);
        });
        noteU2.appendChild(noteU2Btn);
        noteU2.appendChild(noteU2Submenu);
        noteU2Btn.addEventListener('click', function(e) {
            e.stopPropagation();
            noteU2Submenu.style.display = (noteU2Submenu.style.display === 'block') ? 'none' : 'block';
        });
        noteU2.addEventListener('mouseleave', function() {
            noteU2Submenu.style.display = 'none';
        });
        noteUSubmenu.appendChild(noteU2);

        noteUParent.appendChild(noteUSubmenu);
        noteUParent.querySelector('.noteu-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            noteUSubmenu.style.display = (noteUSubmenu.style.display === 'block') ? 'none' : 'block';
        });
        noteUParent.addEventListener('mouseleave', function() {
            noteUSubmenu.style.display = 'none';
        });
        filesDropdown.parentNode.insertBefore(noteUParent, filesDropdown.nextSibling);
    }

    function showNoteUContent(noteKey) {
        var root = document.getElementById('root');
        if (!root) return;
        var noteUFiles = getNoteUFiles();
        var note = noteUFiles.find(f => f.key === noteKey);
        var label = note ? note.label : noteKey;
        var content = note ? note.content : '';
        root.innerHTML = '<div class="data-section"><div class="data-section-header"><span class="data-section-title">NoteU: ' + label + '</span></div>' +
            '<div class="markdown-content"></div></div>';
        var container = root.querySelector('.data-section');
        var mdContent = container.querySelector('.markdown-content');
        mdContent.innerHTML = content.replace(/\n/g, '<br>');
    }

    function tryInjectNoteU() {
        injectNoteUDropdown();
    }

    if (document.readyState !== 'loading') tryInjectNoteU();
    else document.addEventListener('DOMContentLoaded', tryInjectNoteU);

    var observer = new MutationObserver(function() {
        tryInjectNoteU();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
