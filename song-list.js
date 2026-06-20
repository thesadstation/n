const db = firebase.firestore();
const auth = firebase.auth();
const tbody = document.getElementById('song-table-body');
const editModal = document.getElementById('edit-modal');
const MY_ADMIN_EMAIL = "atik89084@gmail.com";

// সিকিউরিটি: এডমিন চেক
auth.onAuthStateChanged((user) => {
    if (user && user.email === MY_ADMIN_EMAIL) {
        document.getElementById('song-list-wrapper').style.display = 'block';
        loadSongs();
    } else {
        window.location.href = 'index.html';
    }
});

// গানের তালিকা লোড করা
function loadSongs() {
    db.collection("songs").onSnapshot((snapshot) => {
        tbody.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.id}</td>
                <td>${data.title}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="openEditModal('${doc.id}')">এডিট</button>
                    <button class="btn-action btn-delete" onclick="deleteSong('${doc.id}')">ডিলিট</button>
                </td>`;
            tbody.appendChild(tr);
        });
    });
}

// এডিট মডাল ওপেন (ডাটাবেস থেকে ডাটা ফেচ করা)
window.openEditModal = async (id) => {
    try {
        const doc = await db.collection("songs").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('edit-doc-id').value = id;
            document.getElementById('edit-song-id').value = data.id || '';
            document.getElementById('edit-song-title').value = data.title || '';
            document.getElementById('edit-song-thumbnail').value = data.thumbnail || '';
            document.getElementById('edit-song-audio').value = data.audio || '';
            document.getElementById('edit-song-lyrics').value = data.lyrics || '';
            document.getElementById('edit-song-seo').value = data.seoDesc || '';
            document.getElementById('edit-song-meta').value = data.metaTags || '';
            editModal.style.display = 'flex';
        }
    } catch (err) {
        alert("ডাটা লোড করতে সমস্যা হয়েছে!");
    }
};

document.getElementById('close-modal-btn').onclick = () => editModal.style.display = 'none';

// আপডেট লজিক
document.getElementById('edit-song-form').onsubmit = async (e) => {
    e.preventDefault();
    if (auth.currentUser?.email !== MY_ADMIN_EMAIL) return;

    const docId = document.getElementById('edit-doc-id').value;
    try {
        await db.collection("songs").doc(docId).update({
            id: Number(document.getElementById('edit-song-id').value),
            title: document.getElementById('edit-song-title').value,
            thumbnail: document.getElementById('edit-song-thumbnail').value,
            audio: document.getElementById('edit-song-audio').value,
            lyrics: document.getElementById('edit-song-lyrics').value,
            seoDesc: document.getElementById('edit-song-seo').value,
            metaTags: document.getElementById('edit-song-meta').value
        });
        alert("আপডেট সফল হয়েছে! 🎉");
        editModal.style.display = 'none';
        location.reload();
    } catch (err) {
        alert("আপডেট করতে সমস্যা হয়েছে: " + err.message);
    }
};

// ডিলিট লজিক
window.deleteSong = async (id) => {
    if (auth.currentUser?.email !== MY_ADMIN_EMAIL) return;
    if (confirm("আপনি কি নিশ্চিত ডিলিট করবেন?")) {
        await db.collection("songs").doc(id).delete();
        location.reload();
    }
};

// সার্চ লজিক
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    Array.from(tbody.getElementsByTagName('tr')).forEach(row => {
        row.style.display = row.cells[1].innerText.toLowerCase().includes(term) ? '' : 'none';
    });
});
