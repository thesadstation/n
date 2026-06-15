document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = window.db;
    const brandingForm = document.getElementById('branding-form');
    const logoInput = document.getElementById('branding-logo');
    const bannerInput = document.getElementById('branding-banner');
    const wrapperDiv = document.getElementById('logo-settings-wrapper');

    // 🔒 মেইন সিকিউরিটি চেক: লগইন না থাকলে সরাসরি বের করে দেওয়া
    auth.onAuthStateChanged((user) => {
        if (user) {
            // ইউজার লগইন থাকলে পেজের কন্টেন্ট স্ক্রিনে দেখাও ভাই
            if (wrapperDiv) wrapperDiv.style.display = 'block';
            
            // ডাটাবেজ থেকে আগের জমানো সেটিংস নিয়ে আসা
            fetchBrandingData();
        } else {
            // লগইন ছাড়া আসলে সোজা লগইন পেজে রিডাইরেক্ট
            window.location.href = "login.html";
        }
    });

    // 🔄 ফায়ারস্টোর থেকে লোগো ও ব্যানার ডাটা ফেচ করার ফাংশন
    function fetchBrandingData() {
        db.collection("site_branding").doc("site_branding").get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    // ডাটাবেজে লিংক থাকলে ইনপুট বক্সে সেট করো ভাই
                    if (data.logo_url && logoInput) logoInput.value = data.logo_url;
                    if (data.banner_url && bannerInput) bannerInput.value = data.banner_url;
                }
            })
            .catch(err => console.error("Error loading branding data:", err));
    }

    // 💾 নতুন লোগো/ব্যানার লিংক ডাটাবেজে সেভ করার লজিক
    if (brandingForm) {
        brandingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const logoUrl = logoInput.value.trim();
            const bannerUrl = bannerInput.value.trim();

            // ফায়ারস্টোরে merge: true দিয়ে আপডেট করা, যাতে আগের অন্য ডাটা ডিলিট না হয়
            db.collection("site_branding").doc("site_branding").set({
                logo_url: logoUrl,
                banner_url: bannerUrl
            }, { merge: true })
            .then(() => {
                alert("ভাই, লোগো এবং ব্যানার সফলভাবে আপডেট হয়েছে! 🎉");
            })
            .catch((error) => {
                console.error("Error updating branding:", error);
                alert("দুঃখিত ভাই, ডাটা সেভ করা যায়নি। আবার চেষ্টা করুন।");
            });
        });
    }
});
