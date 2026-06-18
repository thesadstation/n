document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth(); // সরাসরি ফায়ারবেস থেকে কল করো
    const db = firebase.firestore();
    const uploadForm = document.getElementById('add-song-form');
    const wrapperDiv = document.getElementById('song-upload-wrapper');
    const MY_ADMIN_EMAIL = "atik89084@gmail.com"; // তোমার ইমেইল

    const CLOUD_NAME = "dwxhgon31";
    const PRESET = "mystation";

    // সিকিউরিটি: পেজ লোড হওয়ার সাথে সাথে এডমিন চেক
    auth.onAuthStateChanged((user) => {
        if (user && user.email === MY_ADMIN_EMAIL) {
            if (wrapperDiv) wrapperDiv.style.display = 'block';
        } else {
            // এডমিন না হলে বা লগইন না থাকলে বের করে দাও
            window.location.href = "index.html";
        }
    });

    const uploadToCloudinary = async (file, type) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`, {
            method: "POST", body: formData
        });
        const data = await res.json();
        return data.secure_url;
    };

    document.getElementById('img-input').onchange = async (e) => {
        if (!e.target.files[0]) return;
        const btn = e.target.previousElementSibling;
        btn.innerText = "ছবি আপলোড হচ্ছে...";
        document.getElementById('song-thumbnail').value = await uploadToCloudinary(e.target.files[0], 'image');
        btn.innerText = "✅ ছবি আপলোড সফল!";
    };

    document.getElementById('audio-input').onchange = async (e) => {
        if (!e.target.files[0]) return;
        const btn = e.target.previousElementSibling;
        btn.innerText = "অডিও আপলোড হচ্ছে...";
        document.getElementById('song-audio').value = await uploadToCloudinary(e.target.files[0], 'video');
        btn.innerText = "✅ অডিও আপলোড সফল!";
    };

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // সাবমিট করার আগে শেষবার চেক
            const currentUser = auth.currentUser;
            if (!currentUser || currentUser.email !== MY_ADMIN_EMAIL) {
                alert("অনুমতি নেই!");
                return;
            }

            const thumbnailUrl = document.getElementById('song-thumbnail').value;
            const audioUrl = document.getElementById('song-audio').value;

            if (!thumbnailUrl || !audioUrl) {
                alert("দয়া করে ছবি এবং অডিও ফাইল আপলোড করুন!");
                return;
            }

            const submitBtn = uploadForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.innerText = "ডাটাবেজে সেভ হচ্ছে...";

            try {
                const songData = {
                    id: parseInt(document.getElementById('song-id').value),
                    title: document.getElementById('song-title').value.trim(),
                    slug: document.getElementById('song-slug').value.trim().toLowerCase().replace(/\s+/g, '-'),
                    thumbnail: thumbnailUrl,
                    audio: audioUrl,
                    lyrics: document.getElementById('song-lyrics').value.trim(),
                    seoDesc: document.getElementById('song-seo-desc').value.trim(),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };

                await db.collection("songs").doc(songData.slug).set(songData);
                alert("ভাই, গানটি সফলভাবে লাইভ হয়েছে! 🎉");
                uploadForm.reset();
            } catch (error) {
                alert("দুঃখিত ভাই, সমস্যা হয়েছে: " + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "🚀 গানটি লাইভ করুন";
            }
        });
    }
});
