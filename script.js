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

// 🔐 HTML ESCAPE FUNCTION (IMPORTANT)
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 📌 VARIABLES
let allPosts = [];
let replyTarget = null;

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

// ❤️ LIKE
window.likePost = async function (id, owner) {
  try {
    await updateDoc(doc(db, "posts", id), {
      likes: increment(1)
    });
    sendNotification(owner, "❤️ Someone liked your post");
  } catch (e) {
    console.error(e);
  }
};

// 💬 COMMENT
window.addComment = async function (postId, owner) {
  const input = document.getElementById(`comment-${postId}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    time: serverTimestamp(),
    parentId: replyTarget
  });

  replyTarget = null;
  input.value = "";
};

// 🗑 DELETE
window.deleteComment = async function (postId, commentId) {
  await deleteDoc(doc(db, "posts", postId, "comments", commentId));
};

// ↩ REPLY
window.replyTo = function (postId, commentId) {
  replyTarget = commentId;
  document.getElementById(`comment-${postId}`).focus();
};

// 📡 LOAD COMMENTS
function loadComments(postId) {
  const div = document.getElementById(`comments-${postId}`);
  if (!div) return;

  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("time", "asc")
  );

  onSnapshot(q, (snapshot) => {
    div.innerHTML = "";
    const comments = [];

    snapshot.forEach((docItem) => {
      comments.push({ id: docItem.id, ...docItem.data() });
    });

    comments.forEach((c) => {
      if (!c.parentId) {
        renderComment(postId, c, div, comments, 0);
      }
    });
  });
}

// 🎯 RENDER COMMENT (SECURE)
function renderComment(postId, c, parent, all, level) {
  const el = document.createElement("div");

  el.innerHTML = `
    <div class="bg-white text-black p-2 rounded mt-2"
         style="margin-left:${level * 20}px">

      💬 ${escapeHTML(c.text)}

      <div class="text-xs mt-1">
        <span onclick="replyTo('${postId}','${c.id}')" class="text-blue-500 cursor-pointer">Reply</span>
        <span onclick="deleteComment('${postId}','${c.id}')" class="text-red-500 cursor-pointer ml-2">Delete</span>
      </div>
    </div>
  `;

  parent.appendChild(el);

  all.forEach((child) => {
    if (child.parentId === c.id) {
      renderComment(postId, child, parent, all, level + 1);
    }
  });
}

// 🚀 ADD POST (SECURE)
window.addPost = async function () {
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

  } catch (error) {
    console.error(error);
    alert("Error posting");
  }
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

// 🎯 RENDER POSTS (SECURE)
function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach((p) => {
    postsDiv.innerHTML += `
      <div class="border-b border-gray-700 p-4">

        <b class="text-blue-400">@${escapeHTML(p.username)}</b>
        <p>${escapeHTML(p.text)}</p>

        <span onclick="likePost('${p.id}','${p.username}')" class="text-red-400 cursor-pointer">
          ❤️ ${p.likes || 0}
        </span>

        <input id="comment-${p.id}" placeholder="Comment..."
          class="w-full mt-2 p-2 bg-gray-900 border border-gray-700 rounded">

        <button onclick="addComment('${p.id}','${p.username}')" class="text-blue-400">
          Reply
        </button>

        <div id="comments-${p.id}"></div>

      </div>
    `;

    loadComments(p.id);
  });
}

// 🔍 SEARCH
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

// 🔔 Notifications
function loadNotifications(username) {
  const q = query(collection(db, "notifications"), orderBy("time", "desc"));

  onSnapshot(q, (snapshot) => {
    notifDiv.innerHTML = "";

    snapshot.forEach((d) => {
      const data = d.data();
      if (data.toUser === username) {
        notifDiv.innerHTML += `<div>${escapeHTML(data.message)}</div>`;
      }
    });
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