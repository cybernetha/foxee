const auth = window.firebaseAuth;
const db = window.firebaseDB;

const messagesRef = db.ref("messages");
const usersRef = db.ref("users");

auth.signInAnonymously().catch(console.error);

// Handle username
auth.onAuthStateChanged((user) => {
  if (user) {
    const userRef = usersRef.child(user.uid);
    userRef.once("value").then((snapshot) => {
      if (!snapshot.exists()) {
        const username = prompt("Enter your username:") || "Anonymous";
        userRef.set({ username });
      }
    });
  }
});

window.changeUsername = function () {
  const username = prompt("Enter your new username:") || "Anonymous";
  const currentUser = auth.currentUser;
  if (currentUser) {
    usersRef.child(currentUser.uid).set({ username });
  }
};

window.sendMessage = function () {
  const messageInput = document.getElementById("message");
  const text = messageInput.value.trim();
  if (text) {
    messagesRef.push({
      uid: auth.currentUser.uid,
      text,
      timestamp: Date.now(),
    });
    messageInput.value = "";
  }
};

window.sendAttachment = function () {
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      messagesRef.push({
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

messagesRef.on("child_added", (snapshot) => {
  const { uid, text, type, timestamp } = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = uid === auth.currentUser.uid ? "message sent" : "message received";

  const userRef = usersRef.child(uid);
  userRef.once("value").then((snapshot) => {
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
      const textDiv = document.createElement("div");
      textDiv.textContent = text;
      messageDiv.appendChild(textDiv);
    }

    messagesDiv.appendChild(messageDiv);
  });
});
