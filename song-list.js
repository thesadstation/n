const db = window.db;
const tbody = document.getElementById('song-table-body');
const searchInput = document.getElementById('search-input');
const editModal = document.getElementById('edit-modal');

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('song-list-wrapper').style.display = 'block';
        loadSongs();
    } else {
        window.location.href = 'admin.html';
    }
});

function loadSongs() {
    db.collection("songs").get().then((snapshot) => {
        tbody.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${data.id}</td><td>${data.title}</td>
            <td>
                <button class="btn-action btn-edit" onclick="openEditModal('${doc.id}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">এডিট</button>
                <button class="btn-action btn-delete" onclick="deleteSong('${doc.id}')">ডিলিট</button>
            </td>`;
            tbody.appendChild(tr);
        });
    });
}

window.openEditModal = (id, data) => {
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-song-id').value = data.id;
    document.getElementById('edit-song-title').value = data.title;
    document.getElementById('edit-song-thumbnail').value = data.thumbnail || '';
    document.getElementById('edit-song-audio').value = data.audio || '';
    document.getElementById('edit-song-lyrics').value = data.lyrics;
    editModal.style.display = 'flex';
};

document.getElementById('close-modal-btn').onclick = () => editModal.style.display = 'none';

document.getElementById('edit-song-form').onsubmit = async (e) => {
    e.preventDefault();
    const docId = document.getElementById('edit-doc-id').value;
    await db.collection("songs").doc(docId).update({
        id: Number(document.getElementById('edit-song-id').value),
        title: document.getElementById('edit-song-title').value,
        thumbnail: document.getElementById('edit-song-thumbnail').value,
        audio: document.getElementById('edit-song-audio').value,
        lyrics: document.getElementById('edit-song-lyrics').value
    });
    alert("আপডেট সফল হয়েছে!");
    location.reload();
};

window.deleteSong = async (id) => {
    if (confirm("আপনি কি নিশ্চিত ডিলিট করবেন?")) {
        await db.collection("songs").doc(id).delete();
        location.reload();
    }
};

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    Array.from(tbody.getElementsByTagName('tr')).forEach(row => {
        row.style.display = row.cells[1].innerText.toLowerCase().includes(term) ? '' : 'none';
    });
});
        
