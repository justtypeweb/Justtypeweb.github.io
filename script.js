import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
  const usernameInput = document.getElementById("username");
const username = usernameInput.value;
window.likePost = async function (id) {
  const postRef = doc(db, "posts", id);

  await updateDoc(postRef, {
    likes: increment(1)
  });
};
// Save username
localStorage.setItem("username", username);
  const text = document.getElementById("postInput").value;
if (!username || !text) {
  alert("Enter username and post!");
  return;
}

  document.querySelector("button").innerText = "Posting...";

 await addDoc(collection(db, "posts"), {
  username,
  text,
  time: serverTimestamp(),
  likes: 0
});
  document.getElementById("postInput").value = "";
  document.querySelector("button").innerText = "Post";
};

// 📡 Show Posts (REAL-TIME)
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {
  postsDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();
    const firstLetter = data.username.charAt(0).toUpperCase();

  postsDiv.innerHTML += `
  <div class="border-b border-gray-200 p-4 flex gap-3 hover:bg-[#f0f6fa] transition">

    <!-- Avatar -->
    <div class="bg-[#2872A1] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
      ${firstLetter}
    </div>

    <!-- Content -->
    <div class="flex-1">

      <div class="flex justify-between items-center">
        <b class="text-[#2872A1]">@${data.username}</b>
        <span class="text-gray-500 text-xs">
          ${data.time ? data.time.toDate().toLocaleString() : ""}
        </span>
      </div>

      <p class="mt-1 text-sm text-gray-800 break-words">
        ${data.text}
      </p>

      <!-- Actions -->
      <div class="flex gap-6 mt-3 text-gray-500 text-sm">

        <span onclick="likePost('${doc.id}')" 
              class="cursor-pointer hover:text-red-500">
          ❤️ ${data.likes || 0}
        </span>

        <span class="cursor-pointer hover:text-blue-400">💬</span>
        <span class="cursor-pointer hover:text-green-400">🔁</span>

      </div>

    </div>

  </div>
`;

// Auto focus
window.onload = () => {
  document.getElementById("postInput").focus();
};
window.onload = () => {
  const savedUsername = localStorage.getItem("username");

  if (savedUsername) {
    document.getElementById("username").value = savedUsername;
  }

  document.getElementById("postInput").focus();
  if (savedUsername) {
  const userField = document.getElementById("username");
  userField.value = savedUsername;
  userField.disabled = true;
}
};
