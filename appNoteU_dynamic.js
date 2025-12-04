// appNoteU_dynamic.js
(function() {
  function collectNestedNotes() {
    var metas = (window.getNoteUMetaList && window.getNoteUMetaList()) || [];
    // group by first digit after noteU (noteU11 -> noteU1)
    var groups = {};
    metas.forEach(function(entry) {
      var noteKey = entry.key; // e.g. noteU11
      var meta = entry.meta || {};
      var digits = (noteKey.match(/^noteU(\d+)/) || [])[1] || '';
      var groupId = digits ? 'noteU' + digits.charAt(0) : noteKey;
      if (!groups[groupId]) groups[groupId] = { key: groupId, label: groupId.replace('noteU', 'NoteU'), items: [] };
      groups[groupId].items.push({
        key: noteKey,
        label: meta.name || noteKey.replace('noteU', 'NoteU'),
        emoji: meta.emoji || '',
        content: window[noteKey + 'Content'] || '',
        meta: meta
      });
    });
    // convert to array and sort groups by key
    return Object.keys(groups).sort().map(function(k) { return groups[k]; });
  }

  function injectNoteUDropdown() {
    if (document.querySelector('.noteu-dropdown')) return;
    var filesDropdown = document.querySelector('.files-dropdown');
    if (!filesDropdown) return;
    var noteUNested = collectNestedNotes();
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
        // respect display flag in meta (default unhide)
        var display = (note.meta && note.meta.display) || 'unhide';
        if (display === 'hide') return; // skip hidden notes
        if (!note.content) return; // no content -> skip
        var btn = document.createElement('button');
        btn.className = 'noteu-dropdown-item';
        // show lock emoji if password is required
        var pw = note.meta && note.meta.password;
        var needsPassword = !(pw === undefined || pw === null || pw === '' || pw === 'null');
        btn.innerHTML = (note.emoji ? note.emoji + ' ' : '') + note.label + (needsPassword ? ' 🔒' : '');
        btn.type = 'button';
        btn.onclick = function(e) {
          e.stopPropagation();
          // use handler to enforce password rules
          if (window.openNoteUWithPassword) window.openNoteUWithPassword(note.key);
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

  function tryInjectNoteU() {
    injectNoteUDropdown();
  }

  if (document.readyState !== 'loading') tryInjectNoteU();
  else document.addEventListener('DOMContentLoaded', tryInjectNoteU);

  // Also observe DOM so dropdown is injected if files-dropdown appears later
  var observer = new MutationObserver(function() {
    tryInjectNoteU();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // small helper: expose method to rebuild dropdown if metas change
  window.rebuildNoteUDropdown = function() {
    var existing = document.querySelector('.noteu-dropdown');
    if (existing) existing.remove();
    injectNoteUDropdown();
  };

})();
