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

const firebaseConfig = {
  apiKey: "AIzaSyDKwUAMfUYFyX3jDFG4-XC-np80Og6Ebko",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
  storageBucket: "justtypeweb-9bfe5.firebasestorage.app",
  messagingSenderId: "318534544846",
  appId: "1:318534544846:web:09055eaddd0b34dc094f9f",
  measurementId: "G-3W8D2KFHTY"
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
