// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
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
