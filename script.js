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
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKwUAMfUYFyX3jDFG4-XC-np80Og6Ebko",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔐 Escape HTML
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 🎯 Format text
function formatText(text) {
  const safe = escapeHTML(text);

  if (text.includes("<") && text.includes(">")) {
    return `
      <pre class="bg-gray-900 text-green-400 p-3 rounded-lg text-xs 
      whitespace-pre-wrap break-words overflow-x-auto max-w-full">
${safe}
      </pre>
    `;
  } else {
    return `<p class="text-gray-200 break-words">${safe}</p>`;
  }
}

// 📌 Variables
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
window.addComment = async function (postId) {
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

// 🎯 Render Comment
function renderComment(postId, c, parent, all, level) {
  const el = document.createElement("div");

  el.innerHTML = `
    <div class="bg-gray-800 text-white p-2 rounded mt-2 max-w-full break-words"
         style="margin-left:${level * 15}px">

      ${formatText(c.text)}

      <div class="text-xs mt-1">
        <span onclick="replyTo('${postId}','${c.id}')" class="text-blue-400 cursor-pointer">Reply</span>
        <span onclick="deleteComment('${postId}','${c.id}')" class="text-red-400 ml-2 cursor-pointer">Delete</span>
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

// 🚀 Add Post (WITH SERIAL TAG)
window.addPost = async function () {
  let username = document.getElementById("username").value.trim();
  let text = document.getElementById("postInput").value.trim();

  if (!username || !text) return alert("Enter all");

  let userTag = localStorage.getItem("userTag");

  if (!userTag) {
    // 🔥 TRUE SERIAL SYSTEM
    const snap = await getDocs(collection(db, "posts"));
    const count = snap.size + 1;

    const serial = String(count).padStart(4, "0"); // 0001 format
    userTag = `${username}#${serial}`;

    localStorage.setItem("userTag", userTag);
  }

  await addDoc(collection(db, "posts"), {
    username,
    userTag,
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
    allPosts.push({ id: docItem.id, ...docItem.data() });
  });

  renderPosts(allPosts);
});

// 🎯 Render Posts
function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach((p) => {
    postsDiv.innerHTML += `
      <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">

        <b class="text-blue-400 text-sm">
          @${escapeHTML(p.userTag || p.username)}
        </b>

        <div class="mt-2 text-sm">
          ${formatText(p.text)}
        </div>

        <span onclick="likePost('${p.id}','${p.username}')"
          class="text-red-400 cursor-pointer text-sm mt-2 inline-block">
          ❤️ ${p.likes || 0}
        </span>

        <input id="comment-${p.id}" placeholder="Comment..."
          class="w-full mt-3 p-2 text-sm bg-black border border-gray-700 rounded-lg">

        <button onclick="addComment('${p.id}')"
          class="text-blue-400 text-sm mt-1">
          Reply
        </button>

        <div id="comments-${p.id}" class="mt-2"></div>

      </div>
    `;

    loadComments(p.id);
  });
}

// 🔍 Search (TAG SUPPORT)
const searchBox = document.getElementById("searchInput");

if (searchBox) {
  searchBox.addEventListener("input", (e) => {
    const v = e.target.value.toLowerCase();

    renderPosts(allPosts.filter(p =>
      (p.userTag && p.userTag.toLowerCase().includes(v)) ||
      p.username.toLowerCase().includes(v) ||
      p.text.toLowerCase().includes(v)
    ));
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
  const saved = localStorage.getItem("userTag");

  if (saved) {
    document.getElementById("username").value = saved.split("#")[0];

    const display = document.getElementById("userTagDisplay");
    if (display) display.innerText = saved;

    loadNotifications(saved);
  }
};
