// appNoteU.js
(function() {
    // Minimal, clear, scalable nested dropdown config
    const noteUNested = [
        {
            key: 'noteU1', label: 'NoteU1', items: [
                ...['noteU11', 'noteU12'].map(k => ({
                    key: k,
                    label: k.replace('noteU', 'NoteU'),
                    emoji: window[`${k}Meta`]?.emoji || '',
                    content: window[`${k}Content`]
                }))
            ]
        },
        {
            key: 'noteU2', label: 'NoteU2', items: [
                ...['noteU21', 'noteU22'].map(k => ({
                    key: k,
                    label: k.replace('noteU', 'NoteU'),
                    emoji: window[`${k}Meta`]?.emoji || '',
                    content: window[`${k}Content`]
                }))
            ]
        }
    ];

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

        noteUNested.forEach(function(nested) {
            var nestedDiv = document.createElement('div');
            nestedDiv.className = nested.key + '-dropdown';
            nestedDiv.style.position = 'relative';
            nestedDiv.style.marginBottom = '4px';
            var nestedBtn = document.createElement('button');
            nestedBtn.className = nested.key + '-btn';
            nestedBtn.innerHTML = nested.label + ' ▼';
            nestedBtn.type = 'button';
            nestedBtn.style.fontWeight = 'bold';
            nestedBtn.style.cursor = 'pointer';
            nestedBtn.style.padding = '8px 18px';
            nestedBtn.style.borderRadius = '18px';
            nestedBtn.style.border = 'none';
            nestedBtn.style.background = '#e0e7ff';
            nestedBtn.style.marginBottom = '2px';
            var nestedSubmenu = document.createElement('div');
            nestedSubmenu.style.display = 'none';
            nestedSubmenu.style.position = 'absolute';
            nestedSubmenu.style.left = '100%';
            nestedSubmenu.style.top = '0';
            nestedSubmenu.style.background = '#fff';
            nestedSubmenu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
            nestedSubmenu.style.borderRadius = '12px';
            nestedSubmenu.style.minWidth = '140px';
            nestedSubmenu.style.zIndex = '1002';
            nestedSubmenu.style.padding = '8px 0';
            nested.items.forEach(function(note) {
                if (!note.content) return;
                var btn = document.createElement('button');
                btn.className = 'noteu-dropdown-item';
                btn.innerHTML = (note.emoji || '') + note.label;
                btn.type = 'button';
                btn.onclick = function(e) {
                    e.stopPropagation();
                    showNoteUContent(note.key, note.label, note.content);
                    nestedSubmenu.style.display = 'none';
                    noteUSubmenu.style.display = 'none';
                };
                nestedSubmenu.appendChild(btn);
            });
            nestedDiv.appendChild(nestedBtn);
            nestedDiv.appendChild(nestedSubmenu);
            nestedBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                nestedSubmenu.style.display = (nestedSubmenu.style.display === 'block') ? 'none' : 'block';
            });
            nestedDiv.addEventListener('mouseleave', function() {
                nestedSubmenu.style.display = 'none';
            });
            noteUSubmenu.appendChild(nestedDiv);
        });

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

    function showNoteUContent(noteKey, label, content) {
        var root = document.getElementById('root');
        if (!root) return;
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
