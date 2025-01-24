import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, set, remove, get, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Access Firebase instances
const auth = window.firebaseAuth;
const db = window.firebaseDB;

// Database References
const messagesRef = ref(db, "messages");
const typingRef = ref(db, "typing");
const usersRef = ref(db, "users");

// Anonymous Authentication
signInAnonymously(auth)
  .then(() => console.log("Signed in anonymously"))
  .catch((error) => console.error("Authentication error:", error.message));

// Handle Username
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

// Change Username
window.changeUsername = function () {
  const newUsername = prompt("Enter your new username:");
  if (newUsername && newUsername.trim() !== "") {
    set(ref(db, `users/${auth.currentUser.uid}`), { username: newUsername.trim() });
    console.log("Username updated successfully");
  }
};

// Send Message
window.sendMessage = function () {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();

  if (message) {
    push(messagesRef, {
      text: message,
      timestamp: Date.now(),
      uid: auth.currentUser.uid,
      type: "text",
    });
    messageInput.value = "";
  }
};

// Send Attachments
window.sendAttachment = function () {
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      push(messagesRef, {
        text: event.target.result,
        timestamp: Date.now(),
        uid: auth.currentUser.uid,
        type: "attachment",
        fileType: file.type,
      });
      fileInput.value = "";
    };
    reader.readAsDataURL(file);
  }
};

// Display Messages
onChildAdded(messagesRef, (snapshot) => {
  const message = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const userRef = ref(db, `users/${message.uid}`);
  get(userRef).then((userSnapshot) => {
    const username = userSnapshot.val()?.username || "Anonymous";
    const messageDiv = document.createElement("div");

    if (message.type === "attachment") {
      const media = document.createElement(
        message.fileType.startsWith("image/") ? "img" : "video"
      );
      media.src = message.text;
      media.controls = true;
      media.style.maxWidth = "100%";
      messageDiv.appendChild(media);
    } else {
      messageDiv.textContent = `${username}: ${message.text}`;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});
