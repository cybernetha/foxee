// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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

// Authenticate user anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Authentication error:", error.message);
  });

// Realtime Database reference for messages
const messagesRef = ref(db, "messages");

// Send message
window.sendMessage = function () {
  const messageInput = document.getElementById("message");
  const message = messageInput.value;

  if (message.trim() !== "") {
    push(messagesRef, {
      text: message,
      timestamp: Date.now(),
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

// Display messages
onChildAdded(messagesRef, (snapshot) => {
  const message = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  const date = new Date(message.timestamp);
  messageDiv.textContent = `${date.toLocaleString()}: ${message.text}`;
  messagesDiv.appendChild(messageDiv);

  // Auto scroll to the latest message
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
