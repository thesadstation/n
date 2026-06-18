document.addEventListener('DOMContentLoaded', () => {
    // Firebase থেকে db এবং auth অবজেক্ট সরাসরি ব্যবহার করবেন
    const auth = window.auth; 
    const db = window.db;

    // ১. ইউজার অথেন্টিকেশন চেক
    auth.onAuthStateChanged((user) => {
        if (user) {
            // যদি ইউজার লগইন থাকে, তবে ড্যাশবোর্ড দেখাও
            const dashboardContent = document.getElementById('main-dashboard-content');
            if (dashboardContent) {
                dashboardContent.style.display = 'block';
            }
            // ডাটা লোড করো
            loadDashboardStats();
        } else {
            // লগইন না থাকলে লগইন পেজে পাঠিয়ে দাও
            window.location.href = "login.html";
        }
    });

    // ২. লগআউট বাটন ফাংশন
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("ভাই, আপনি কি নিশ্চিত যে লগআউট করতে চান?")) {
                auth.signOut().then(() => {
                    window.location.href = "login.html"; // আপনার লগইন ফাইলের নাম অনুযায়ী ঠিক করুন
                }).catch(err => alert("লগআউট করতে সমস্যা হয়েছে: " + err.message));
            }
        });
    }
});

// ৩. ডাটাবেজ থেকে ডাটা নিয়ে আসার ফাংশন
async function loadDashboardStats() {
    try {
        // মোট গানের সংখ্যা
        const songsSnapshot = await db.collection("songs").get();
        const songsCountElement = document.getElementById('total-songs-count');
        if (songsCountElement) {
            songsCountElement.innerText = songsSnapshot.size;
        }

        // মোট ইউজারের সংখ্যা
        const usersSnapshot = await db.collection("users").get();
        const usersCountElement = document.getElementById('total-users-count');
        if (usersCountElement) {
            usersCountElement.innerText = usersSnapshot.size;
        }
    } catch (err) {
        console.error("ডাটা লোড করতে সমস্যা হয়েছে:", err);
        // যদি ডাটা না আসে তবে 0 দেখিয়ে রাখবে
        const usersCountElement = document.getElementById('total-users-count');
        if (usersCountElement) usersCountElement.innerText = "0";
    }
}
