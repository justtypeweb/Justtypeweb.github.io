import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Firebase Config
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


// ❤️ LIKE FUNCTION
window.likePost = async function (id) {
  const postRef = doc(db, "posts", id);

  await updateDoc(postRef, {
    likes: increment(1)
  });
};


// 💬 ADD COMMENT
window.addComment = async function (postId) {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;

  if (!text) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    time: serverTimestamp()
  });

  input.value = "";
};


// 💬 LOAD COMMENTS
function loadComments(postId) {
  const commentsDiv = document.getElementById(`comments-${postId}`);

  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("time", "asc")
  );

  onSnapshot(q, (snapshot) => {
    commentsDiv.innerHTML = "";

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      commentsDiv.innerHTML += `
        <div class="text-sm text-gray-400 ml-12 mt-1">
          💬 ${data.text}
        </div>
      `;
    });
  });
}


// 🚀 ADD POST
window.addPost = async function () {
  const usernameInput = document.getElementById("username");
  const username = usernameInput.value;
  const text = document.getElementById("postInput").value;

  if (!username || !text) {
    alert("Enter username and post!");
    return;
  }

  localStorage.setItem("username", username);

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


// 📡 REAL-TIME POSTS
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {
  postsDiv.innerHTML = "";

  snapshot.forEach((docItem) => {
    const data = docItem.data();
    const firstLetter = data.username.charAt(0).toUpperCase();

    postsDiv.innerHTML += `
      <div class="border-b border-gray-700 p-4 flex gap-3">

        <!-- Avatar -->
        <div class="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
          ${firstLetter}
        </div>

        <!-- Content -->
        <div class="flex-1">

          <div class="flex justify-between items-center">
            <b>@${data.username}</b>
            <span class="text-gray-400 text-xs">
              ${data.time ? data.time.toDate().toLocaleString() : ""}
            </span>
          </div>

          <p class="mt-1 break-words">
            ${data.text}
          </p>

          <!-- Actions -->
          <div class="flex gap-6 mt-3 text-gray-400 text-sm">

            <span onclick="likePost('${docItem.id}')" class="cursor-pointer hover:text-red-500">
              ❤️ ${data.likes || 0}
            </span>

            <span>💬</span>

          </div>

          <!-- Comment Input -->
          <div class="ml-12 mt-2">
            <input 
              id="comment-${docItem.id}"
              placeholder="Write a comment..."
              class="w-full p-2 text-black rounded text-sm"
            />

            <button 
              onclick="addComment('${docItem.id}')"
              class="text-blue-400 text-sm mt-1">
              Reply
            </button>

            <!-- Comments -->
            <div id="comments-${docItem.id}"></div>
          </div>

        </div>
      </div>
    `;

    // 🔥 Load comments for each post
    loadComments(docItem.id);
  });
});


// 👤 LOAD USERNAME + AUTO FOCUS
window.onload = () => {
  const savedUsername = localStorage.getItem("username");

  if (savedUsername) {
    const userField = document.getElementById("username");
    userField.value = savedUsername;
    userField.disabled = true;
  }

  document.getElementById("postInput").focus();
};
