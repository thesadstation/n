document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const uploadForm = document.getElementById('add-song-form');
    const wrapperDiv = document.getElementById('song-upload-wrapper');
    const MY_ADMIN_EMAIL = "atik89084@gmail.com"; 

    // URL থেকে আইডি ধরা (এডিট মোড চেক করার জন্য)
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    const CLOUD_NAME = "dwxhgon31";
    const PRESET = "mystation";

    // সিকিউরিটি: পেজ লোড হওয়ার সাথে সাথে এডমিন চেক
    auth.onAuthStateChanged((user) => {
        if (user && user.email === MY_ADMIN_EMAIL) {
            if (wrapperDiv) wrapperDiv.style.display = 'block';
            
            // যদি এডিট আইডি থাকে, তবে ডাটাবেস থেকে ডাটা এনে ফিল্ডে বসাও
            if (editId) {
                db.collection("songs").doc(editId).get().then(doc => {
                    if (doc.exists) {
                        const d = doc.data();
                        document.getElementById('song-id').value = d.id;
                        document.getElementById('song-title').value = d.title;
                        document.getElementById('song-slug').value = d.slug;
                        document.getElementById('song-thumbnail').value = d.thumbnail;
                        document.getElementById('song-audio').value = d.audio;
                        document.getElementById('song-lyrics').value = d.lyrics;
                        document.getElementById('song-seo-desc').value = d.seoDesc;
                        document.getElementById('song-meta-tags').value = d.metaTags || "";
                        document.querySelector('h2').innerText = "গান আপডেট করুন";
                        document.querySelector('.btn-submit').innerText = "🚀 গানটি আপডেট করুন";
                    }
                });
            }
        } else {
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
            submitBtn.innerText = editId ? "আপডেট হচ্ছে..." : "ডাটাবেজে সেভ হচ্ছে...";

            try {
                const songData = {
                    id: parseInt(document.getElementById('song-id').value),
                    title: document.getElementById('song-title').value.trim(),
                    slug: document.getElementById('song-slug').value.trim().toLowerCase().replace(/\s+/g, '-'),
                    thumbnail: thumbnailUrl,
                    audio: audioUrl,
                    lyrics: document.getElementById('song-lyrics').value.trim(),
                    seoDesc: document.getElementById('song-seo-desc').value.trim(),
                    metaTags: document.getElementById('song-meta-tags').value.trim(),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (editId) {
                    await db.collection("songs").doc(editId).update(songData);
                    alert("গানটি সফলভাবে আপডেট হয়েছে! 🎉");
                } else {
                    await db.collection("songs").doc(songData.slug).set(songData);
                    alert("গানটি সফলভাবে লাইভ হয়েছে! 🎉");
                }
                uploadForm.reset();
                window.location.href = "song-list.html";
            } catch (error) {
                alert("সমস্যা হয়েছে: " + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = editId ? "🚀 গানটি আপডেট করুন" : "🚀 গানটি লাইভ করুন";
            }
        });
    }
});
