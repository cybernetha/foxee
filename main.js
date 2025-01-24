import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, remove, set, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const auth = window.firebaseAuth;
const db = window.firebaseDB;

// References
const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");

// Anonymous authentication
signInAnonymously(auth).catch(console.error);

// Handle username on authentication
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(usersRef, user.uid);
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
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userRef = ref(usersRef, currentUser.uid);
    set(userRef, { username });
  }
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
  const { uid, text, timestamp } = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = uid === auth.currentUser.uid ? "message sent" : "message received";

  const userRef = ref(usersRef, uid);
  get(userRef).then((snapshot) => {
    const username = snapshot.val()?.username || "Anonymous";
    const time = new Date(timestamp).toLocaleTimeString();
    const detailsDiv = document.createElement("div");
    detailsDiv.textContent = `${username} • ${time}`;
    detailsDiv.style.fontSize = "12px";
    detailsDiv.style.color = "#888";
    messageDiv.appendChild(detailsDiv);

    const textDiv = document.createElement("div");
    textDiv.textContent = text;
    messageDiv.appendChild(textDiv);

    messagesDiv.appendChild(messageDiv);
  });
});
