document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
    const menuIcon = document.getElementById('menu-icon');
    const sidenav = document.getElementById('sidenav');
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const loginNavLink = document.getElementById('login-nav-link');
    const loginModal = document.getElementById('login-modal');
    const loginSubmitBtn = document.getElementById('login-submit-btn');

    // --- 状態管理 ---
    let isLoggedIn = false;
    let photos = []; // 写真データのコンテナ

    // --- モックデータ & LocalStorage ---
    const initialPhotos = [
        { id: 1, src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', title: 'Iceland', comment: '自然の力にただただ圧倒された、忘れられない瞬間。', isBest: true },
        { id: 2, src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop', title: 'Switzerland', comment: '静寂に包まれた山小屋からの朝焼け。心が洗われるようだった。', isBest: true },
        { id: 3, src: 'https://images.unsplash.com/photo-1511525499366-e30a35f1636b?q=80&w=800&auto=format&fit=crop', title: 'Kyoto, Japan', comment: '光と影が織りなす幻想的な空間。日本の美を再発見。', isBest: true },
        { id: 4, src: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop', title: 'Tokyo, Japan', comment: '眠らない街、東京。無数の光が未来を照らしているようだった。', isBest: false }
    ];

    function loadData() {
        const savedPhotos = localStorage.getItem('shunYamanouchiPhotos');
        if (savedPhotos) {
            photos = JSON.parse(savedPhotos);
        } else {
            photos = initialPhotos;
        }
        renderAll();
    }

    function saveData() {
        localStorage.setItem('shunYamanouchiPhotos', JSON.stringify(photos));
    }

    // --- レンダリング関数 ---
    function renderBest3() {
        const container = document.getElementById('best3-container');
        container.innerHTML = '';
        const bestPhotos = photos.filter(p => p.isBest);
        bestPhotos.forEach(photo => {
            container.innerHTML += `
                <div class="best3-item">
                    <img src="${photo.src}" alt="${photo.title}">
                    <div class="caption">
                        <h3>${photo.title}</h3>
                        <p>${photo.comment}</p>
                    </div>
                </div>
            `;
        });
    }

    function renderFullGallery() {
        const container = document.getElementById('full-gallery-container');
        container.innerHTML = '';
        photos.forEach(photo => {
            container.innerHTML += `
                <div class="gallery-photo">
                    <img src="${photo.src}" alt="${photo.title}">
                </div>
            `;
        });
    }
    
    function renderAdminGallery() {
        const container = document.getElementById('admin-gallery-grid');
        container.innerHTML = '';
        photos.forEach(photo => {
            container.innerHTML += `
                <div class="admin-photo">
                    <img src="${photo.src}" alt="${photo.title}">
                    <input type="checkbox" class="best3-checkbox" data-id="${photo.id}" ${photo.isBest ? 'checked' : ''}>
                </div>
            `;
        });
        addCheckboxListeners();
    }
    
    function renderAll() {
        renderBest3();
        renderFullGallery();
        if(isLoggedIn) renderAdminGallery();
    }

    // --- ナビゲーション & ページ切り替え ---
    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        sidenav.classList.toggle('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;

            if (targetId === 'login') {
                isLoggedIn ? showPage('admin') : loginModal.style.display = 'block';
            } else {
                showPage(targetId);
            }

            // メニューを閉じる
            menuIcon.classList.remove('open');
            sidenav.classList.remove('open');
        });
    });

    function showPage(pageId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`page-${pageId}`).classList.add('active');
    }

    // --- ログイン処理 (シミュレーション) ---
    loginModal.querySelector('.close-btn').addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    
    loginSubmitBtn.addEventListener('click', () => {
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');

        if (id === 'Ys2025' && pass === '00001111') {
            isLoggedIn = true;
            loginModal.style.display = 'none';
            loginNavLink.textContent = 'Admin Panel';
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
    // 写真アップロード
    document.getElementById('upload-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('photo-upload-input');
        const title = document.getElementById('upload-title').value;
        const comment = document.getElementById('upload-comment').value;

        if (fileInput.files.length > 0 && title && comment) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newPhoto = {
                    id: Date.now(),
                    src: e.target.result,
                    title: title,
                    comment: comment,
                    isBest: false
                };
                photos.unshift(newPhoto); // 新しい写真を先頭に追加
                saveData();
                renderAll();
                // フォームをリセット
                fileInput.value = '';
                document.getElementById('upload-title').value = '';
                document.getElementById('upload-comment').value = '';
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            alert('画像を選択し、タイトルとコメントを入力してください。');
        }
    });

    // Best3選択
    function addCheckboxListeners() {
        document.querySelectorAll('.best3-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const selectedId = parseInt(e.target.dataset.id);
                const bestCount = photos.filter(p => p.isBest).length;

                if (e.target.checked && bestCount >= 3) {
                    alert('Best3は3枚までしか選択できません。');
                    e.target.checked = false;
                    return;
                }

                const photoToUpdate = photos.find(p => p.id === selectedId);
                if (photoToUpdate) {
                    photoToUpdate.isBest = e.target.checked;
                    saveData();
                    renderBest3(); // トップページも即時更新
                }
            });
        });
    }

    // --- 初期化 ---
    loadData();
});