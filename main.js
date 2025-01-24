import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, set, remove, get, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Access Firebase instances from the global scope
const auth = window.firebaseAuth;
const db = window.firebaseDB;

// Realtime Database references
const messagesRef = ref(db, "messages");
const typingRef = ref(db, "typing");
const usersRef = ref(db, "users");

// Authenticate user anonymously
signInAnonymously(auth)
  .then(() => console.log("Signed in anonymously"))
  .catch((error) => console.error("Authentication error:", error.message));

// Check if username exists, if not, prompt for it
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        const username = prompt("Enter your username:") || "Anonymous";
        set(userRef, { username: username.trim() });
      }
    });
  }
});

// Change username
window.changeUsername = function () {
  const newUsername = prompt("Enter your new username:");
  if (newUsername && newUsername.trim() !== "") {
    const userRef = ref(db, `users/${auth.currentUser.uid}`);
    set(userRef, { username: newUsername.trim() })
      .then(() => console.log("Username updated successfully!"))
      .catch((error) => console.error("Error updating username:", error.message));
  } else {
    console.log("Username change canceled.");
  }
};

// Send a message
window.sendMessage = function () {
  const messageInput = document.getElementById("message");
  const message = messageInput.value;

  if (message.trim() !== "") {
    push(messagesRef, {
      text: message.trim(),
      timestamp: Date.now(),
      uid: auth.currentUser.uid,
      type: "text",
    })
      .then(() => {
        console.log("Message sent successfully");
        messageInput.value = ""; // Clear input field
      })
      .catch((error) => console.error("Error sending message:", error.message));
  } else {
    console.log("Message is empty");
  }
};

// Send an attachment (photo, sticker, video)
window.sendAttachment = function () {
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileUrl = event.target.result;
      push(messagesRef, {
        text: fileUrl,
        timestamp: Date.now(),
        uid: auth.currentUser.uid,
        type: "attachment",
        fileType: file.type,
      })
        .then(() => console.log("Attachment sent successfully"))
        .catch((error) => console.error("Error sending attachment:", error.message));
      fileInput.value = ""; // Clear the file input
    };
    reader.readAsDataURL(file);
  } else {
    console.log("No file selected.");
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
    const date = new Date(message.timestamp);

    if (message.type === "attachment") {
      const attachment = document.createElement(
        message.fileType.startsWith("image/") ? "img" : "video"
      );
      attachment.src = message.text;
      attachment.controls = true;
      attachment.style.maxWidth = "100%";
      messageDiv.appendChild(attachment);
    } else {
      messageDiv.textContent = `${username} (${date.toLocaleString()}): ${message.text}`;
    }

    // Add delete button
    if (message.uid === auth.currentUser.uid) {
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-btn");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => {
        remove(ref(db, `messages/${snapshot.key}`))
          .then(() => {
            console.log("Message deleted successfully");
            messageDiv.remove();
          })
          .catch((error) => console.error("Error deleting message:", error));
      };
      messageDiv.appendChild(deleteButton);
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});

// Typing indicator
let typingTimeout;
document.getElementById("message").addEventListener("input", () => {
  const userTypingRef = ref(db, `typing/${auth.currentUser.uid}`);
  set(userTypingRef, true);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    set(userTypingRef, false);
  }, 1000);
});

// Display typing indicator
const typingStatusDiv = document.getElementById("typing-status");
onValue(typingRef, (snapshot) => {
  const typingStatuses = snapshot.val();
  const typingUsers = Object.keys(typingStatuses || {}).filter(
    (uid) => typingStatuses[uid] && uid !== auth.currentUser.uid
  );

  typingStatusDiv.textContent =
    typingUsers.length > 0
      ? `${typingUsers.join(", ")} is typing...`
      : "";
});
