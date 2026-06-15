document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = window.db;
    
    const socialForm = document.getElementById('social-form');
    const wrapperDiv = document.getElementById('social-settings-wrapper');
    
    const telegramInput = document.getElementById('social-telegram');
    const youtubeInput = document.getElementById('social-youtube');
    const facebookInput = document.getElementById('social-facebook');
    const instagramInput = document.getElementById('social-instagram');
    const tiktokInput = document.getElementById('social-tiktok');

    // 🔒 সিকিউরিটি চেক
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (wrapperDiv) wrapperDiv.style.display = 'block';
            fetchSocialLinks();
        } else {
            window.location.href = "login.html";
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

    // 💾 ডাটাবেজে সেভ করার লজিক ভাই
    if (socialForm) {
        socialForm.addEventListener('submit', (e) => {
            e.preventDefault();

            db.collection("site_branding").doc("social_links").set({
                telegram: telegramInput.value.trim(),
                youtube: youtubeInput.value.trim(),
                facebook: facebookUrl = facebookInput.value.trim(),
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
