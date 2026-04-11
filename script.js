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
        <div style="margin-left:20px;color:#888">
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
      <div style="border-bottom:1px solid #444;padding:10px">

        <b>@${data.username}</b>
        <p>${data.text}</p>

        <span onclick="likePost('${data.id}','${data.username}')">
          ❤️ ${data.likes || 0}
        </span>

        <input id="comment-${data.id}" placeholder="comment..." />
        <button onclick="addComment('${data.id}','${data.username}')">Reply</button>

        <div id="comments-${data.id}"></div>
      </div>
    `;

    loadComments(data.id);
  });
}

// 🔔 Notifications
function loadNotifications(username) {
  const q = query(collection(db, "notifications"), orderBy("time", "desc"));

  onSnapshot(q, (snapshot) => {
    notifDiv.innerHTML = "";

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      if (data.toUser === username) {
        notifDiv.innerHTML += `<div>${data.message}</div>`;
      }
    });
  });
}

// 👤 Load User
window.onload = () => {
  const saved = localStorage.getItem("username");

  if (saved) {
    document.getElementById("username").value = saved;
    loadNotifications(saved);
  }
};
