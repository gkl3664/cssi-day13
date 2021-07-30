let googleUser;
window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      googleUser = user;
      console.log('Logged in as: ' + user.displayName);
      const googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderData(data);
  });
};

const renderData = (data) => {
    const destination = document.querySelector('#app');
    destination.innerHTML = "";
    for (let key in data) {
        const note = data[key];
        destination.innerHTML += createCard(note, key);
    }
};

const createCard = (note, noteId) => {
    return `<div class="column is-one-quarter">
                <div class="card"> 
                    <header class="card-header"> 
                        <p class="card-header-title"> 
                            ${note.title} 
                        </p> 
                    </header> 
                    <div class="card-content"> 
                        <div class="content">
                            ${note.text} 
                        </div>
                    </div> 
                    <footer class = "card-footer">
                        <a href="#" class="card-footer-item" onclick = "editNote('${noteId}')">Edit</a>
                        <a href="#" class="card-footer-item" onclick = "confirmDeleteNote('${noteId}')">Delete</a>
                    </footer>
                </div>
            </div>`;
};

const confirmDeleteNote = (noteId) => {
    const confirmationModal = document.querySelector("#confirmationModal");
    const confirmDeletionNoteId = document.querySelector("#confirmDeletionNoteId");
    confirmDeletionNoteId.value = noteId;
    confirmationModal.classList.add('is-active');
};

const deleteNote = () => {
    const noteId = document.querySelector("#confirmDeletionNoteId").value;
    console.log(noteId);
    const noteToDeleteRef = firebase.database().ref(`users/${googleUser.uid}/${noteId}`);
    noteToDeleteRef.remove();
    closeConfirmationModal(noteId);
};

const editNote = (noteId) => {
    console.log("edit note: "+noteId);
    const noteToEditRef = firebase.database().ref(`users/${googleUser.uid}/${noteId}`);
    noteToEditRef.once('value', (snapshot) => {
        const note = snapshot.val();
        const editNoteModal = document.querySelector("#editNoteModal");
        const editNoteTitleInput = document.querySelector("#editTitleInput");
        editNoteTitleInput.value = note.title;
        const editNoteTextInput = document.querySelector("#editTextInput");
        editNoteTextInput.value = note.text;
        const noteIdInput = document.querySelector("#editNoteId");
        noteIdInput.value = noteId;
        editNoteModal.classList.add('is-active');
    });
};

const closeEditModal = (noteId) => {
    console.log("edit note: "+noteId);
    const editNoteModal = document.querySelector("#editNoteModal");
    editNoteModal.classList.remove('is-active');
};

const closeConfirmationModal = (noteId) => {
    const confirmationModal = document.querySelector("#confirmationModal");
    confirmationModal.classList.remove('is-active');
};

const saveChanges = () => {
    const editNoteTitleInput = document.querySelector("#editTitleInput");
    const noteIdInput = document.querySelector("#editNoteId");
    const editNoteTextInput = document.querySelector("#editTextInput");

    const title = editNoteTitleInput.value;
    const noteId = noteIdInput.value;
    const text = editNoteTextInput.value;

    const noteToEdit = firebase.database().ref(`users/${googleUser.uid}/${noteId}`);

    noteToEdit.update({
        title: title,
        text: text,
    });
    closeModal();
}