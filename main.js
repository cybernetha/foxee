// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, set, remove, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8KbWGMA24BIgt1ud274Psyphm2Mf6COQ",
  authDomain: "chat-foxee.firebaseapp.com",
  databaseURL: "https://chat-foxee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-foxee",
  storageBucket: "chat-foxee.firebasestorage.app",
  messagingSenderId: "531579135295",
  appId: "1:531579135295:web:70b333e2bfdcecf4229f8a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Realtime Database reference for messages and users
const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");

// Authenticate user anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Authentication error:", error.message);
  });

// Check if username exists, if not, prompt for it
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        const username = prompt("Enter your username:");
        set(userRef, { username });
      }
    });
  }
});

// Send message function
window.sendMessage = function () {
  const messageInput = document.getElementById("message");
  const message = messageInput.value;

  if (message.trim() !== "") {
    push(messagesRef, {
      text: message,
      timestamp: Date.now(),
      uid: auth.currentUser.uid,
    })
      .then(() => {
        console.log("Message sent successfully");
        messageInput.value = ""; // Clear input field
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  } else {
    console.log("Message is empty");
  }
};

// Display messages in the chat
onChildAdded(messagesRef, (snapshot) => {
  const message = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  // Get the username of the sender
  const userRef = ref(db, `users/${message.uid}`);
  get(userRef).then((userSnapshot) => {
    const username = userSnapshot.val()?.username || "Anonymous";

    const messageDiv = document.createElement("div");
    const date = new Date(message.timestamp);
    messageDiv.textContent = `${username} (${date.toLocaleString()}): ${message.text}`;

    // Add delete button for the message owner
    if (message.uid === auth.currentUser.uid) {
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-btn"); // Add styling for the delete button
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => {
        remove(ref(db, `messages/${snapshot.key}`))
          .then(() => {
            console.log("Message deleted successfully");
          })
          .catch((error) => {
            console.error("Error deleting message:", error);
          });
      };
      messageDiv.appendChild(deleteButton);
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto scroll to the latest message
  });
});

// Typing indicator functionality
let typingTimeout;
document.getElementById("message").addEventListener("input", () => {
  const userTypingRef = ref(db, "typing/" + auth.currentUser.uid);
  set(userTypingRef, true);

  // Clear typing status after 1 second of inactivity
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    set(userTypingRef, false);
  }, 1000);
});

// Show typing indicator
const typingStatusDiv = document.getElementById("typing-status");
onChildAdded(ref(db, "typing"), (snapshot) => {
  const typingUserId = snapshot.key;
  const isTyping = snapshot.val();

  if (isTyping && typingUserId !== auth.currentUser.uid) {
    typingStatusDiv.textContent = `${typingUserId} is typing...`;
  } else {
    typingStatusDiv.textContent = "";
  }
});
