document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
    const siteHeader = document.getElementById('site-header');
    const logo = document.getElementById('logo');
    const menuIcon = document.getElementById('menu-icon');
    const sidenav = document.getElementById('sidenav');
    const navLinks = document.querySelectorAll('.nav-link');
    const loginNavLink = document.getElementById('login-nav-link');
    const loginModal = document.getElementById('login-modal');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const moreBtn = document.getElementById('more-btn');
    const sortControls = document.getElementById('sort-controls');
    const photoViewerModal = document.getElementById('photo-viewer-modal');
    const prevPhotoBtn = document.getElementById('prev-photo-btn');
    const nextPhotoBtn = document.getElementById('next-photo-btn');
    const toast = document.getElementById('toast-notification');
    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');

    // --- 状態管理 ---
    let isLoggedIn = false;
    let photos = [];
    let currentSortOrder = 'new';
    let currentPhotoList = [];
    let currentPhotoIndex = 0;

    // --- モックデータ & LocalStorage ---
    const initialPhotos = [
        { id: 1, uploadDate: new Date('2025-07-18T12:00:00Z'), src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', title: 'Iceland', location: 'Skógafoss, Iceland', comment: '自然の力にただただ圧倒された、忘れられない瞬間。', isBest: true },
        { id: 2, uploadDate: new Date('2025-07-19T12:00:00Z'), src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop', title: 'Switzerland', location: 'Grindelwald, Switzerland', comment: '静寂に包まれた山小屋からの朝焼け。心が洗われるようだった。', isBest: true },
        { id: 3, uploadDate: new Date('2025-07-20T12:00:00Z'), src: 'https://images.unsplash.com/photo-1511525499366-e30a35f1636b?q=80&w=800&auto=format&fit=crop', title: 'Kyoto, Japan', location: '嵐山竹林の小径', comment: '光と影が織りなす幻想的な空間。日本の美を再発見。', isBest: true },
        { id: 4, uploadDate: new Date('2025-07-15T12:00:00Z'), src: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop', title: 'Tokyo, Japan', location: '東京都 新宿区', comment: '眠らない街、東京。無数の光が未来を照らしているようだった。', isBest: false }
    ];

    function loadData() {
        const savedPhotos = localStorage.getItem('shunYamanouchiPhotos');
        photos = savedPhotos ? JSON.parse(savedPhotos) : initialPhotos;
        renderAll();
    }

    function saveData() {
        localStorage.setItem('shunYamanouchiPhotos', JSON.stringify(photos));
    }

    // --- ロゴアニメーション設定 ---
    function setupLogoAnimation() {
        const logoText = "Shun Yamanouchi";
        logo.innerHTML = logoText.split('').map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    }

    // --- レンダリング関数 ---
    function renderBest3() {
        const container = document.getElementById('best3-container');
        const bestPhotos = photos.filter(p => p.isBest);
        container.innerHTML = '';
        if (bestPhotos.length === 0) {
            container.innerHTML = '<p class="no-content-message">Best Photosが選択されていません。</p>';
            return;
        }
        bestPhotos.forEach((photo, index) => {
            container.innerHTML += `
                <div class="best3-item" data-id="${photo.id}">
                    <img src="${photo.src}" alt="${photo.title}">
                    <div class="best3-rank-tag">${index + 1}</div>
                    <div class="caption">
                        <h3>${photo.title}</h3>
                        <p>${photo.comment}</p>
                    </div>
                </div>`;
        });
    }

    function getSortedFullGalleryIds() {
        const bestPhotos = photos.filter(p => p.isBest);
        let otherPhotos = photos.filter(p => !p.isBest);
        if (currentSortOrder === 'new') {
            otherPhotos.sort((a, b) => b.id - a.id);
        } else {
            otherPhotos.sort((a, b) => a.id - b.id);
        }
        return [...bestPhotos, ...otherPhotos].map(p => p.id);
    }

    function renderFullGallery() {
        const container = document.getElementById('full-gallery-container');
        container.innerHTML = '';
        if (photos.length === 0) {
            container.innerHTML = '<p class="no-content-message">写真がありません。</p>';
            return;
        }
        const sortedIds = getSortedFullGalleryIds();
        sortedIds.forEach(id => {
            const photo = photos.find(p => p.id === id);
            container.innerHTML += `<div class="gallery-photo" data-id="${photo.id}"><img src="${photo.src}" alt="${photo.title}"></div>`;
        });
    }
    
    function renderAdminGallery() {
        const container = document.getElementById('admin-gallery-grid');
        container.innerHTML = '';
        if (photos.length === 0) {
            container.innerHTML = '<p class="no-content-message">写真がありません。アップロードしてください。</p>';
            return;
        }
        photos.sort((a,b) => b.id - a.id).forEach(photo => {
            const bestButtonText = photo.isBest ? 'Best 3から解除' : 'Best 3に設定';
            container.innerHTML += `
                <div class="admin-photo">
                    <img src="${photo.src}" alt="${photo.title}">
                    <button class="photo-menu-btn" data-id="${photo.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                    <div class="photo-context-menu" data-id="${photo.id}">
                        <button class="context-menu-btn" data-action="toggleBest" data-id="${photo.id}">${bestButtonText}</button>
                        <button class="context-menu-btn delete" data-action="delete" data-id="${photo.id}">削除</button>
                    </div>
                </div>`;
        });
    }
    
    function renderAll() {
        renderBest3();
        renderFullGallery();
        if(isLoggedIn) renderAdminGallery();
    }

    // --- イベントリスナー ---
    logo.addEventListener('click', () => {
        showPage('home');
        closeMenu();
    });

    menuIcon.addEventListener('click', () => {
        siteHeader.classList.toggle('menu-open');
        menuIcon.classList.toggle('open');
        sidenav.classList.toggle('open');
    });
    
    function closeMenu() {
        siteHeader.classList.remove('menu-open');
        menuIcon.classList.remove('open');
        sidenav.classList.remove('open');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            targetId === 'login' ? (isLoggedIn ? showPage('admin') : loginModal.classList.add('active')) : showPage(targetId);
            closeMenu();
        });
    });

    moreBtn.addEventListener('click', () => showPage('gallery'));

    sortControls.addEventListener('click', (e) => {
        if (e.target.classList.contains('sort-btn')) {
            const newSortOrder = e.target.dataset.sort;
            if (newSortOrder !== currentSortOrder) {
                currentSortOrder = newSortOrder;
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderFullGallery();
            }
        }
    });

    window.addEventListener('scroll', () => {
        siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    });

    function showPage(pageId) {
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        document.getElementById(`page-${pageId}`).classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeTarget = (pageId === 'admin') ? 'login' : pageId;
        document.querySelector(`.nav-link[data-target="${activeTarget}"]`)?.classList.add('active');
    }

    // --- ログイン処理 ---
    const closeLoginBtn = loginModal.querySelector('.close-btn');
    function closeLoginModal() { loginModal.classList.remove('active'); }
    closeLoginBtn.addEventListener('click', closeLoginModal);
    loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });

    loginSubmitBtn.addEventListener('click', () => {
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');

        if (id === 'Ys2025' && pass === '00001111') {
            isLoggedIn = true;
            closeLoginModal();
            loginNavLink.textContent = '管理パネル';
            loginNavLink.dataset.target = 'admin';
            document.getElementById('login-id').value = '';
            document.getElementById('login-password').value = '';
            errorMsg.textContent = '';
            renderAdminGallery();
            showPage('admin');
        } else {
            errorMsg.textContent = 'IDまたはパスワードが正しくありません。';
        }
    });
    
    // --- 管理画面機能 ---
    uploadBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('photo-upload-input');
        const titleInput = document.getElementById('upload-title');
        const locationInput = document.getElementById('upload-location');
        const commentInput = document.getElementById('upload-comment');
        
        const title = titleInput.value;
        const location = locationInput.value;
        const comment = commentInput.value;
        const file = fileInput.files[0];

        if (file) {
            uploadBtn.disabled = true;
            progressContainer.classList.add('visible');
            progressBar.style.width = '0%';
            
            const reader = new FileReader();

            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentLoaded = Math.round((event.loaded / event.total) * 100);
                    progressBar.style.width = percentLoaded + '%';
                }
            };

            reader.onload = function(e) {
                photos.unshift({ 
                    id: Date.now(), 
                    uploadDate: new Date().toISOString(),
                    src: e.target.result, 
                    title,
                    location,
                    comment, 
                    isBest: false 
                });
                saveData();
                renderAll();
                showToast('アップロードしました');
                
                setTimeout(() => {
                    progressContainer.classList.remove('visible');
                    progressBar.style.width = '0%';
                    uploadBtn.disabled = false;
                    fileInput.value = ''; 
                    titleInput.value = '';
                    locationInput.value = '';
                    commentInput.value = '';
                }, 500);
            };

            reader.onerror = function() {
                showToast('ファイルの読み込みに失敗しました');
                uploadBtn.disabled = false;
                progressContainer.classList.remove('visible');
                progressBar.style.width = '0%';
            };

            reader.readAsDataURL(file);
        } else {
            alert('画像を選択してください。');
        }
    });

    const adminGrid = document.getElementById('admin-gallery-grid');
    adminGrid.addEventListener('click', (e) => {
        const target = e.target;
        const photoMenuBtn = target.closest('.photo-menu-btn');
        const contextMenuBtn = target.closest('.context-menu-btn');

        if (photoMenuBtn) {
            const photoId = parseInt(photoMenuBtn.dataset.id);
            const menu = document.querySelector(`.photo-context-menu[data-id='${photoId}']`);
            const isAlreadyActive = menu.classList.contains('active');
            document.querySelectorAll('.photo-context-menu').forEach(m => m.classList.remove('active'));
            if (!isAlreadyActive) menu.classList.add('active');
        } else if (contextMenuBtn) {
            const photoId = parseInt(contextMenuBtn.dataset.id);
            const action = contextMenuBtn.dataset.action;
            
            if (action === 'toggleBest') {
                const photo = photos.find(p => p.id === photoId);
                if (!photo.isBest && photos.filter(p => p.isBest).length >= 3) {
                    alert('Best3は3枚までしか選択できません。');
                    return;
                }
                photo.isBest = !photo.isBest;
                showToast(photo.isBest ? 'Best 3に設定しました' : 'Best 3から解除しました');
            } else if (action === 'delete') {
                if (confirm('この写真を本当に削除しますか？この操作は元に戻せません。')) {
                    photos = photos.filter(p => p.id !== photoId);
                    showToast('写真を削除しました');
                }
            }
            saveData();
            renderAll();

        } else if (!target.closest('.admin-photo')) {
            document.querySelectorAll('.photo-context-menu').forEach(m => m.classList.remove('active'));
        }
    });
    
    // --- 写真詳細表示 (ライトボックス) ---
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}.${day}`;
    }

    function updateViewerContent(photoId) {
        const photo = photos.find(p => p.id === photoId);
        if (!photo) return;
        document.getElementById('viewer-img').src = photo.src;
        document.getElementById('viewer-title').textContent = photo.title || '無題';
        document.getElementById('viewer-date').textContent = formatDate(photo.uploadDate);
        
        const locationEl = document.getElementById('viewer-location');
        if (photo.location) {
            locationEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span>${photo.location}</span>`;
            locationEl.style.display = 'flex';
        } else {
            locationEl.style.display = 'none';
        }

        document.getElementById('viewer-comment').textContent = photo.comment;
    }

    function openPhotoViewer(photoId, photoIdList) {
        currentPhotoList = photoIdList;
        currentPhotoIndex = currentPhotoList.indexOf(photoId);
        updateViewerContent(photoId);
        photoViewerModal.classList.add('active');
    }

    function closePhotoViewer() {
        photoViewerModal.classList.remove('active');
    }

    document.getElementById('best3-container').addEventListener('click', (e) => {
        const photoEl = e.target.closest('.best3-item');
        if (photoEl) {
            const photoId = parseInt(photoEl.dataset.id);
            const bestPhotoIds = photos.filter(p => p.isBest).map(p => p.id);
            openPhotoViewer(photoId, bestPhotoIds);
        }
    });

    document.getElementById('full-gallery-container').addEventListener('click', (e) => {
        const photoEl = e.target.closest('.gallery-photo');
        if (photoEl) {
            const photoId = parseInt(photoEl.dataset.id);
            openPhotoViewer(photoId, getSortedFullGalleryIds());
        }
    });
    
    photoViewerModal.querySelector('.viewer-close-btn').addEventListener('click', closePhotoViewer);
    photoViewerModal.addEventListener('click', (e) => { if (e.target === photoViewerModal) closePhotoViewer(); });

    nextPhotoBtn.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotoList.length;
        updateViewerContent(currentPhotoList[currentPhotoIndex]);
    });

    prevPhotoBtn.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotoList.length) % currentPhotoList.length;
        updateViewerContent(currentPhotoList[currentPhotoIndex]);
    });

    // --- 通知機能 ---
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000); // 3秒後に非表示
    }

    // --- キーボード操作 ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (loginModal.classList.contains('active')) closeLoginModal();
            if (photoViewerModal.classList.contains('active')) closePhotoViewer();
        }
        if (photoViewerModal.classList.contains('active')) {
            if (e.key === 'ArrowRight') nextPhotoBtn.click();
            if (e.key === 'ArrowLeft') prevPhotoBtn.click();
        }
    });

    // --- 初期化 ---
    setupLogoAnimation();
    loadData();
    showPage('home');
});