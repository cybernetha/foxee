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
function sendMessage() {
  const messageInput = document.getElementById("message");
  const message = messageInput.value;

  if (message.trim() !== "") {
    push(messagesRef, { text: message });
    messageInput.value = "";
  }
}

// Display messages
onChildAdded(messagesRef, (snapshot) => {
  const message = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.textContent = message.text;
  messagesDiv.appendChild(messageDiv);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
