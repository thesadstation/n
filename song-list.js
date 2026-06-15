document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = window.db;
    
    const wrapperDiv = document.getElementById('song-list-wrapper');
    const tableBody = document.getElementById('song-table-body');
    const searchInput = document.getElementById('search-input');
    
    // মোডাল এলিমেন্টস
    const editModal = document.getElementById('edit-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const editForm = document.getElementById('edit-song-form');

    let allSongs = []; // ডাটাবেজের সব গান ধরে রাখার লোকাল মেমোরি অ্যারে ভাই

    // 🔒 মেইন সিকিউরিটি গার্ড চেক
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (wrapperDiv) wrapperDiv.style.display = 'block';
            fetchSongs(); // গান নিয়ে আসার কল
        } else {
            window.location.href = "login.html";
        }
    });

    // 🔄 ডাটাবেজ থেকে রিয়েল-টাইমে সব গান তুলে আনার ফাংশন
    function fetchSongs() {
        db.collection("songs").orderBy("id", "desc").get()
            .then((snapshot) => {
                allSongs = [];
                tableBody.innerHTML = '';

                if (snapshot.empty) {
                    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#666; padding:20px;">কোনো গান পাওয়া যায়নি ভাই!</td></tr>`;
                    return;
                }

                snapshot.forEach((doc) => {
                    allSongs.push({ docId: doc.id, ...doc.data() });
                });

                renderTable(allSongs); // টেবিলে প্রিন্ট করার জন্য পাঠানো হলো
            })
            .catch(err => console.error("Error fetching songs:", err));
    }

    // 🖥️ স্ক্রিনে গানগুলোর টেবিল সাজানোর ফাংশন
    function renderTable(songsArray) {
        tableBody.innerHTML = '';
        songsArray.forEach((song) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${song.id || '0'}</strong></td>
                <td>${song.title || 'শিরোনামহীন'}</td>
                <td style="text-align: center;">
                    <button class="btn-action btn-edit" onclick="openEditModal('${song.docId}')"><i class="fas fa-edit"></i> এডিট</button>
                    <button class="btn-action btn-delete" onclick="deleteSong('${song.docId}')"><i class="fas fa-trash"></i> ডিলিট</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // 🔍 লাইভ সার্চ করার ইঞ্জিন লজিক ভাই
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            
            // আইডি অথবা শিরোনাম ম্যাচ করানোর ফিল্টার লুপ
            const filteredSongs = allSongs.filter(song => {
                const titleMatch = song.title ? song.title.toLowerCase().includes(keyword) : false;
                const idMatch = song.id ? song.id.toString().includes(keyword) : false;
                return titleMatch || idMatch;
            });

            renderTable(filteredSongs);
        });
    }

    // 🗑️ গান ডিলিট করার মেথড
    window.deleteSong = function(docId) {
        if (confirm("ভাই, আপনি কি নিশ্চিত যে গানটি চিরতরে ডিলিট করতে চান?")) {
            db.collection("songs").doc(docId).delete()
                .then(() => {
                    alert("গানটি সফলভাবে ডিলিট করা হয়েছে ভাই! 🗑️");
                    fetchSongs(); // টেবিল রিফ্রেশ করো
                })
                .catch(err => alert("ডিলিট করতে সমস্যা হয়েছে: " + err.message));
        }
    };

    // ✏️ এডিট মোডাল পপ-আপ ওপেন করার ফাংশন
    window.openEditModal = function(docId) {
        const targetSong = allSongs.find(s => s.docId === docId);
        if (!targetSong) return;

        // মোডালের ইনপুট বক্সে ডাটা বসানো ভাই
        document.getElementById('edit-doc-id').value = docId;
        document.getElementById('edit-song-id').value = targetSong.id || '';
        document.getElementById('edit-song-title').value = targetSong.title || '';
        document.getElementById('edit-song-thumbnail').value = targetSong.thumbnail_url || '';
        document.getElementById('edit-song-audio').value = targetSong.audio_url || '';
        document.getElementById('edit-song-lyrics').value = targetSong.lyrics || '';

        if (editModal) editModal.style.display = 'flex';
    };

    // মোডাল বন্ধ করার ইভেন্ট
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (editModal) editModal.style.display = 'none';
        });
    }

    // 💾 এডিট করা ডাটা আপডেট সেভ করার লজিক
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const docId = document.getElementById('edit-doc-id').value;
            const updatedId = parseInt(document.getElementById('edit-song-id').value);
            const updatedTitle = document.getElementById('edit-song-title').value.trim();
            const updatedThumb = document.getElementById('edit-song-thumbnail').value.trim();
            const updatedAudio = document.getElementById('edit-song-audio').value.trim();
            const updatedLyrics = document.getElementById('edit-song-lyrics').value.trim();

            db.collection("songs").doc(docId).update({
                id: updatedId,
                title: updatedTitle,
                thumbnail_url: updatedThumb,
                audio_url: updatedAudio,
                lyrics: updatedLyrics
            })
            .then(() => {
                alert("ভাই, গানের ডাটা সফলভাবে আপডেট করা হয়েছে! 🚀");
                if (editModal) editModal.style.display = 'none';
                fetchSongs(); // টেবিল রিফ্রেশ
            })
            .catch(err => alert("আপডেট করতে প্রবলেম হয়েছে ভাই: " + err.message));
        });
    }
});
