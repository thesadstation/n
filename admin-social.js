document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    const socialForm = document.getElementById('social-form');
    const wrapperDiv = document.getElementById('social-settings-wrapper');
    const MY_ADMIN_EMAIL = "atik89084@gmail.com"; // তোমার ইমেইল
    
    const telegramInput = document.getElementById('social-telegram');
    const youtubeInput = document.getElementById('social-youtube');
    const facebookInput = document.getElementById('social-facebook');
    const instagramInput = document.getElementById('social-instagram');
    const tiktokInput = document.getElementById('social-tiktok');

    // 🔒 সিকিউরিটি চেক: ইমেইল ভেরিফিকেশন সহ
    auth.onAuthStateChanged((user) => {
        if (user && user.email === MY_ADMIN_EMAIL) {
            if (wrapperDiv) wrapperDiv.style.display = 'block';
            fetchSocialLinks();
        } else {
            // কেউ যদি এডমিন না হয়, তবে তাকে হোমপেজে পাঠিয়ে দাও
            window.location.href = "index.html";
        }
    });

    // 🔄 ডাটা তুলে আনার ফাংশন
    function fetchSocialLinks() {
        db.collection("site_branding").doc("social_links").get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.telegram && telegramInput) telegramInput.value = data.telegram;
                    if (data.youtube && youtubeInput) youtubeInput.value = data.youtube;
                    if (data.facebook && facebookInput) facebookInput.value = data.facebook;
                    if (data.instagram && instagramInput) instagramInput.value = data.instagram;
                    if (data.tiktok && tiktokInput) tiktokInput.value = data.tiktok;
                }
            })
            .catch(err => console.error("Error loading social links:", err));
    }

    // 💾 ডাটাবেজে সেভ করার লজিক
    if (socialForm) {
        socialForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // সাবমিটের আগে সিকিউরিটি চেক
            const currentUser = auth.currentUser;
            if (!currentUser || currentUser.email !== MY_ADMIN_EMAIL) {
                alert("অনুমতি নেই!");
                return;
            }

            db.collection("site_branding").doc("social_links").set({
                telegram: telegramInput.value.trim(),
                youtube: youtubeInput.value.trim(),
                facebook: facebookInput.value.trim(),
                instagram: instagramInput.value.trim(),
                tiktok: tiktokInput.value.trim()
            }, { merge: true })
            .then(() => {
                alert("ভাই, টেলিগ্রামসহ সব সোশ্যাল লিংক সফলভাবে ডাটাবেজে আপডেট হয়েছে! 🚀");
            })
            .catch((error) => {
                console.error("Error updating social links:", error);
                alert("দুঃখিত ভাই, লিংক সেভ করা যায়নি।");
            });
        });
    }
});
