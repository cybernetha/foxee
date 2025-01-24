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

// Display messages
onChildAdded(messagesRef, (snapshot) => {
  const { uid, text } = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = uid === auth.currentUser.uid ? "message sent" : "message received";
  messageDiv.textContent = text;

  if (uid === auth.currentUser.uid) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => remove(ref(db, `messages/${snapshot.key}`));
    messageDiv.appendChild(deleteBtn);
  }

  messagesDiv.appendChild(messageDiv);
});
