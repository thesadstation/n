const db = window.db;

document.addEventListener('DOMContentLoaded', () => {
    initializePlatform();
    setupMenu();
    fetchBlogs();
    setupAuthLogout();
});

function setupMenu() {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (menuToggleBtn && dropdownMenu) {
        menuToggleBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            dropdownMenu.classList.toggle('show'); 
        });
        document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
    }
}

function setupAuthLogout() {
    const logoutBtn = document.getElementById('menu-logout');
    firebase.auth().onAuthStateChanged((user) => {
        if (logoutBtn) {
            logoutBtn.style.display = user ? 'block' : 'none';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            firebase.auth().signOut().then(() => { 
                window.location.href = "login.html"; 
            });
        });
    }
}

async function initializePlatform() {
    // সাইট ব্র্যান্ডিং এবং লোগো লোড করা
    db.collection("site_branding").doc("site_branding").get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const logo = document.getElementById('site-logo');
            if (logo && data.logo_url) {
                logo.src = data.logo_url;
                logo.style.display = 'block';
            }
        }
    });

    // সোশ্যাল লিঙ্ক লোড করা
    db.collection("site_branding").doc("social_links").get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const socialMap = { 
                telegram: "link-telegram", 
                youtube: "link-youtube", 
                facebook: "link-facebook", 
                instagram: "link-instagram", 
                tiktok: "link-tiktok" 
            };
            for (const [key, id] of Object.entries(socialMap)) {
                const el = document.getElementById(id);
                if (el && data[key]) { 
                    el.href = data[key]; 
                    el.style.display = 'inline-block'; 
                }
            }
        }
    });
}

async function fetchBlogs() {
    const blogList = document.getElementById('blog-list');
    const loader = document.getElementById('loader');
    
    try {
        // নতুন পোস্ট সবার আগে দেখানোর জন্য orderBy ব্যবহার
        const snapshot = await db.collection("posts")
                                 .orderBy("createdAt", "desc") 
                                 .get(); 
        
        loader.style.display = 'none';
        
        if (snapshot.empty) {
            blogList.innerHTML = "<p style='text-align:center; color:#888;'>বর্তমানে কোনো ব্লগ পোস্ট নেই।</p>";
            return;
        }

        snapshot.forEach(doc => {
            const post = doc.data();
            const card = document.createElement('article');
            card.className = 'song-card';
            
            card.innerHTML = `
                <div class="song-header-meta" itemscope itemtype="https://schema.org/BlogPosting">
                    <img class="song-thumb" src="${post.thumbnail}" alt="${post.title}" itemprop="image">
                    <div class="song-info-block">
                        <h3 class="blog-title" style="color: #fff; font-size: 1.2rem; margin-bottom: 8px;" itemprop="headline">${post.title}</h3>
                        <p class="song-excerpt" style="font-size: 0.9rem; color: #ccc;" itemprop="description">${post.metaDesc || 'বিস্তারিত পড়ুন...'}</p>
                        <a href="blog-detail.html?slug=${post.slug}" class="lyrics-link" style="display: inline-block; margin-top: 10px; color: #1db954; font-weight: bold;" itemprop="url">ব্লগটি পড়ুন</a>
                    </div>
                </div>
            `;
            blogList.appendChild(card);
        });
    } catch (e) {
        console.error("ব্লগ লোড করতে সমস্যা হয়েছে:", e);
        
        // ইনডেক্সিং এরর হ্যান্ডেলিং
        if (e.code === 'failed-precondition') {
            loader.innerHTML = "ডাটাবেস ইনডেক্সিং তৈরি হচ্ছে, দয়া করে কিছুক্ষণ অপেক্ষা করুন।";
        } else {
            loader.innerText = "ডাটা লোড করতে ব্যর্থ হয়েছে।";
        }
    }
}
