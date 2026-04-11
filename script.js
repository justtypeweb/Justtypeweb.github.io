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

  // Disable button (UX improvement)
  document.querySelector("button").innerText = "Posting...";

  await addDoc(collection(db, "posts"), {
    username,
    text,
    time: serverTimestamp()
  });

  document.getElementById("postInput").value = "";
  document.querySelector("button").innerText = "Post";
};
  document.getElementById("postInput").value = "";
};

// 📡 Show Posts (REAL-TIME)
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {
  postsDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    const firstLetter = data.username.charAt(0).toUpperCase();

    postsDiv.innerHTML += `
      <div class="bg-gray-900 p-4 rounded-lg flex gap-3 shadow-md">

        <!-- Avatar -->
        <div class="bg-blue-500 w-10 h-10 flex items-center justify-center rounded-full font-bold">
          ${firstLetter}
        </div>

        <!-- Content -->
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <b>@${data.username}</b>
            <small class="text-gray-400">
              ${data.time ? data.time.toDate().toLocaleString() : ""}
            </small>
          </div>

          <p class="mt-1">${data.text}</p>

          <!-- Actions -->
          <div class="flex gap-4 mt-2 text-gray-400 text-sm">
            <span>❤️ 0</span>
            <span>💬 Reply</span>
          </div>
        </div>

      </div>
    `;
  });
});
document.getElementById("postInput").focus();
