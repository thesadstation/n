document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = window.db;
    const uploadForm = document.getElementById('add-song-form');
    const wrapperDiv = document.getElementById('song-upload-wrapper');
    
    // আপনার ImgBB API Key এখানে বসান
    const IMGBB_API_KEY = 'acad51a73d1592f857d31925bf4777a1'; 

    // লগইন চেক
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (wrapperDiv) wrapperDiv.style.display = 'block';
        } else {
            window.location.href = "login.html";
        }
    });

    // ফর্ম সাবমিট হ্যান্ডলিং
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const imageInput = document.getElementById('song-thumbnail');
            const file = imageInput.files[0];

            if (!file) {
                alert("দয়া করে একটি ইমেজ সিলেক্ট করুন!");
                return;
            }

            // বাটন ডিজেবল করে দিন যাতে ডাবল ক্লিক না হয়
            const submitBtn = uploadForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.innerText = "আপলোড হচ্ছে...";

            // ১. ImgBB-তে ইমেজ আপলোড
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();

                if (!result.success) throw new Error("ইমেজ আপলোড ব্যর্থ হয়েছে!");

                const thumbnailUrl = result.data.url;

                // ২. Firestore-এ ডাটা সেভ করা
                const songId = parseInt(document.getElementById('song-id').value);
                const title = document.getElementById('song-title').value.trim();
                const audioUrl = document.getElementById('song-audio').value.trim();
                const lyrics = document.getElementById('song-lyrics').value.trim();

                await db.collection("songs").add({
                    id: songId,
                    title: title,
                    thumbnail_url: thumbnailUrl,
                    audio_url: audioUrl,
                    lyrics: lyrics,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("ভাই, গান এবং থাম্বনেইল সফলভাবে ডাটাবেজে লাইভ করা হয়েছে! 🎉");
                uploadForm.reset();
            } catch (error) {
                console.error("Error:", error);
                alert("দুঃখিত ভাই, কিছু একটা সমস্যা হয়েছে: " + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "আপলোড করুন";
            }
        });
    }
});
