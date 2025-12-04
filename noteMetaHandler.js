// noteMetaHandler.js
(function() {
  // Provide a general helper to discover all noteU metas present on window
  window.getNoteUMetaList = function() {
    var list = [];
    Object.keys(window).forEach(function(k) {
      if (/^noteU\d+Meta$/.test(k)) {
        var noteKey = k.slice(0, -4); // remove 'Meta'
        var meta = window[k] || {};
        list.push({ key: noteKey, meta: meta });
      }
    });
    return list;
  };

  // Render the note content into the #root element using a simple markdown renderer
  window.renderNoteU = function(noteKey, label, content) {
    var root = document.getElementById('root');
    if (!root) return;
    root.innerHTML = '<div class="data-section"><div class="data-section-header"><span class="data-section-title">NoteU: ' + label + '</span></div>' +
      '<div class="markdown-content"></div></div>';
    var container = root.querySelector('.data-section');
    var mdContent = container.querySelector('.markdown-content');
    // minimal markdown-to-html used across appNoteU; keep consistent and simple
    function simpleMarkdownToHtml(md) {
      if (!md) return '';
      var lines = md.split('\n');
      var out = [];
      var inCode = false;
      lines.forEach(function(line) {
        if (line.trim().startsWith('```')) {
          inCode = !inCode;
          out.push(inCode ? '<pre><code>' : '</code></pre>');
          return;
        }
        if (inCode) {
          out.push(line);
          return;
        }
        var h1 = line.match(/^# (.*)$/);
        if (h1) {
          out.push('<h1>' + h1[1] + '</h1>');
        } else {
          out.push(line.replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration:underline;">$1</span>'));
        }
      });
      return out.join('\n')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    }
    mdContent.innerHTML = simpleMarkdownToHtml(content);
  };

  // Opens a note, prompting for password only if required by meta.password
  window.openNoteUWithPassword = function(noteKey) {
    var meta = window[noteKey + 'Meta'] || {};
    var content = window[noteKey + 'Content'] || '';
    var label = meta.name || noteKey;
    var pw = meta.password;
    // treat string "null" or actual null/undefined/empty as no-password
    var needsPassword = !(pw === undefined || pw === null || pw === '' || pw === 'null');
    if (!needsPassword) {
      window.renderNoteU(noteKey, label, content);
      return true;
    }
    var attempt = prompt('Enter password for ' + label + ':');
    if (attempt === null) return false; // user cancelled
    if (attempt === pw) {
      window.renderNoteU(noteKey, label, content);
      return true;
    }
    alert('Incorrect password');
    return false;
  };

})();
