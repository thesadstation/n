// ১. গ্লোবাল ভেরিয়েবল
const db = window.db;
let allSongs = [];
let displayedSongs = [];
let userFavorites = []; 
let currentUser = null; 

// ২. DOMContentLoaded এবং মেনু ও সার্চ লজিক
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';
    
    initializePlatform();
    setupMenu();
    setupSearch();
    
    // নিশ্চিতভাবে পপ-আপ কল করা হচ্ছে
    setTimeout(setupAppInstallPrompt, 1000); 
});

function setupMenu() {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (menuToggleBtn && dropdownMenu) {
        menuToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); });
        document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allSongs.filter(song => song.title && song.title.toLowerCase().includes(searchTerm));
            displayedSongs = filtered.slice(0, 10);
            renderSongs();
            const noResults = document.getElementById('no-results');
            if (noResults) noResults.style.display = (filtered.length === 0) ? 'block' : 'none';
        });
    }
}

// ৩. ফেভারিট লজিক
window.toggleFavorite = async function(songId, buttonElement) {
    if (!currentUser || currentUser.email === "guest@thesadstation.com") {
        alert("পছন্দের তালিকায় গান যোগ করতে লগইন করুন!");
        window.location.href = "login.html";
        return;
    }
    songId = String(songId);
    const icon = buttonElement.querySelector('i');
    const favDocRef = db.collection("user_favorites").doc(`${currentUser.uid}_${songId}`);
    
    if (userFavorites.includes(songId)) {
        userFavorites = userFavorites.filter(id => id !== songId);
        buttonElement.classList.remove('active');
        icon.className = 'far fa-heart';
        await favDocRef.delete();
    } else {
        userFavorites.push(songId);
        buttonElement.classList.add('active');
        icon.className = 'fas fa-heart';
        await favDocRef.set({ user_id: currentUser.uid, song_id: songId, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    }
};

// ৪. রেন্ডার ইঞ্জিন
function renderSongs() {
    const songList = document.getElementById('song-list');
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    if (!songList) return;
    
    songList.innerHTML = ''; 
    displayedSongs.forEach(song => {
        const isFav = userFavorites.includes(String(song.id));
        const card = document.createElement('article');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-header-meta" itemscope itemtype="https://schema.org/MusicRecording">
                <img class="song-thumb" src="${song.thumbnail || ''}" alt="${song.title}" itemprop="image">
                <div class="song-info-block">
                    <h2 class="song-title" itemprop="name">${song.title || 'নাম নেই'}</h2>
                    <p class="song-excerpt" itemprop="description">${song.lyrics ? song.lyrics.substring(0, 70) + '...' : 'বিস্তারিত দেখুন...'}</p>
                    <a href="song-detail.html?slug=${song.slug || ''}" class="lyrics-link" itemprop="url">বিস্তারিত দেখুন ও শুনুন</a>
                </div>
                <button class="heart-btn ${isFav ? 'active' : ''}">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        `;
        card.querySelector('.heart-btn').addEventListener('click', (e) => window.toggleFavorite(song.id, e.currentTarget));
        songList.appendChild(card);
    });
}

// ৫. ইনিশিয়াল ফাংশন
async function initializePlatform() {
    db.collection("site_branding").doc("site_branding").get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const logo = document.getElementById('site-logo');
            const banner = document.getElementById('main-banner');
            if (logo && data.logo_url) { logo.src = data.logo_url; logo.style.display = 'block'; }
            if (banner && data.banner_url) { banner.src = data.banner_url; banner.style.display = 'block'; }
        }
    });

    db.collection("site_branding").doc("social_links").get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const socialMap = { telegram: "link-telegram", youtube: "link-youtube", facebook: "link-facebook", instagram: "link-instagram", tiktok: "link-tiktok" };
            for (const [key, id] of Object.entries(socialMap)) {
                const el = document.getElementById(id);
                if (el && data[key]) { el.href = data[key]; el.style.display = 'inline-block'; }
            }
        }
    });

    try {
        const songSnap = await db.collection("songs").orderBy("timestamp", "desc").get();
        allSongs = songSnap.docs.map(doc => ({ 
            id: String(doc.data().id || doc.id), 
            ...doc.data() 
        }));
        displayedSongs = allSongs.slice(0, 10);
        renderSongs();
    } catch (e) { 
        console.error("গান লোড এরর:", e); 
    }

    window.auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        const logoutBtn = document.getElementById('menu-logout');
        if (logoutBtn) logoutBtn.style.display = user ? 'block' : 'none';
        
        if (user && user.email !== "guest@thesadstation.com") {
            const favSnap = await db.collection("user_favorites").where("user_id", "==", user.uid).get();
            userFavorites = favSnap.docs.map(d => String(d.data().song_id));
            renderSongs();
        }
    });
}

// ৬. স্টাইলিশ অ্যাপ ইনস্টল পপ-আপ লজিক
function setupAppInstallPrompt() {
    if (document.getElementById("custom-install-banner")) return; // যাতে দুইবার তৈরি না হয়

    const installBanner = document.createElement('div');
    installBanner.id = "custom-install-banner";
    installBanner.style = `
        position: fixed; bottom: 0; left: 0; width: 100%; 
        background: #1a1a1a; color: #fff; padding: 15px; 
        text-align: center; z-index: 999999; box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
        border-top: 2px solid #ffeb3b; display: none;
    `;
    installBanner.innerHTML = `
        <div style="font-size: 14px; margin-bottom: 10px;">🌙 কষ্টের সুর, এখন আরও কাছে — The Sad Station App ❤️</div>
        <button id="btn-install" style="background: #ffeb3b; color: #000; border: none; padding: 10px 20px; border-radius: 25px; font-weight: bold; cursor: pointer; margin-right: 10px;">ডাউনলোড করুন</button>
        <button id="btn-close" style="background: transparent; color: #ccc; border: 1px solid #555; padding: 10px 15px; border-radius: 25px; cursor: pointer;">পরে</button>
    `;
    document.body.appendChild(installBanner);

    // পপ-আপ দেখানোর সময় ৩ সেকেন্ড
    setTimeout(() => { 
        installBanner.style.display = 'block'; 
    }, 3000);

    document.getElementById('btn-install').onclick = () => {
        window.open("https://www.appcreator24.com/app4091026-b1nsp3", "_blank");
        installBanner.style.display = 'none';
    };

    document.getElementById('btn-close').onclick = () => {
        installBanner.style.display = 'none';
    };
}
