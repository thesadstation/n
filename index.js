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
            const filtered = allSongs.filter(song => song.title.toLowerCase().includes(searchTerm));
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

// ৪. রেন্ডার ইঞ্জিন (প্লেয়ারবিহীন ক্লিন কার্ড)
function renderSongs() {
    const songList = document.getElementById('song-list');
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    if (!songList) return;
    
    songList.innerHTML = ''; 
    displayedSongs.forEach(song => {
        const isFav = userFavorites.includes(String(song.id));
        const card = document.createElement('article'); // এসইও এর জন্য article ট্যাগ
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-header-meta">
                <img class="song-thumb" src="${song.thumbnail}" alt="${song.title}">
                <div class="song-info-block">
                    <h3 class="song-title">${song.title}</h3>
                    <p class="song-excerpt">${song.lyrics ? song.lyrics.substring(0, 70) + '...' : 'লিরিক্স ও ডিটেইলস দেখুন...'}</p>
                    <a href="song-detail.html?slug=${song.slug}" class="lyrics-link">বিস্তারিত দেখুন ও শুনুন</a>
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

// ৫. ইনিশিয়াল ফাংশন (লোগো, ব্যানার, সোশ্যাল সবকিছু লোড হবে)
async function initializePlatform() {
    // ব্র্যান্ডিং ও ব্যানার লোড
    db.collection("site_branding").doc("site_branding").get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const logo = document.getElementById('site-logo');
            const banner = document.getElementById('main-banner');
            if (logo && data.logo_url) { logo.src = data.logo_url; logo.style.display = 'block'; }
            if (banner && data.banner_url) { banner.src = data.banner_url; banner.style.display = 'block'; }
        }
    });

    // সোশ্যাল আইকন লোড
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
        const songSnap = await db.collection("songs").get();
        allSongs = songSnap.docs.map(doc => ({ id: String(doc.data().id), ...doc.data() }));
        displayedSongs = allSongs.slice(0, 10);
        renderSongs();
    } catch (e) { console.error(e); }

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
        
