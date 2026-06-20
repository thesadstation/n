Document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const blogForm = document.getElementById('blog-form');
    const MY_ADMIN_EMAIL = "atik89084@gmail.com"; 

    // ইউআরএল থেকে এডিট আইডি চেক
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    // ক্লাউডিনারি কনফিগারেশন
    const CLOUD_NAME = "dwxhgon31";
    const PRESET = "mystation";

    // সিকিউরিটি: পেজ লোড হওয়ার সাথে সাথে এডমিন চেক
    auth.onAuthStateChanged((user) => {
        if (!user || user.email !== MY_ADMIN_EMAIL) {
            window.location.href = "admin-login.html";
        }
    });

    // এডিট মোড হলে ডাটা লোড করা
    if (editId) {
        document.getElementById('page-title').innerHTML = '<i class="fas fa-edit"></i> ব্লগ আপডেট করুন';
        document.getElementById('submit-btn').innerText = "🚀 ব্লগ আপডেট করুন";
        
        db.collection("posts").doc(editId).get().then(doc => {
            if (doc.exists) {
                const d = doc.data();
                document.getElementById('blog-id').value = d.id;
                document.getElementById('blog-title').value = d.title;
                document.getElementById('blog-slug').value = d.slug;
                document.getElementById('blog-thumb').value = d.thumbnail;
                document.getElementById('blog-content').value = d.content;
                document.getElementById('meta-desc').value = d.metaDesc;
                document.getElementById('meta-tags').value = d.metaTags;
            }
        });
    }

    // ক্লাউডিনারি আপলোড উইজেট
    const myWidget = cloudinary.createUploadWidget({
        cloudName: CLOUD_NAME,
        uploadPreset: PRESET,
        sources: ['local', 'camera'],
        showAdvancedOptions: false,
        multiple: false,
        defaultSource: 'local'
    }, (error, result) => { 
        if (!error && result && result.event === "success") { 
            document.getElementById('blog-thumb').value = result.info.secure_url;
            alert("ইমেজ আপলোড সফল হয়েছে!");
        }
    });

    document.getElementById("upload_widget").addEventListener("click", () => myWidget.open());

    // ব্লগ পোস্ট সাবমিট ও আপডেট লজিক
    if (blogForm) {
        blogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const thumbnailUrl = document.getElementById('blog-thumb').value.trim();
            if (!thumbnailUrl) {
                alert("দয়া করে ইমেজ আপলোড করুন!");
                return;
            }

            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerText = editId ? "আপডেট হচ্ছে..." : "পাবলিশ হচ্ছে...";

            const blogData = {
                id: parseInt(document.getElementById('blog-id').value),
                title: document.getElementById('blog-title').value.trim(),
                slug: document.getElementById('blog-slug').value.trim().toLowerCase().replace(/\s+/g, '-'),
                thumbnail: thumbnailUrl,
                content: document.getElementById('blog-content').value.trim(),
                metaDesc: document.getElementById('meta-desc').value.trim(),
                metaTags: document.getElementById('meta-tags').value.trim(),
                createdAt: editId ? (await db.collection("posts").doc(editId).get()).data().createdAt : firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                if (editId) {
                    await db.collection("posts").doc(editId).update(blogData);
                    alert("ব্লগ আপডেট সফল হয়েছে! 🎉");
                } else {
                    await db.collection("posts").doc(blogData.slug).set(blogData);
                    alert("ব্লগ সফলভাবে লাইভ হয়েছে! 🎉");
                }
                window.location.href = "admin-blog-list.html";
            } catch (error) {
                alert("দুঃখিত, সমস্যা হয়েছে: " + error.message);
                submitBtn.disabled = false;
                submitBtn.innerText = editId ? "🚀 ব্লগ আপডেট করুন" : "🚀 ব্লগ পাবলিশ করুন";
            }
        });
    }
});
