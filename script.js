import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, updateDoc, increment, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKwUAMfUYFyX3jDFG4-XC-np80Og6Ebko",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allPosts = [];
let replyTarget = null;

const postsDiv = document.getElementById("posts");
const notifDiv = document.getElementById("notifications");

// 🚀 ADD POST
window.addPost = async () => {
  const username = document.getElementById("username").value;
  const text = document.getElementById("postInput").value;

  if (!username || !text) {
    alert("Enter username and post!");
    return;
  }

  localStorage.setItem("username", username);

  await addDoc(collection(db, "posts"), {
    username,
    text,
    time: serverTimestamp(),
    likes: 0
  });

  document.getElementById("postInput").value = "";
};

// ❤️ LIKE
window.likePost = async (id) => {
  await updateDoc(doc(db, "posts", id), {
    likes: increment(1)
  });
};

// 💬 COMMENT
window.addComment = async (postId) => {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;

  if (!text) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    time: serverTimestamp(),
    parentId: replyTarget
  });

  replyTarget = null;
  input.value = "";
};

// 🗑 DELETE COMMENT
window.deleteComment = async (postId, id) => {
  await deleteDoc(doc(db, "posts", postId, "comments", id));
};

// ↩ REPLY
window.replyTo = (postId, id) => {
  replyTarget = id;
  document.getElementById(`comment-${postId}`).focus();
};

// 📡 LOAD POSTS
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {
  allPosts = [];

  snapshot.forEach((docItem) => {
    allPosts.push({
      id: docItem.id,
      ...docItem.data()
    });
  });

  renderPosts(allPosts);
});

// 🎯 RENDER POSTS
function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach((p) => {
    postsDiv.innerHTML += `
      <div class="border-b border-gray-700 p-4">

        <b class="text-blue-400">@${p.username}</b>
        <p>${p.text}</p>

        <span onclick="likePost('${p.id}')" class="text-red-400 cursor-pointer">
          ❤️ ${p.likes || 0}
        </span>

        <input id="comment-${p.id}" placeholder="Comment..."
          class="w-full mt-2 p-2 bg-gray-900 border border-gray-700 rounded">

        <button onclick="addComment('${p.id}')" class="text-blue-400">
          Reply
        </button>

        <div id="comments-${p.id}"></div>

      </div>
    `;
  });
}

// 🔍 SEARCH
document.getElementById("searchInput").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = allPosts.filter((p) =>
    p.username.toLowerCase().includes(value) ||
    p.text.toLowerCase().includes(value)
  );

  renderPosts(filtered);
});

// 🧭 NAVIGATION
function hideAll() {
  homeSection.classList.add("hidden");
  notificationSection.classList.add("hidden");
  exploreSection.classList.add("hidden");
  aboutSection.classList.add("hidden");
}

window.showHome = () => { hideAll(); homeSection.classList.remove("hidden"); };
window.showNotifications = () => { hideAll(); notificationSection.classList.remove("hidden"); };
window.showExplore = () => { hideAll(); exploreSection.classList.remove("hidden"); };
window.showAbout = () => { hideAll(); aboutSection.classList.remove("hidden"); };

// 👤 LOAD USER
window.onload = () => {
  const saved = localStorage.getItem("username");

  if (saved) {
    document.getElementById("username").value = saved;
  }
};