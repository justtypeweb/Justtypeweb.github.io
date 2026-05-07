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

// 🔐 STOP HTML EXECUTION
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 💻 FORMAT POSTS AS SAFE CODE/TEXT
function formatText(text) {
  const safe = escapeHTML(text);

  return `
    <pre class="bg-gray-900 text-green-400 p-3 rounded-xl text-xs sm:text-sm 
    whitespace-pre-wrap break-words overflow-x-auto max-w-full border border-gray-800">
${safe}
    </pre>
  `;
}

// 🔔 NOTIFICATIONS
async function sendNotification(toUser, message) {
  await addDoc(collection(db, "notifications"), {
    toUser,
    message,
    time: serverTimestamp()
  });
}

// ❤️ LIKE POST
window.likePost = async function (id, owner) {
  await updateDoc(doc(db, "posts", id), {
    likes: increment(1)
  });

  sendNotification(owner, "❤️ Someone liked your post");
};

// 💬 ADD COMMENT
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

// 🗑 DELETE COMMENT
window.deleteComment = async function (postId, commentId) {
  await deleteDoc(doc(db, "posts", postId, "comments", commentId));
};

// ↩ REPLY
window.replyTo = function (postId, commentId) {
  replyTarget = commentId;

  const input = document.getElementById(`comment-${postId}`);

  if (input) input.focus();
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
      comments.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    comments.forEach((c) => {
      if (!c.parentId) {
        renderComment(postId, c, div, comments, 0);
      }
    });
  });
}

// 🎯 RENDER COMMENT
function renderComment(postId, c, parent, all, level) {
  const el = document.createElement("div");

  el.innerHTML = `
    <div class="bg-gray-900 border border-gray-800 text-white p-3 rounded-xl mt-2"
         style="margin-left:${level * 15}px">

      ${formatText(c.text)}

      <div class="text-xs mt-2 flex gap-3">
        <span onclick="replyTo('${postId}','${c.id}')" 
          class="text-blue-400 cursor-pointer">
          Reply
        </span>

        <span onclick="deleteComment('${postId}','${c.id}')" 
          class="text-red-400 cursor-pointer">
          Delete
        </span>
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

// 🚀 ADD POST
window.addPost = async function () {
  const username = document.getElementById("username").value.trim();
  const text = document.getElementById("postInput").value.trim();

  if (!username || !text) {
    alert("Enter username and post!");
    return;
  }

  // 👤 USER TAG
  let userTag = localStorage.getItem("userTag");

  if (!userTag) {
    const snap = await getDocs(collection(db, "posts"));

    const count = snap.size + 1;

    const serial = String(count).padStart(4, "0");

    userTag = `${username}#${serial}`;

    localStorage.setItem("userTag", userTag);
  }

  // 📤 SAVE POST
  await addDoc(collection(db, "posts"), {
    username,
    userTag,
    text,
    likes: 0,
    time: serverTimestamp()
  });

  document.getElementById("postInput").value = "";
};

// 📡 LOAD POSTS
const q = query(
  collection(db, "posts"),
  orderBy("time", "desc")
);

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

  posts.forEach((p, index) => {

    postsDiv.innerHTML += `
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow">

        <!-- USER -->
        <div class="flex items-center gap-3">

          <div class="w-10 h-10 bg-blue-500 rounded-full 
            flex items-center justify-center font-bold">

            ${(p.username || "?").charAt(0).toUpperCase()}

          </div>

          <div>
            <div class="text-blue-400 font-semibold text-sm">
              @${escapeHTML(p.userTag || p.username)}
            </div>
          </div>

        </div>

        <!-- POST -->
        <div class="mt-3">
          ${formatText(p.text)}
        </div>

        <!-- ACTIONS -->
        <div class="flex gap-5 mt-3 text-sm">

          <span onclick="likePost('${p.id}','${p.username}')"
            class="text-red-400 cursor-pointer">
            ❤️ ${p.likes || 0}
          </span>

        </div>

        <!-- COMMENT -->
        <input id="comment-${p.id}" 
          placeholder="Comment..."
          class="w-full mt-3 p-2 bg-black border border-gray-700 rounded-lg text-sm">

        <button onclick="addComment('${p.id}')"
          class="text-blue-400 text-sm mt-2">
          Reply
        </button>

        <!-- COMMENTS -->
        <div id="comments-${p.id}" class="mt-2"></div>

      </div>
    `;

    loadComments(p.id);

    // 💰 ADS EVERY 3 POSTS
    if ((index + 1) % 3 === 0) {

      postsDiv.innerHTML += `
        <div class="my-4 text-center">

          <ins class="adsbygoogle"
              style="display:block"
              data-ad-client="ca-pub-9966062812451377"
              data-ad-slot="1234567890"
              data-ad-format="auto"></ins>

        </div>
      `;

      setTimeout(() => {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }, 100);
    }
  });
}

// 🔍 SEARCH
const searchBox = document.getElementById("searchInput");

if (searchBox) {
  searchBox.addEventListener("input", (e) => {

    const value = e.target.value.toLowerCase();

    const filtered = allPosts.filter((p) =>
      (p.userTag &&
        p.userTag.toLowerCase().includes(value)) ||

      (p.username &&
        p.username.toLowerCase().includes(value)) ||

      (p.text &&
        p.text.toLowerCase().includes(value))
    );

    renderPosts(filtered);
  });
}

// 🔔 LOAD NOTIFICATIONS
function loadNotifications(username) {
  const q = query(
    collection(db, "notifications"),
    orderBy("time", "desc")
  );

  onSnapshot(q, (snapshot) => {
    notifDiv.innerHTML = "";

    snapshot.forEach((d) => {
      const data = d.data();

      if (data.toUser === username) {

        notifDiv.innerHTML += `
          <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg mt-2">
            ${escapeHTML(data.message)}
          </div>
        `;
      }
    });
  });
}

// 🧭 NAVIGATION
function hideAll() {

  const sections = [
    "homeSection",
    "notificationSection",
    "exploreSection",
    "aboutSection"
  ];

  sections.forEach((id) => {
    const el = document.getElementById(id);

    if (el) el.classList.add("hidden");
  });
}

window.showHome = () => {
  hideAll();
  document.getElementById("homeSection").classList.remove("hidden");
};

window.showNotifications = () => {
  hideAll();
  document.getElementById("notificationSection").classList.remove("hidden");
};

window.showExplore = () => {
  hideAll();
  document.getElementById("exploreSection").classList.remove("hidden");
};

window.showAbout = () => {
  hideAll();
  document.getElementById("aboutSection").classList.remove("hidden");
};

// 👤 LOAD USER
window.onload = () => {

  const savedTag = localStorage.getItem("userTag");

  if (savedTag) {

    document.getElementById("username").value =
      savedTag.split("#")[0];

    const display = document.getElementById("userTagDisplay");

    if (display) {
      display.innerText = savedTag;
    }

    loadNotifications(savedTag);
  }
};