// app8.js
// HTML search bar (for HTML, searches all HTML and markdown files)
(function() {
    function highlightMatches(html, query) {
        if (!query) return {html, count: 0};
        var safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp(safe, 'gi');
        var idx = 0;
        var count = 0;
        var newHtml = html.replace(re, function(match) {
            count++;
            return '<span class="md-search-highlight" data-md-idx="' + (idx++) + '">' + match + '</span>';
        });
        return {html: newHtml, count};
    }

    function simpleMarkdownToHtml(md) {
        if (!md) return '';
        return md
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\n---\n/g, '<hr>')
            .replace(/\n/g, '<br>');
    }

    function getAllHtmlFiles() {
        var files = [];
        for (var key in window) {
            var match = key.match(/^html(\d+)Content$/);
            if (match && window[key]) {
                var idx = match[1];
                var meta = window['html' + idx + 'Meta'] || {};
                var label = (meta.name && meta.name.trim()) ? meta.name : ('html' + idx);
                var emoji = (meta.emoji && meta.emoji.trim()) ? meta.emoji + ' ' : '';
                files.push({
                    key: 'html' + idx,
                    label: label,
                    emoji: emoji,
                    type: 'html',
                    content: window[key]
                });
            }
        }
        for (var key in window) {
            var match = key.match(/^markdown(\d+)Content$/);
            if (match && window[key]) {
                var idx = match[1];
                var meta = window['markdown' + idx + 'Meta'] || {};
                var label = (meta.name && meta.name.trim()) ? meta.name : ('md' + idx);
                var emoji = (meta.emoji && meta.emoji.trim()) ? meta.emoji + ' ' : '';
                files.push({
                    key: 'md' + idx,
                    label: label,
                    emoji: emoji,
                    type: 'markdown',
                    content: window[key]
                });
            }
        }
        files.sort(function(a, b) {
            var na = parseInt(a.key.replace(/^(md|html)/,''), 10);
            var nb = parseInt(b.key.replace(/^(md|html)/,''), 10);
            if (a.key.startsWith('html') && b.key.startsWith('md')) return -1;
            if (a.key.startsWith('md') && b.key.startsWith('html')) return 1;
            return na-nb;
        });
        return files;
    }

    // Search bar for HTML, searches all HTML and markdown files
    function addHtmlSearch(container, currentHtmlKey) {
        var searchBox = document.createElement('div');
        searchBox.className = 'md-html-search-bar sticky-md-html-search-bar';
        searchBox.style.display = 'flex';
        searchBox.style.alignItems = 'center';
        searchBox.style.gap = '8px';
        searchBox.style.marginBottom = '12px';
        searchBox.innerHTML = '<input type="text" placeholder="Search in all HTML and markdown..." class="md-search-input" style="width:40%;min-width:120px;max-width:100%;padding:8px 12px;border-radius:6px;border:1px solid #ccc;font-size:15px;">' +
            '<button class="md-search-prev" style="padding:6px 10px;">&#8593;</button>' +
            '<button class="md-search-next" style="padding:6px 10px;">&#8595;</button>' +
            '<span class="md-search-count" style="min-width:120px;text-align:center;font-size:14px;color:#555;"></span>';
        container.prepend(searchBox);
        var input = searchBox.querySelector('.md-search-input');
        var prevBtn = searchBox.querySelector('.md-search-prev');
        var nextBtn = searchBox.querySelector('.md-search-next');
        var countSpan = searchBox.querySelector('.md-search-count');
        var htmlContent = container.querySelector('.html-content');
        var files = getAllHtmlFiles();
        var allMatches = [];
        var currentGlobalIdx = 0;

        function updateHighlights(jumpToIdx) {
            var q = input.value.trim();
            allMatches = [];
            var counts = [];
            files.forEach(function(f, i) {
                var html = f.type === 'markdown' ? simpleMarkdownToHtml(f.content) : f.content;
                var {html: highlighted, count} = highlightMatches(html, q);
                counts.push(count);
                f.html = highlighted;
                for (var j = 0; j < count; ++j) {
                    allMatches.push({fileIdx: i, matchIdx: j});
                }
            });
            var showFileIdx = 0;
            if (allMatches.length > 0) {
                if (jumpToIdx !== undefined) {
                    currentGlobalIdx = jumpToIdx;
                } else if (currentGlobalIdx >= allMatches.length) {
                    currentGlobalIdx = 0;
                } else if (currentGlobalIdx < 0) {
                    currentGlobalIdx = allMatches.length - 1;
                }
                showFileIdx = allMatches[currentGlobalIdx]?.fileIdx || 0;
            } else {
                currentGlobalIdx = 0;
            }
            var file = files[showFileIdx];
            if (file) {
                if (file.type === 'markdown') {
                    htmlContent.className = 'markdown-content';
                    htmlContent.innerHTML = simpleMarkdownToHtml(file.content);
                } else {
                    htmlContent.className = 'html-content';
                    htmlContent.innerHTML = file.html;
                }
            } else {
                htmlContent.innerHTML = '';
            }
            var highlights = htmlContent.querySelectorAll('.md-search-highlight');
            var localIdx = 0;
            if (allMatches.length > 0 && allMatches[currentGlobalIdx].fileIdx === showFileIdx) {
                localIdx = allMatches[currentGlobalIdx].matchIdx;
                if (highlights[localIdx]) {
                    highlights[localIdx].classList.add('md-search-current');
                    highlights[localIdx].scrollIntoView({block:'center',behavior:'smooth'});
                }
            }
            var countText = counts.map((c, i) => c > 0 ? c + ' in ' + files[i].label : '').filter(Boolean).join(', ');
            if (allMatches.length > 0) {
                countSpan.textContent = (currentGlobalIdx+1) + ' / ' + allMatches.length + (countText ? ' ('+countText+')' : '');
            } else {
                countSpan.textContent = '0 / 0';
            }
            var title = container.querySelector('.data-section-title');
            if (title) title.textContent = (file ? (file.type === 'markdown' ? 'Markdown: ' : 'HTML: ') + file.label : '');
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
        updateHighlights();
    }

    function injectHtmlMenuRibbon() {
        if (document.querySelector('.html-ribbon-dropdown')) return;
        var filesDropdown = document.querySelector('.files-dropdown');
        if (!filesDropdown) return;
        var htmlFiles = getAllHtmlFiles().filter(f => f.type === 'html');
        if (htmlFiles.length === 0) return;
        var htmlRibbon = document.createElement('div');
        htmlRibbon.className = 'html-ribbon-dropdown';
        htmlRibbon.style.display = 'inline-block';
        htmlRibbon.style.position = 'relative';
        htmlRibbon.style.marginLeft = '8px';
        htmlRibbon.innerHTML = '<button class="html-ribbon-btn">NoteX ▼</button>';
        var htmlSubmenu = document.createElement('div');
        htmlSubmenu.style.display = 'none';
        htmlSubmenu.style.position = '';
        htmlSubmenu.style.left = '';
        htmlSubmenu.style.top = '';
        htmlSubmenu.style.background = '';
        htmlSubmenu.style.boxShadow = '';
        htmlSubmenu.style.borderRadius = '';
        htmlSubmenu.style.minWidth = '';
        htmlSubmenu.style.zIndex = '';
        htmlSubmenu.style.padding = '';
        htmlSubmenu.style.border = '';
        htmlFiles.forEach(function(html) {
            var btn = document.createElement('button');
            btn.className = 'files-dropdown-item';
            btn.innerHTML = (html.emoji || '') + html.label;
            btn.type = 'button';
            btn.onclick = function(e) {
                e.stopPropagation();
                showHtml(html.key);
                htmlSubmenu.style.display = 'none';
            };
            htmlSubmenu.appendChild(btn);
        });
        htmlRibbon.appendChild(htmlSubmenu);
        htmlRibbon.querySelector('.html-ribbon-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            htmlSubmenu.style.display = (htmlSubmenu.style.display === 'block') ? 'none' : 'block';
        });
        htmlRibbon.addEventListener('mouseleave', function() {
            htmlSubmenu.style.display = 'none';
        });
        filesDropdown.parentNode.insertBefore(htmlRibbon, filesDropdown.nextSibling);
    }

    function showHtml(htmlKey) {
        var root = document.getElementById('root');
        if (!root) return;
        var files = getAllHtmlFiles();
        var file = files.find(f => f.key === htmlKey);
        var label = file ? file.label : htmlKey;
        var content = file ? file.content : '';
        var type = file ? file.type : 'html';
        root.innerHTML = '<div class="data-section"><div class="data-section-header"><span class="data-section-title">' + (type === 'markdown' ? 'Markdown: ' : 'HTML: ') + label + '</span></div>' +
            '<div class="' + (type === 'markdown' ? 'markdown-content' : 'html-content') + '"></div></div>';
        var container = root.querySelector('.data-section');
        var htmlContent = container.querySelector(type === 'markdown' ? '.markdown-content' : '.html-content');
        if (type === 'markdown') {
            htmlContent.innerHTML = simpleMarkdownToHtml(content);
        } else {
            htmlContent.innerHTML = content;
        }
        addHtmlSearch(container, htmlKey);
    }

    function tryInjectHtmlMenu() {
        // Remove HTML from files dropdown if present
        var filesDropdown = document.querySelector('.files-dropdown-content');
        if (filesDropdown) {
            var htmlMain = filesDropdown.querySelector('.files-html-main');
            if (htmlMain) htmlMain.remove();
        }
        injectHtmlMenuRibbon();
    }

    if (document.readyState !== 'loading') tryInjectHtmlMenu();
    else document.addEventListener('DOMContentLoaded', tryInjectHtmlMenu);

    var observer = new MutationObserver(function() {
        tryInjectHtmlMenu();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Add styles for highlight and responsive search bar
    var style = document.createElement('style');
    style.textContent = '.md-search-highlight { background: #fff3cd; color: #d35400; border-radius: 3px; padding: 1px 2px; } .md-search-current { background: #ff6b6b !important; color: #fff !important; } .md-html-search-bar .md-search-input { width: 40%; min-width: 120px; max-width: 100%; } @media (max-width: 600px) { .md-html-search-bar .md-search-input { width: 90%; min-width: 60px; } }';
    document.head.appendChild(style);
})();
