// app9.js - Video Gallery Viewer
(function() {
    function parseCSV(data) {
        var lines = data.trim().split(/\r?\n/);
        var headers = lines[0].split(',');
        return lines.slice(1).map(function(line) {
            var values = line.split(',');
            var obj = {};
            headers.forEach(function(h, i) { obj[h.trim()] = (values[i]||'').trim(); });
            return obj;
        });
    }

    function createVideoElement(video) {
        var container = document.createElement('div');
        container.className = 'video-card';
        var title = document.createElement('div');
        title.className = 'video-title';
        title.textContent = video.Title;
        var desc = document.createElement('div');
        desc.className = 'video-desc';
        desc.textContent = video.Description;
        container.appendChild(title);
        container.appendChild(desc);
        // YouTube or shorturl
        if (video.longurl && video.longurl.match(/youtube\.com|youtu\.be/)) {
            var iframe = document.createElement('iframe');
            iframe.width = '360';
            iframe.height = '215';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            // Convert shorts or watch to embed
            var embedUrl = video.longurl.replace('/shorts/', '/embed/').replace('watch?v=', 'embed/');
            iframe.src = embedUrl;
            container.appendChild(iframe);
        } else if (video.longurl && video.longurl.match(/\.mp4$/)) {
            var videoEl = document.createElement('video');
            videoEl.controls = true;
            videoEl.width = 360;
            videoEl.src = video.longurl;
            container.appendChild(videoEl);
        } else if (video.shorturl) {
            var a = document.createElement('a');
            a.href = video.shorturl;
            a.target = '_blank';
            a.textContent = video.shorturl;
            container.appendChild(a);
        }
        return container;
    }

    function showVideoGallery() {
        var root = document.getElementById('root');
        if (!root) return;
        var videos = parseCSV(window.data9Videos2 || '');
        root.innerHTML = '<div class="data-section"><div class="data-section-header"><span class="data-section-title">Video Gallery</span></div>' +
            '<div class="video-card-grid"></div></div>';
        var grid = root.querySelector('.video-card-grid');
        videos.forEach(function(video) {
            grid.appendChild(createVideoElement(video));
        });
    }

    // Add Videos dropdown next to Files dropdown
    function injectVideosMenuRibbon() {
        if (document.querySelector('.videos-ribbon-dropdown')) return;
        var filesDropdown = document.querySelector('.files-dropdown');
        if (!filesDropdown) return;
        var videosRibbon = document.createElement('div');
        videosRibbon.className = 'videos-ribbon-dropdown';
        videosRibbon.style.display = 'inline-block';
        videosRibbon.style.position = 'relative';
        videosRibbon.style.marginLeft = '8px';
        videosRibbon.innerHTML = '<button class="videos-ribbon-btn" style="font-weight:bold;cursor:pointer;padding:10px 20px;border-radius:25px;border:none;background:#f0f2f5;">🎥 Videos2 ▼</button>';
        var videosSubmenu = document.createElement('div');
        videosSubmenu.style.display = 'none';
        videosSubmenu.style.position = 'absolute';
        videosSubmenu.style.left = '0';
        videosSubmenu.style.top = '110%';
        videosSubmenu.style.background = '#fff';
        videosSubmenu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        videosSubmenu.style.borderRadius = '12px';
        videosSubmenu.style.minWidth = '120px';
        videosSubmenu.style.zIndex = '1001';
        videosSubmenu.style.padding = '8px 0';
        var btn = document.createElement('button');
        btn.className = 'files-dropdown-item';
        btn.textContent = 'Show All Videos';
        btn.type = 'button';
        btn.onclick = function(e) {
            e.stopPropagation();
            showVideoGallery();
            videosSubmenu.style.display = 'none';
        };
        videosSubmenu.appendChild(btn);
        videosRibbon.appendChild(videosSubmenu);
        videosRibbon.querySelector('.videos-ribbon-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            videosSubmenu.style.display = (videosSubmenu.style.display === 'block') ? 'none' : 'block';
        });
        videosRibbon.addEventListener('mouseleave', function() {
            videosSubmenu.style.display = 'none';
        });
        filesDropdown.parentNode.insertBefore(videosRibbon, filesDropdown.nextSibling);
    }

    if (document.readyState !== 'loading') injectVideosMenuRibbon();
    else document.addEventListener('DOMContentLoaded', injectVideosMenuRibbon);

    var observer = new MutationObserver(function() {
        injectVideosMenuRibbon();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Add minimal styles for video grid
    var style = document.createElement('style');
    style.textContent = '.video-card-grid { display: flex; flex-wrap: wrap; gap: 24px; margin: 32px 0; } .video-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 16px; width: 380px; display: flex; flex-direction: column; align-items: flex-start; transition: box-shadow 0.2s; } .video-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.16); } .video-title { font-weight: bold; font-size: 1.1em; margin-bottom: 6px; } .video-desc { color: #555; font-size: 0.97em; margin-bottom: 8px; }';
    document.head.appendChild(style);
})();
