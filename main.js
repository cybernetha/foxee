import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, remove, set, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const auth = window.firebaseAuth;
const db = window.firebaseDB;

// Refs
const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");

// Authenticate
signInAnonymously(auth).catch(console.error);

// Handle username
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        const username = prompt("Enter your username:") || "Anonymous";
        set(userRef, { username });
      }
    });
  }
});

// Change username
window.changeUsername = function () {
  const username = prompt("Enter your new username:") || "Anonymous";
  set(ref(db, `users/${auth.currentUser.uid}`), { username });
};

// Send message
window.sendMessage = function () {
  const messageInput = document.getElementById("message");
  const text = messageInput.value.trim();
  if (text) {
    push(messagesRef, {
      uid: auth.currentUser.uid,
      text,
      timestamp: Date.now(),
    });
    messageInput.value = "";
  }
};

// Send attachment
window.sendAttachment = function () {
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      push(messagesRef, {
        uid: auth.currentUser.uid,
        text: event.target.result,
        type: "attachment",
        timestamp: Date.now(),
      });
      fileInput.value = "";
    };
    reader.readAsDataURL(file);
  }
};

// Display messages
onChildAdded(messagesRef, (snapshot) => {
  const { uid, text, type } = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = uid === auth.currentUser.uid ? "message sent" : "message received";

  if (type === "attachment") {
    const img = document.createElement("img");
    img.src = text;
    img.classList.add("message-attachment");
    messageDiv.appendChild(img);
  } else {
    messageDiv.textContent = text;
  }

  if (uid === auth.currentUser.uid) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => remove(ref(db, `messages/${snapshot.key}`));
    messageDiv.appendChild(deleteBtn);
  }

  messagesDiv.appendChild(messageDiv);
});
