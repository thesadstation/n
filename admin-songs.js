document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = window.db;
    const uploadForm = document.getElementById('add-song-form');
    const wrapperDiv = document.getElementById('song-upload-wrapper');

    // 🔒 সিকিউরিটি চেক: লগইন না থাকলে সোজা লগইন পেজে ধাক্কা মারো
    auth.onAuthStateChanged((user) => {
        if (user) {
            // লগইন থাকলে ফর্ম ডিসপ্লে করো ভাই
            if (wrapperDiv) wrapperDiv.style.display = 'block';
        } else {
            window.location.href = "login.html";
        }
    });

    // 🚀 গান আপলোড ফর্ম সাবমিট হ্যান্ডলিং লজিক
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // ফর্মে ইনপুট করা ডাটা রিসিভ করা ভাই
            const songId = parseInt(document.getElementById('song-id').value);
            const title = document.getElementById('song-title').value.trim();
            const thumbnailUrl = document.getElementById('song-thumbnail').value.trim();
            const audioUrl = document.getElementById('song-audio').value.trim();
            const lyrics = document.getElementById('song-lyrics').value.trim();

            // ফায়ারস্টোরের "songs" কালেকশনে নতুন ডাটা অ্যাড করা
            db.collection("songs").add({
                id: songId,
                title: title,
                thumbnail_url: thumbnailUrl,
                audio_url: audioUrl,
                lyrics: lyrics,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // ফিল্টারিং করার সুবিধার্থে টাইমস্ট্যাম্প
            })
            .then(() => {
                alert("ভাই, গানটি সফলভাবে ডাটাবেজে লাইভ করা হয়েছে! 🎉");
                uploadForm.reset(); // আপলোড শেষে ফর্ম খালি করে দেওয়া ভাই
            })
            .catch((error) => {
                console.error("Error uploading song:", error);
                alert("দুঃখিত ভাই, গানটি সেভ করা যায়নি। আবার ট্রাই করুন।");
            });
        });
    }
});
