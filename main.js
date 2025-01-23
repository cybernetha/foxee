// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
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

// References
const messagesRef = ref(db, "messages");

// Send a message
// Send a message
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
        console.error("Error sending message: ", error);
      });
  } else {
    console.log("Message is empty");
  }
};
