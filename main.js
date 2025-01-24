import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, remove, set, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();

// Refs
const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");

// Authenticate user anonymously
signInAnonymously(auth)
  .then(() => console.log("Signed in anonymously"))
  .catch((error) => console.error("Authentication error:", error.message));

// Handle username on auth
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

// Send a message
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
  const { uid, text, type, timestamp } = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = uid === auth.currentUser.uid ? "message sent" : "message received";

  // Message details
  const detailsDiv = document.createElement("div");
  detailsDiv.className = "message-details";

  const userRef = ref(db, `users/${uid}`);
  get(userRef).then((userSnapshot) => {
    const username = userSnapshot.val()?.username || "Anonymous";
    const time = new Date(timestamp).toLocaleString();
    detailsDiv.textContent = `${username} • ${time}`;
    messageDiv.appendChild(detailsDiv);
  });

  // Message content
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

  // Delete button
  if (uid === auth.currentUser.uid) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => remove(ref(db, `messages/${snapshot.key}`));
    messageDiv.appendChild(deleteBtn);
  }

  messagesDiv.appendChild(messageDiv);
});
