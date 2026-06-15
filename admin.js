// ড্যাশবোর্ডের জন্য সম্পূর্ণ আপডেটেড স্ক্রিপ্ট
document.addEventListener('DOMContentLoaded', () => {
    // config.js থেকে গ্লোবাল অবজেক্ট ব্যবহার করা হচ্ছে
    const auth = window.auth; 
    const db = window.db;

    // 🔒 সিকিউরিটি চেক: ইউজার লগইন আছে কিনা
    auth.onAuthStateChanged((user) => {
        if (user) {
            const dashboardContent = document.getElementById('main-dashboard-content');
            if (dashboardContent) {
                dashboardContent.style.display = 'block';
            }
            // ডাটা লোড করো
            loadDashboardStats(db);
        } else {
            window.location.href = "login.html";
        }
    });

    // 🚪 লগআউট বাটন কন্ট্রোলার
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("ভাই, আপনি কি নিশ্চিত যে লগআউট করতে চান?")) {
                auth.signOut().then(() => {
                    window.location.href = "admin-login.html";
                }).catch(err => alert("লগআউট করতে সমস্যা হয়েছে ভাই: " + err.message));
            }
        });
    }
});

// 📊 ডাটাবেজ থেকে গান এবং ইউজারের লাইভ সংখ্যা গণনা করার ফাংশন
function loadDashboardStats(db) {
    // ক. মোট গানের সংখ্যা কাউন্ট করা
    db.collection("songs").get()
        .then((snapshot) => {
            const songsCountId = document.getElementById('total-songs-count');
            if (songsCountId) songsCountId.innerText = snapshot.size;
        })
        .catch(err => console.error("Error counting songs:", err));

    // খ. 'users' কালেকশন থেকে মোট ইউজারের সংখ্যা কাউন্ট করা
    db.collection("users").get()
        .then((snapshot) => {
            const usersCountId = document.getElementById('total-users-count');
            if (usersCountId) {
                usersCountId.innerText = snapshot.size;
                console.log("মোট ইউজার সংখ্যা:", snapshot.size);
            }
        })
        .catch(err => {
            console.error("Error counting users:", err);
            const usersCountId = document.getElementById('total-users-count');
            if (usersCountId) usersCountId.innerText = "!";
        });
}
