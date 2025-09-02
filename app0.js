// app0.js
// NoteZ (plain text) dropdown and search functionality
(function() {
    function getAllTxtFiles() {
        var files = [];
        for (var key in window) {
            var match = key.match(/^txt(\d+)Content$/);
            if (match && window[key]) {
                var idx = match[1];
                var meta = window['txt' + idx + 'Meta'] || {};
                var label = (meta.name && meta.name.trim()) ? meta.name : ('txt' + idx);
                var emoji = (meta.emoji && meta.emoji.trim()) ? meta.emoji + ' ' : '';
                files.push({
                    key: 'txt' + idx,
                    label: label,
                    emoji: emoji,
                    content: window[key]
                });
            }
        }
        files.sort(function(a, b) {
            var na = parseInt(a.key.replace('txt',''), 10);
            var nb = parseInt(b.key.replace('txt',''), 10);
            return na-nb;
        });
        return files;
    }

    function injectTxtMenuRibbon() {
        if (document.querySelector('.txt-ribbon-dropdown')) return;
        var filesDropdown = document.querySelector('.files-dropdown');
        if (!filesDropdown) return;
        var txtFiles = getAllTxtFiles();
        if (txtFiles.length === 0) return;
        var txtRibbon = document.createElement('div');
        txtRibbon.className = 'txt-ribbon-dropdown';
        txtRibbon.style.display = 'inline-block';
        txtRibbon.style.position = 'relative';
        txtRibbon.style.marginLeft = '8px';
        txtRibbon.innerHTML = '<button class="txt-ribbon-btn" tabindex="0" style="font-weight:bold;cursor:pointer;padding:10px 20px;border-radius:25px;border:none;background:#f0f2f5;">NoteZ ▼</button>';
        var txtSubmenu = document.createElement('div');
        txtSubmenu.style.display = 'none';
        txtSubmenu.style.position = 'absolute';
        txtSubmenu.style.left = '0';
        txtSubmenu.style.top = '110%';
        txtSubmenu.style.background = '#fff';
        txtSubmenu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        txtSubmenu.style.borderRadius = '12px';
        txtSubmenu.style.minWidth = '120px';
        txtSubmenu.style.zIndex = '1001';
        txtSubmenu.style.padding = '8px 0';
        txtSubmenu.setAttribute('role', 'menu');
        txtFiles.forEach(function(txt) {
            var btn = document.createElement('button');
            btn.className = 'files-dropdown-item';
            btn.innerHTML = (txt.emoji || '') + txt.label;
            btn.type = 'button';
            btn.setAttribute('role', 'menuitem');
            btn.tabIndex = 0;
            btn.onclick = function(e) {
                e.stopPropagation();
                showTxt(txt.key);
                txtSubmenu.style.display = 'none';
            };
            btn.onkeydown = function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    btn.click();
                }
            };
            txtSubmenu.appendChild(btn);
        });
        txtRibbon.appendChild(txtSubmenu);
        var ribbonBtn = txtRibbon.querySelector('.txt-ribbon-btn');
        ribbonBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            txtSubmenu.style.display = (txtSubmenu.style.display === 'block') ? 'none' : 'block';
            if (txtSubmenu.style.display === 'block') {
                txtSubmenu.querySelector('button').focus();
            }
        });
        ribbonBtn.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                txtSubmenu.style.display = 'block';
                txtSubmenu.querySelector('button').focus();
            }
        });
        txtRibbon.addEventListener('mouseleave', function() {
            txtSubmenu.style.display = 'none';
        });
        filesDropdown.parentNode.insertBefore(txtRibbon, filesDropdown.nextSibling);
    }

    function highlightTxtMatches(text, query) {
        if (!query) return {html: text.replace(/\n/g, '<br>'), count: 0};
        var safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp(safe, 'gi');
        var idx = 0;
        var count = 0;
        var html = text.replace(re, function(match) {
            count++;
            return '<span class="txt-search-highlight" data-txt-idx="' + (idx++) + '">' + match + '</span>';
        });
        return {html: html.replace(/\n/g, '<br>'), count};
    }

    function addTxtSearch(container, currentTxtKey) {
        var searchBox = document.createElement('div');
        searchBox.className = 'txt-html-search-bar sticky-txt-html-search-bar';
        searchBox.style.display = 'flex';
        searchBox.style.alignItems = 'center';
        searchBox.style.gap = '8px';
        searchBox.style.marginBottom = '12px';
        searchBox.innerHTML = '<input type="text" placeholder="Search within this text..." class="txt-search-input" style="width:40%;min-width:120px;max-width:100%;padding:8px 12px;border-radius:6px;border:1px solid #ccc;font-size:15px;">' +
            '<button class="txt-search-prev" style="padding:6px 10px;">&#8593;</button>' +
            '<button class="txt-search-next" style="padding:6px 10px;">&#8595;</button>' +
            '<span class="txt-search-count" style="min-width:120px;text-align:center;font-size:14px;color:#555;"></span>';
        container.prepend(searchBox);
        var input = searchBox.querySelector('.txt-search-input');
        var prevBtn = searchBox.querySelector('.txt-search-prev');
        var nextBtn = searchBox.querySelector('.txt-search-next');
        var countSpan = searchBox.querySelector('.txt-search-count');
        var txtContent = container.querySelector('.plaintext-content');
        var txtFiles = getAllTxtFiles();
        var currentTxtIdx = txtFiles.findIndex(f => f.key === currentTxtKey);
        var allMatches = [];
        var currentGlobalIdx = 0;

        function updateHighlights(jumpToIdx) {
            var q = input.value.trim();
            allMatches = [];
            var txt = txtFiles[currentTxtIdx];
            var {html: highlighted, count} = highlightTxtMatches(txt.content, q);
            txt.html = highlighted;
            for (var j = 0; j < count; ++j) {
                allMatches.push({fileIdx: currentTxtIdx, matchIdx: j});
            }
            if (allMatches.length > 0) {
                if (jumpToIdx !== undefined) {
                    currentGlobalIdx = jumpToIdx;
                } else if (currentGlobalIdx >= allMatches.length) {
                    currentGlobalIdx = 0;
                } else if (currentGlobalIdx < 0) {
                    currentGlobalIdx = allMatches.length - 1;
                }
            } else {
                currentGlobalIdx = 0;
            }
            txtContent.innerHTML = txt.html;
            var highlights = txtContent.querySelectorAll('.txt-search-highlight');
            var localIdx = 0;
            if (allMatches.length > 0) {
                localIdx = allMatches[currentGlobalIdx].matchIdx;
                if (highlights[localIdx]) {
                    highlights[localIdx].classList.add('txt-search-current');
                    highlights[localIdx].scrollIntoView({block:'center',behavior:'smooth'});
                }
            }
            var countText = count > 0 ? count + ' in ' + txt.label : '';
            if (allMatches.length > 0) {
                countSpan.textContent = (currentGlobalIdx+1) + ' / ' + allMatches.length + (countText ? ' ('+countText+')' : '');
            } else {
                countSpan.textContent = '0 / 0';
            }
            var title = container.querySelector('.data-section-title');
            if (title) title.textContent = 'Plain Text: ' + txt.label;
        }
        input.addEventListener('input', function() {
            currentGlobalIdx = 0;
            updateHighlights();
        });
        prevBtn.addEventListener('click', function() {
            if (allMatches.length > 0) { currentGlobalIdx = (currentGlobalIdx - 1 + allMatches.length) % allMatches.length; updateHighlights(); }
        });
        nextBtn.addEventListener('click', function() {
            if (allMatches.length > 0) { currentGlobalIdx = (currentGlobalIdx + 1) % allMatches.length; updateHighlights(); }
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                updateHighlights();
            }
        });
        updateHighlights();
    }

    function showTxt(txtKey) {
        var root = document.getElementById('root');
        if (!root) return;
        var txtFiles = getAllTxtFiles();
        var txt = txtFiles.find(f => f.key === txtKey);
        var label = txt ? txt.label : txtKey;
        var content = txt ? txt.content : '';
        root.innerHTML = '<div class="data-section"><div class="data-section-header"><span class="data-section-title">Plain Text: ' + label + '</span></div>' +
            '<div class="plaintext-content"></div></div>';
        var container = root.querySelector('.data-section');
        var txtContent = container.querySelector('.plaintext-content');
        txtContent.innerHTML = content.replace(/\n/g, '<br>');
        addTxtSearch(container, txtKey);
    }

    function tryInjectTxtMenu() {
        injectTxtMenuRibbon();
    }

    if (document.readyState !== 'loading') tryInjectTxtMenu();
    else document.addEventListener('DOMContentLoaded', tryInjectTxtMenu);

    var observer = new MutationObserver(function() {
        tryInjectTxtMenu();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Add styles for highlight and responsive search bar
    var style = document.createElement('style');
    style.textContent = '.txt-search-highlight { background: #e0e7ff; color: #1d4ed8; border-radius: 3px; padding: 1px 2px; } .txt-search-current { background: #ff6b6b !important; color: #fff !important; } .txt-html-search-bar .txt-search-input { width: 40%; min-width: 120px; max-width: 100%; } @media (max-width: 600px) { .txt-html-search-bar .txt-search-input { width: 90%; min-width: 60px; } }';
    document.head.appendChild(style);

    // Expose for other scripts if needed
    window.txtSearchBar = addTxtSearch;
})();
