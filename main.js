import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, set, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const auth = window.firebaseAuth;
const db = window.firebaseDB;

const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");

// Authenticate user anonymously
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

// Send a message
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

// Handle pasted stickers or images
document.getElementById("message").addEventListener("paste", (event) => {
  const items = event.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      const reader = new FileReader();

      reader.onload = function (event) {
        // Upload the sticker as Base64
        push(messagesRef, {
          text: event.target.result,
          timestamp: Date.now(),
          uid: auth.currentUser.uid,
          type: "attachment",
          fileType: "image",
        });
      };

      reader.readAsDataURL(file);
      event.preventDefault();
    }
  }
});

// Send attachment
window.sendAttachment = function () {
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
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

// Display messages
onChildAdded(messagesRef, (snapshot) => {
  const message = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const userRef = ref(db, `users/${message.uid}`);
  get(userRef).then((userSnapshot) => {
    const username = userSnapshot.val()?.username || "Anonymous";
    const messageDiv = document.createElement("div");

    if (message.type === "attachment") {
      const img = document.createElement("img");
      img.src = message.text;
      img.classList.add("message-attachment");
      messageDiv.appendChild(img);
    } else {
      messageDiv.textContent = `${username}: ${message.text}`;
    }

    messageDiv.classList.add("message");
    messageDiv.classList.add(
      message.uid === auth.currentUser.uid ? "sent" : "received"
    );

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});
