import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 PASTE YOUR CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const postsDiv = document.getElementById("posts");

// 🚀 Add Post
window.addPost = async function () {
  const username = document.getElementById("username").value;
  const text = document.getElementById("postInput").value;

  if (!username || !text) {
    alert("Enter username and post!");
    return;
  }

  await addDoc(collection(db, "posts"), {
    username,
    text,
    time: serverTimestamp()
  });

  document.getElementById("postInput").value = "";
};

// 📡 Show Posts (REAL-TIME)
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {
  postsDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    postsDiv.innerHTML += `
      <div class="bg-gray-900 p-4 rounded">
        <b>@${data.username}</b>
        <p>${data.text}</p>
        <small>${data.time ? data.time.toDate().toLocaleString() : ""}</small>
      </div>
    `;
  });
});
