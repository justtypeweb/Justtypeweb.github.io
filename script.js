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

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDKwUAMfUYFyX3jDFG4-XC-np80Og6Ebko",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allPosts = [];

const postsDiv = document.getElementById("posts");
const notifDiv = document.getElementById("notifications");

// 🔔 Notification
async function sendNotification(toUser, message) {
  await addDoc(collection(db, "notifications"), {
    toUser,
    message,
    time: serverTimestamp()
  });
}

// ❤️ Like
window.likePost = async function (id, owner) {
  await updateDoc(doc(db, "posts", id), {
    likes: increment(1)
  });

  sendNotification(owner, "❤️ Someone liked your post");
};

// 💬 Comment
window.addComment = async function (postId, owner) {
  const input = document.getElementById(`comment-${postId}`);
  if (!input) return;

  const text = input.value;
  if (!text) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    time: serverTimestamp()
  });

  input.value = "";
  sendNotification(owner, "💬 Someone commented");
};

// 💬 Load Comments
function loadComments(postId) {
  const commentsDiv = document.getElementById(`comments-${postId}`);
  if (!commentsDiv) return;

  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("time", "asc")
  );

  onSnapshot(q, (snapshot) => {
    commentsDiv.innerHTML = "";

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      commentsDiv.innerHTML += `
        <div class="ml-4 text-gray-400 text-sm">
          💬 ${data.text}
        </div>
      `;
    });
  });
}

// 🚀 Add Post
window.addPost = async function () {
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

// 📡 Load Posts
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

// 🎯 Render Posts
function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach((data) => {
    postsDiv.innerHTML += `
      <div class="border-b border-gray-700 p-4">

        <b class="text-blue-400">@${data.username}</b>
        <p class="text-white">${data.text}</p>

        <div class="mt-2">
          <span onclick="likePost('${data.id}','${data.username}')"
                class="cursor-pointer text-red-400 hover:text-red-500">
            ❤️ ${data.likes || 0}
          </span>
        </div>

        <input id="comment-${data.id}" placeholder="Comment..."
          class="w-full mt-2 p-2 bg-gray-900 border border-gray-700 rounded text-white">

        <button onclick="addComment('${data.id}','${data.username}')"
          class="text-blue-400 mt-1">
          Reply
        </button>

        <div id="comments-${data.id}"></div>
      </div>
    `;

    loadComments(data.id);
  });
}

// 🔍 Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = allPosts.filter((p) =>
    p.username.toLowerCase().includes(value) ||
    p.text.toLowerCase().includes(value)
  );

  renderPosts(filtered);
});

// 🔔 Notifications
function loadNotifications(username) {
  const q = query(collection(db, "notifications"), orderBy("time", "desc"));

  onSnapshot(q, (snapshot) => {
    notifDiv.innerHTML = "";

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      if (data.toUser === username) {
        notifDiv.innerHTML += `
          <div class="bg-gray-900 p-2 rounded border border-gray-700 mb-2">
            ${data.message}
          </div>
        `;
      }
    });
  });
}

// 📱 Navigation
window.showHome = function () {
  document.getElementById("homeSection").classList.remove("hidden");
  document.getElementById("notificationSection").classList.add("hidden");
  document.getElementById("exploreSection").classList.add("hidden");
};

window.showNotifications = function () {
  document.getElementById("homeSection").classList.add("hidden");
  document.getElementById("notificationSection").classList.remove("hidden");
  document.getElementById("exploreSection").classList.add("hidden");
};

window.showExplore = function () {
  document.getElementById("homeSection").classList.add("hidden");
  document.getElementById("notificationSection").classList.add("hidden");
  document.getElementById("exploreSection").classList.remove("hidden");

  renderExplore();
};

// 🔍 Explore
function renderExplore() {
  const div = document.getElementById("explorePosts");
  div.innerHTML = "";

  const sorted = [...allPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0));

  sorted.forEach((p) => {
    div.innerHTML += `
      <div class="border-b border-gray-700 p-3">
        <b class="text-blue-400">@${p.username}</b>
        <p>${p.text}</p>
        <span class="text-red-400">❤️ ${p.likes || 0}</span>
      </div>
    `;
  });
}

// 👤 Load user
window.onload = () => {
  const saved = localStorage.getItem("username");

  if (saved) {
    document.getElementById("username").value = saved;
    loadNotifications(saved);
  }
};
