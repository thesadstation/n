document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore(); // window.db এর বদলে সরাসরি firebase.firestore() ব্যবহার করা ভালো
    const brandingForm = document.getElementById('branding-form');
    const logoInput = document.getElementById('branding-logo');
    const bannerInput = document.getElementById('branding-banner');
    const wrapperDiv = document.getElementById('logo-settings-wrapper');
    const MY_ADMIN_EMAIL = "atik89084@gmail.com"; // তোমার ইমেইল

    // 🔒 মেইন সিকিউরিটি চেক: ইমেইল ভেরিফিকেশন সহ
    auth.onAuthStateChanged((user) => {
        if (user && user.email === MY_ADMIN_EMAIL) {
            // ইউজার এডমিন হলে কন্টেন্ট দেখাও
            if (wrapperDiv) wrapperDiv.style.display = 'block';
            fetchBrandingData();
        } else {
            // লগইন না থাকলে বা এডমিন না হলে রিডাইরেক্ট
            window.location.href = "index.html";
        }
    });

    // 🔄 ফায়ারস্টোর থেকে লোগো ও ব্যানার ডাটা ফেচ করার ফাংশন
    function fetchBrandingData() {
        db.collection("site_branding").doc("site_branding").get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
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

            // সাবমিটের আগে সিকিউরিটি চেক
            const currentUser = auth.currentUser;
            if (!currentUser || currentUser.email !== MY_ADMIN_EMAIL) {
                alert("অনুমতি নেই!");
                return;
            }

            const logoUrl = logoInput.value.trim();
            const bannerUrl = bannerInput.value.trim();

            db.collection("site_branding").doc("site_branding").set({
                logo_url: logoUrl,
                banner_url: bannerUrl
            }, { merge: true })
            .then(() => {
                alert("ভাই, লোগো এবং ব্যানার সফলভাবে আপডেট হয়েছে! 🎉");
            })
            .catch((error) => {
                console.error("Error updating branding:", error);
                alert("দুঃখিত ভাই, ডাটা সেভ করা যায়নি।");
            });
        });
    }
});
