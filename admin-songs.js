document.addEventListener('DOMContentLoaded', () => {
    const auth = window.auth; 
    const db = window.db;     
    const uploadForm = document.getElementById('add-song-form');
    const wrapperDiv = document.getElementById('song-upload-wrapper');

    // ক্লাউডিনারি কনফিগারেশন
    const CLOUD_NAME = "dwxhgon31";
    const PRESET = "mystation";

    // লগইন চেক
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (wrapperDiv) wrapperDiv.style.display = 'block';
        } else {
            window.location.href = "login.html";
        }
    });

    // API এর মাধ্যমে আপলোড করার ফাংশন
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

    // গ্যালারি থেকে ফাইল সিলেক্ট হওয়ার পর আপলোড শুরু
    document.getElementById('img-input').onchange = async (e) => {
        if (!e.target.files[0]) return;
        alert("ছবি আপলোড হচ্ছে...");
        document.getElementById('song-thumbnail').value = await uploadToCloudinary(e.target.files[0], 'image');
        alert("ছবি আপলোড সম্পন্ন!");
    };

    document.getElementById('audio-input').onchange = async (e) => {
        if (!e.target.files[0]) return;
        alert("অডিও আপলোড হচ্ছে...");
        document.getElementById('song-audio').value = await uploadToCloudinary(e.target.files[0], 'video');
        alert("অডিও আপলোড সম্পন্ন!");
    };

    // ফর্ম সাবমিট হ্যান্ডলিং
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                document.getElementById('song-thumbnail').value = "";
                document.getElementById('song-audio').value = "";
            } catch (error) {
                console.error("Error:", error);
                alert("দুঃখিত ভাই, ডাটাবেজে সেভ করতে সমস্যা হয়েছে: " + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "🚀 গানটি লাইভ করুন";
            }
        });
    }
});
