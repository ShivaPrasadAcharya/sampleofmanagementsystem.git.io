// app7.js
// Markdown search bar (only for markdown, searches all markdown files)
(function() {
    function simpleMarkdownToHtml(md) {
        if (!md) return '';
        // Extract h1s for TOC
        var h1s = [];
        var lines = md.split('\n');
        var newLines = [];
        var h1Count = 0;
        var inTable = false;
        var tableRows = [];
        lines.forEach(function(line, idx) {
            var m = line.match(/^# (.*)$/);
            // Table detection: line with | and at least one more |, and not code block
            var isTableRow = /^\s*\|(.+\|)+\s*$/.test(line);
            var isTableHeaderSep = /^\s*\|?(\s*:?-+:?\s*\|)+\s*$/.test(line);
            if (isTableRow && !isTableHeaderSep) {
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                }
                tableRows.push(line);
                // If it's the last line, flush table
                if (idx === lines.length - 1) {
                    newLines.push(renderTable(tableRows));
                    inTable = false;
                    tableRows = [];
                }
                return;
            } else if (isTableHeaderSep && inTable) {
                tableRows.push(line);
                return;
            } else if (inTable) {
                // End of table, flush
                newLines.push(renderTable(tableRows));
                inTable = false;
                tableRows = [];
            }
            if (m) {
                h1Count++;
                var id = 'toc-h1-' + h1Count;
                h1s.push({text: m[1], id: id});
                newLines.push('<h1 id="' + id + '">' + m[1] + ' <a href="#toc-top" class="toc-back-link">Back to TOC</a></h1>');
            } else {
                newLines.push(line);
            }
        });
        var toc = '';
        if (h1s.length > 0) {
            toc = '<div id="toc-top" class="toc-container"><strong>Table of Contents</strong><ul>' +
                h1s.map(function(h) { return '<li><a href="#' + h.id + '" class="toc-link">' + h.text + '</a></li>'; }).join('') +
                '</ul></div>';
        }
        var html = newLines.join('\n')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            // h1 already handled
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*\*(.*?)\*\*/gim, '<em>$1</em>')
            .replace(/\n---\n/g, '<hr>')
            .replace(/\n/g, '<br>');
        return toc + html;

        // Helper: render markdown table to HTML
        function renderTable(rows) {
            if (!rows || rows.length < 2) return rows.join('<br>');
            var header = rows[0].trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
            var align = [];
            var sep = rows[1].trim().replace(/^\||\|$/g, '').split('|');
            align = sep.map(function(cell) {
                cell = cell.trim();
                if (/^:-+:$/.test(cell)) return 'center';
                if (/^-+:$/.test(cell)) return 'right';
                if (/^:-+$/.test(cell)) return 'left';
                return '';
            });
            var bodyRows = rows.slice(2).map(function(row) {
                return row.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
            });
            var html = '<table class="md-table"><thead><tr>' +
                header.map(function(cell, i) {
                    var a = align[i] ? ' style="text-align:' + align[i] + ';"' : '';
                    return '<th' + a + '>' + cell + '</th>';
                }).join('') +
                '</tr></thead><tbody>' +
                bodyRows.map(function(cols) {
                    return '<tr>' + cols.map(function(cell, i) {
                        var a = align[i] ? ' style="text-align:' + align[i] + ';"' : '';
                        return '<td' + a + '>' + cell + '</td>';
                    }).join('') + '</tr>';
                }).join('') +
                '</tbody></table>';
            return html;
        }
    }

    function getAllMarkdownFiles() {
        var files = [];
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
                    content: window[key]
                });
            }
        }
        files.sort(function(a, b) {
            var na = parseInt(a.key.replace('md',''), 10);
            var nb = parseInt(b.key.replace('md',''), 10);
            return na-nb;
        });
        return files;
    }

    function injectMdMenuRibbon() {
        if (document.querySelector('.md-ribbon-dropdown')) return;
        var filesDropdown = document.querySelector('.files-dropdown');
        if (!filesDropdown) return;
        var mdFiles = getAllMarkdownFiles();
        if (mdFiles.length === 0) return;
        var mdRibbon = document.createElement('div');
        mdRibbon.className = 'md-ribbon-dropdown';
        mdRibbon.style.display = 'inline-block';
        mdRibbon.style.position = 'relative';
        mdRibbon.style.marginLeft = '8px';
        mdRibbon.innerHTML = '<button class="md-ribbon-btn" style="font-weight:bold;cursor:pointer;padding:10px 20px;border-radius:25px;border:none;background:#f0f2f5;">NoteY ▼</button>';
        var mdSubmenu = document.createElement('div');
        mdSubmenu.style.display = 'none';
        mdSubmenu.style.position = 'absolute';
        mdSubmenu.style.left = '0';
        mdSubmenu.style.top = '110%';
        mdSubmenu.style.background = '#fff';
        mdSubmenu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        mdSubmenu.style.borderRadius = '12px';
        mdSubmenu.style.minWidth = '120px';
        mdSubmenu.style.zIndex = '1001';
        mdSubmenu.style.padding = '8px 0';
        mdFiles.forEach(function(md) {
            var btn = document.createElement('button');
            btn.className = 'files-dropdown-item';
            btn.innerHTML = (md.emoji || '') + md.label;
            btn.type = 'button';
            btn.onclick = function(e) {
                e.stopPropagation();
                showMarkdown(md.key);
                mdSubmenu.style.display = 'none';
            };
            mdSubmenu.appendChild(btn);
        });
        mdRibbon.appendChild(mdSubmenu);
        mdRibbon.querySelector('.md-ribbon-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            mdSubmenu.style.display = (mdSubmenu.style.display === 'block') ? 'none' : 'block';
        });
        mdRibbon.addEventListener('mouseleave', function() {
            mdSubmenu.style.display = 'none';
        });
        filesDropdown.parentNode.insertBefore(mdRibbon, filesDropdown.nextSibling);
    }

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

    // Only search markdown files
    function addMarkdownSearch(container, currentMdKey) {
        var searchBox = document.createElement('div');
        searchBox.className = 'md-html-search-bar sticky-md-html-search-bar';
        searchBox.style.display = 'flex';
        searchBox.style.alignItems = 'center';
        searchBox.style.gap = '8px';
        searchBox.style.marginBottom = '12px';
        searchBox.innerHTML = '<input type="text" placeholder="Search within this page..." class="md-search-input" style="width:40%;min-width:120px;max-width:100%;padding:8px 12px;border-radius:6px;border:1px solid #ccc;font-size:15px;">' +
            '<button class="md-search-prev" style="padding:6px 10px;">&#8593;</button>' +
            '<button class="md-search-next" style="padding:6px 10px;">&#8595;</button>' +
            '<span class="md-search-count" style="min-width:120px;text-align:center;font-size:14px;color:#555;"></span>';
        container.prepend(searchBox);
        var input = searchBox.querySelector('.md-search-input');
        var prevBtn = searchBox.querySelector('.md-search-prev');
        var nextBtn = searchBox.querySelector('.md-search-next');
        var countSpan = searchBox.querySelector('.md-search-count');
        var mdContent = container.querySelector('.markdown-content');
        var mdFiles = getAllMarkdownFiles();
        var currentMdIdx = mdFiles.findIndex(f => f.key === currentMdKey);
        var allMatches = [];
        var currentGlobalIdx = 0;

        function updateHighlights(jumpToIdx) {
            var q = input.value.trim();
            allMatches = [];
            var counts = [];
            // Only search in the current file
            var md = mdFiles[currentMdIdx];
            var html = simpleMarkdownToHtml(md.content);
            var {html: highlighted, count} = highlightMatches(html, q);
            counts.push(count);
            md.html = highlighted;
            for (var j = 0; j < count; ++j) {
                allMatches.push({fileIdx: currentMdIdx, matchIdx: j});
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
            mdContent.innerHTML = md.html;
            var highlights = mdContent.querySelectorAll('.md-search-highlight');
            var localIdx = 0;
            if (allMatches.length > 0) {
                localIdx = allMatches[currentGlobalIdx].matchIdx;
                if (highlights[localIdx]) {
                    highlights[localIdx].classList.add('md-search-current');
                    highlights[localIdx].scrollIntoView({block:'center',behavior:'smooth'});
                }
            }
            var countText = count > 0 ? count + ' in ' + md.label : '';
            if (allMatches.length > 0) {
                countSpan.textContent = (currentGlobalIdx+1) + ' / ' + allMatches.length + (countText ? ' ('+countText+')' : '');
            } else {
                countSpan.textContent = '0 / 0';
            }
            var title = container.querySelector('.data-section-title');
            if (title) title.textContent = 'Markdown: ' + md.label;
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

    function showMarkdown(mdKey) {
        var root = document.getElementById('root');
        if (!root) return;
        var mdFiles = getAllMarkdownFiles();
        var md = mdFiles.find(f => f.key === mdKey);
        var label = md ? md.label : mdKey;
        var content = md ? md.content : '';
        root.innerHTML = '<div class="data-section"><div class="data-section-header"><span class="data-section-title">Markdown: ' + label + '</span></div>' +
            '<div class="markdown-content"></div></div>';
        var container = root.querySelector('.data-section');
        var mdContent = container.querySelector('.markdown-content');
        mdContent.innerHTML = simpleMarkdownToHtml(content);
        addMarkdownSearch(container, mdKey);
    }

    function tryInjectMdMenu() {
        // Remove MD from files dropdown if present
        var filesDropdown = document.querySelector('.files-dropdown-content');
        if (filesDropdown) {
            var mdMain = filesDropdown.querySelector('.files-md-main');
            if (mdMain) mdMain.remove();
        }
        injectMdMenuRibbon();
    }

    if (document.readyState !== 'loading') tryInjectMdMenu();
    else document.addEventListener('DOMContentLoaded', tryInjectMdMenu);

    var observer = new MutationObserver(function() {
        tryInjectMdMenu();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Add styles for highlight and responsive search bar
    var style = document.createElement('style');
    style.textContent = '.md-search-highlight { background: #fff3cd; color: #d35400; border-radius: 3px; padding: 1px 2px; } .md-search-current { background: #ff6b6b !important; color: #fff !important; } .md-html-search-bar .md-search-input { width: 40%; min-width: 120px; max-width: 100%; } @media (max-width: 600px) { .md-html-search-bar .md-search-input { width: 90%; min-width: 60px; } }';
    document.head.appendChild(style);

    // Expose for app8.js
    window.markdownSearchBar = addMarkdownSearch;
})();
