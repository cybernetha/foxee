import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, remove, set, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const auth = window.firebaseAuth;
const db = window.firebaseDB;

// References
const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");
const typingRef = ref(db, "typing");

// Authenticate anonymously
signInAnonymously(auth).catch((error) => {
  console.error("Authentication failed:", error.message);
  alert("Could not sign in. Please try again.");
});

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
    set(ref(typingRef, auth.currentUser.uid), false); // Stop typing indicator
  }
};

// Send attachments
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

// Typing indicator
let typingTimeout;
document.getElementById("message").addEventListener("input", () => {
  set(ref(typingRef, auth.currentUser.uid), true);

  // Stop typing after 1 second of inactivity
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    set(ref(typingRef, auth.currentUser.uid), false);
  }, 1000);
});

// Display typing indicator
onValue(typingRef, (snapshot) => {
  const typingUsers = snapshot.val();
  const typingStatus = document.getElementById("typing-status");

  const activeTypers = [];
  for (const uid in typingUsers) {
    if (typingUsers[uid] && uid !== auth.currentUser.uid) {
      activeTypers.push(uid);
    }
  }

  if (activeTypers.length > 0) {
    typingStatus.textContent = "Someone is typing...";
  } else {
    typingStatus.textContent = "";
  }
});

// Display messages
onChildAdded(messagesRef, (snapshot) => {
  const { uid, text, type, timestamp } = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = uid === auth.currentUser.uid ? "message sent" : "message received";

  const userRef = ref(usersRef, uid);
  get(userRef).then((snapshot) => {
    const username = snapshot.val()?.username || "Anonymous";
    const time = new Date(timestamp).toLocaleTimeString();
    const details = document.createElement("div");
    details.textContent = `${username} • ${time}`;
    details.style.fontSize = "12px";
    details.style.color = "#888";
    messageDiv.appendChild(details);

    if (type === "attachment") {
      const img = document.createElement("img");
      img.src = text;
      img.classList.add("message-attachment");
      messageDiv.appendChild(img);
    } else {
      const contentDiv = document.createElement("div");
      contentDiv.textContent = text;
      messageDiv.appendChild(contentDiv);
    }

    messagesDiv.appendChild(messageDiv);
  });
});
