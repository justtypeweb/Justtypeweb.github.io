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
    time: serverTimestamp(),
    parentId: replyTarget
  });

  replyTarget = null;
  input.value = "";
};

// 🗑 Delete
window.deleteComment = async function (postId, commentId) {
  await deleteDoc(doc(db, "posts", postId, "comments", commentId));
};

// ↩ Reply
window.replyTo = function (postId, commentId) {
  replyTarget = commentId;
  document.getElementById(`comment-${postId}`).focus();
};

// 📡 Load Comments
function loadComments(postId) {
  const div = document.getElementById(`comments-${postId}`);

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

function renderComment(postId, c, parent, all, level) {
  const el = document.createElement("div");

  el.innerHTML = `
    <div class="bg-white text-black p-2 rounded mt-2"
         style="margin-left:${level * 20}px">

      💬 ${c.text}

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

// 🚀 Add Post
window.addPost = async function () {
  const username = document.getElementById("username").value;
  const text = document.getElementById("postInput").value;

  if (!username || !text) return alert("Enter all");

  localStorage.setItem("username", username);

  await addDoc(collection(db, "posts"), {
    username,
    text,
    time: serverTimestamp(),
    likes: 0
  });

  document.getElementById("postInput").value = "";
};

// 📡 Posts
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {
  allPosts = [];

  snapshot.forEach((docItem) => {
    allPosts.push({ id: docItem.id, ...docItem.data() });
  });

  renderPosts(allPosts);
});

function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach((p) => {
    postsDiv.innerHTML += `
      <div class="border-b border-gray-700 p-4">

        <b class="text-blue-400">@${p.username}</b>
        <p>${p.text}</p>

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

// 🔍 Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const v = e.target.value.toLowerCase();
  renderPosts(allPosts.filter(p =>
    p.username.toLowerCase().includes(v) ||
    p.text.toLowerCase().includes(v)
  ));
});

// 🔔 Notifications
function loadNotifications(username) {
  const q = query(collection(db, "notifications"), orderBy("time", "desc"));

  onSnapshot(q, (snapshot) => {
    notifDiv.innerHTML = "";

    snapshot.forEach((d) => {
      const data = d.data();
      if (data.toUser === username) {
        notifDiv.innerHTML += `<div>${data.message}</div>`;
      }
    });
  });
}

// 🧭 Navigation
function hideAll() {
  homeSection.classList.add("hidden");
  notificationSection.classList.add("hidden");
  exploreSection.classList.add("hidden");
  aboutSection.classList.add("hidden");
  donateSection.classList.add("hidden");
}

window.showHome = () => { hideAll(); homeSection.classList.remove("hidden"); };
window.showNotifications = () => { hideAll(); notificationSection.classList.remove("hidden"); };
window.showExplore = () => { hideAll(); exploreSection.classList.remove("hidden"); renderExplore(); };
window.showAbout = () => { hideAll(); aboutSection.classList.remove("hidden"); };
window.showDonate = () => { hideAll(); donateSection.classList.remove("hidden"); };

// 🔍 Explore
function renderExplore() {
  const div = document.getElementById("explorePosts");
  div.innerHTML = "";

  [...allPosts]
    .sort((a,b)=>(b.likes||0)-(a.likes||0))
    .forEach(p=>{
      div.innerHTML += `
        <div class="border-b border-gray-700 p-3">
          <b class="text-blue-400">@${p.username}</b>
          <p>${p.text}</p>
          ❤️ ${p.likes || 0}
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