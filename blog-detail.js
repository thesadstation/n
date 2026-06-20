const db = window.db;

document.addEventListener('DOMContentLoaded', () => {
    initializePlatform();
    setupMenu();
    setupAuthLogout();
    
    // URL থেকে slug সংগ্রহ করা
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (slug) {
        fetchBlogDetail(slug);
    } else {
        document.getElementById('loader').innerText = "ব্লগটি খুঁজে পাওয়া যায়নি।";
    }
});

// ব্লগ ডিটেইলস ফেচ করা
async function fetchBlogDetail(slug) {
    const loader = document.getElementById('loader');
    const blogPost = document.getElementById('blog-post');
    
    try {
        const snapshot = await db.collection("posts").where("slug", "==", slug).get();
        
        if (snapshot.empty) {
            loader.innerText = "ব্লগটি পাওয়া যায়নি।";
            return;
        }

        const doc = snapshot.docs[0];
        const post = doc.data();

        // কন্টেন্ট আপডেট করা
        document.getElementById('post-title').innerText = post.title;
        document.getElementById('post-thumb').src = post.thumbnail;
        document.getElementById('post-content').innerHTML = post.content || post.metaDesc;
        
        // ইউআই আপডেট
        loader.style.display = 'none';
        blogPost.style.display = 'block';
        document.title = post.title + " | The Sad Station";
    } catch (e) {
        console.error("ব্লগ লোড এরর:", e);
        loader.innerText = "ব্লগ লোড করতে সমস্যা হয়েছে।";
    }
}

// মেনু লজিক
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

// লগআউট লজিক
function setupAuthLogout() {
    const logoutBtn = document.getElementById('menu-logout');
    firebase.auth().onAuthStateChanged((user) => {
        if (logoutBtn) logoutBtn.style.display = user ? 'block' : 'none';
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            firebase.auth().signOut().then(() => { window.location.href = "login.html"; });
        });
    }
}

// ব্র্যান্ডিং ও সোশ্যাল লিঙ্ক লোড
async function initializePlatform() {
    db.collection("site_branding").doc("site_branding").get().then(doc => {
        if (doc.exists && doc.data().logo_url) {
            const logo = document.getElementById('site-logo');
            logo.src = doc.data().logo_url;
            logo.style.display = 'block';
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
}
