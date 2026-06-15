// config.js থেকে গ্লোবাল উইন্ডো স্কোপের db অবজেক্টটি ব্যবহার করা হচ্ছে
const db = window.db;

// গ্লোবাল ভেরিয়েবলস
let allSongs = [];
let filteredSongs = [];
let userFavorites = []; 
let currentUser = null; 

// ৩-ডট মেনু লজিক
const threeDotBtn = document.getElementById('three-dot-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

if (threeDotBtn && dropdownMenu) {
    threeDotBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });
}

// 🔍 সার্চ লজিক (আপডেট করা হয়েছে)
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredSongs = allSongs.filter(song => 
            song.title.toLowerCase().includes(term)
        );
        
        if (filteredSongs.length === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
        renderSongs();
    });
}

// লগআউট লজিক
const logoutBtn = document.getElementById('menu-logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.auth.signOut().then(() => {
            window.location.reload(); 
        });
    });
}

// হার্ট আইকন লজিক
window.toggleFavorite = async function(songId, buttonElement) {
    const isGuest = currentUser ? (currentUser.email === "guest@thesadstation.com") : true;

    if (!currentUser || isGuest) {
        alert("পছন্দের তালিকায় গান যোগ করতে প্রথমে আসল অ্যাকাউন্ট দিয়ে লগইন করুন ভাই!");
        window.location.href = "login.html";
        return;
    }

    songId = String(songId);
    const icon = buttonElement.querySelector('i');
    const favDocRef = db.collection("user_favorites").doc(`${currentUser.uid}_${songId}`);

    const isCurrentlyFav = userFavorites.includes(songId);
    
    if (isCurrentlyFav) {
        userFavorites = userFavorites.filter(id => id !== songId);
        buttonElement.classList.remove('active');
        if (icon) icon.className = 'far fa-heart';
        await favDocRef.delete();
    } else {
        userFavorites.push(songId);
        buttonElement.classList.add('active');
        if (icon) icon.className = 'fas fa-heart';
        await favDocRef.set({
            user_id: currentUser.uid,
            song_id: songId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
};

// অডিও প্লেয়ার ইঞ্জিন
window.initAudioPlayer = function(cardElement, audioUrl) {
    const playPauseBtn = cardElement.querySelector('.play-pause-btn');
    const playIcon = playPauseBtn.querySelector('i');
    const seekSlider = cardElement.querySelector('.seek-slider');
    const currentTimeText = cardElement.querySelector('.current-time');
    const durationTimeText = cardElement.querySelector('.duration-time');

    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => durationTimeText.innerText = formatTime(audio.duration));

    playPauseBtn.addEventListener('click', () => {
        if (window.currentAudio && window.currentAudio !== audio) {
            window.currentAudio.pause();
            if (window.currentPlayBtn) window.currentPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            clearInterval(window.activeInterval);
        }

        if (audio.paused) {
            audio.play();
            playIcon.className = 'fas fa-pause';
            window.currentAudio = audio;
            window.currentPlayBtn = playPauseBtn;
            window.activeInterval = setInterval(() => {
                if (!audio.paused) {
                    seekSlider.value = (audio.currentTime / audio.duration) * 100 || 0;
                    currentTimeText.innerText = formatTime(audio.currentTime);
                }
            }, 500);
        } else {
            audio.pause();
            playIcon.className = 'fas fa-play';
            clearInterval(window.activeInterval);
        }
    });

    seekSlider.addEventListener('input', () => {
        audio.currentTime = audio.duration * (seekSlider.value / 100);
        currentTimeText.innerText = formatTime(audio.currentTime);
    });
};

function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// গান রেন্ডার ইঞ্জিন
function renderSongs() {
    const songList = document.getElementById('song-list');
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    if (!songList) return;
    songList.innerHTML = '';
    
    filteredSongs.forEach(song => {
        const isFav = userFavorites.includes(String(song.id));
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <div class="song-header-meta">
                <img class="song-thumb" src="${song.thumbnail_url}" alt="${song.title}">
                <div class="song-info-block">
                    <h3 class="song-title">${song.title}</h3>
                    <a href="song-detail.html?id=${song.id}" class="lyrics-link">লিরিক্স ও ডিটেইলস</a>
                </div>
                <button class="heart-btn ${isFav ? 'active' : ''}">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="custom-audio-player">
                <button class="play-pause-btn"><i class="fas fa-play"></i></button>
                <input type="range" class="seek-slider" min="0" max="100" value="0">
                <span class="current-time">0:00</span>
                <span class="duration-time">0:00</span>
                <a href="${song.audio_url}" download class="download-trigger" style="margin-left: 10px; color: #1db954;">
                    <i class="fas fa-download"></i>
                </a>
            </div>
        `;
        
        const heartBtn = songCard.querySelector('.heart-btn');
        heartBtn.addEventListener('click', () => window.toggleFavorite(song.id, heartBtn));
        
        songList.appendChild(songCard);
        window.initAudioPlayer(songCard, song.audio_url);
    });
}

// মূল ফাংশন
async function initializePlatform() {
    db.collection("site_branding").doc("site_branding").get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const logoImg = document.getElementById('site-logo');
            const bannerImg = document.getElementById('main-banner');
            if (logoImg && data.logo_url) { logoImg.src = data.logo_url; logoImg.style.display = 'block'; }
            if (bannerImg && data.banner_url) { bannerImg.src = data.banner_url; bannerImg.style.display = 'block'; }
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
        const songSnap = await db.collection("songs").get();
        allSongs = songSnap.docs.map(doc => ({ id: String(doc.data().id), ...doc.data() }));
        filteredSongs = [...allSongs];
    } catch (e) {
        console.error("গান লোড করতে সমস্যা:", e);
    }

    window.auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        const logoutMenuOption = document.getElementById('menu-logout');
        if (logoutMenuOption) logoutMenuOption.style.display = user ? 'block' : 'none';
        
        if (user && user.email !== "guest@thesadstation.com") {
            try {
                const favSnap = await db.collection("user_favorites").where("user_id", "==", user.uid).get();
                userFavorites = favSnap.docs.map(d => String(d.data().song_id));
            } catch (e) {
                userFavorites = [];
            }
        } else {
            userFavorites = [];
        }
        renderSongs();
    });
}

initializePlatform();
