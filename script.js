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
  increment,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDKwUAMfUYFyX3jDFG4-XC-np80Og6Ebko",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 VARIABLES
let allPosts = [];
let replyTarget = null;

const postsDiv = document.getElementById("posts");
const notifDiv = document.getElementById("notifications");

const homeSection = document.getElementById("homeSection");
const notificationSection = document.getElementById("notificationSection");
const exploreSection = document.getElementById("exploreSection");
const aboutSection = document.getElementById("aboutSection");

// 🚀 ADD POST (FIXED)
window.addPost = async () => {
  const username = document.getElementById("username").value.trim();
  const text = document.getElementById("postInput").value.trim();

  if (!username || !text) {
    alert("Enter username and post!");
    return;
  }

  try {
    await addDoc(collection(db, "posts"), {
      username,
      text,
      time: serverTimestamp(),
      likes: 0
    });

    document.getElementById("postInput").value = "";
    console.log("✅ Post added");

  } catch (error) {
    console.error("❌ Error:", error);
    alert("Posting failed! Check Firebase rules.");
  }
};

// ❤️ LIKE
window.likePost = async (id) => {
  try {
    await updateDoc(doc(db, "posts", id), {
      likes: increment(1)
    });
  } catch (error) {
    console.error(error);
  }
};

// 💬 COMMENT
window.addComment = async (postId) => {
  const input = document.getElementById(`comment-${postId}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  try {
    await addDoc(collection(db, "posts", postId, "comments"), {
      text,
      time: serverTimestamp(),
      parentId: replyTarget
    });

    replyTarget = null;
    input.value = "";
  } catch (error) {
    console.error(error);
  }
};

// 🗑 DELETE COMMENT
window.deleteComment = async (postId, id) => {
  try {
    await deleteDoc(doc(db, "posts", postId, "comments", id));
  } catch (error) {
    console.error(error);
  }
};

// ↩ REPLY
window.replyTo = (postId, id) => {
  replyTarget = id;
  const input = document.getElementById(`comment-${postId}`);
  if (input) input.focus();
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
  if (!postsDiv) return;

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

// 🔍 SEARCH (SAFE)
const searchBox = document.getElementById("searchInput");

if (searchBox) {
  searchBox.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = allPosts.filter((p) =>
      p.username.toLowerCase().includes(value) ||
      p.text.toLowerCase().includes(value)
    );

    renderPosts(filtered);
  });
}

// 🧭 NAVIGATION
function hideAll() {
  homeSection?.classList.add("hidden");
  notificationSection?.classList.add("hidden");
  exploreSection?.classList.add("hidden");
  aboutSection?.classList.add("hidden");
}

window.showHome = () => {
  hideAll();
  homeSection?.classList.remove("hidden");
};

window.showNotifications = () => {
  hideAll();
  notificationSection?.classList.remove("hidden");
};

window.showExplore = () => {
  hideAll();
  exploreSection?.classList.remove("hidden");
};

window.showAbout = () => {
  hideAll();
  aboutSection?.classList.remove("hidden");
};

// 👤 LOAD USER
window.onload = () => {
  const saved = localStorage.getItem("username");

  if (saved) {
    document.getElementById("username").value = saved;
  }
};