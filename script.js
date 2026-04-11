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

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDKwUAMfUYFyX3jDFG4-XC-np80Og6Ebko",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const postsDiv = document.getElementById("posts");
const notifDiv = document.getElementById("notifications");

let allPosts = [];

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
  const text = input.value;

  if (!text) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    time: serverTimestamp()
  });

  input.value = "";
  sendNotification(owner, "💬 Someone commented on your post");
};

// 💬 Load Comments
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

// 🎯 Render
function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach((data) => {
    const firstLetter = data.username.charAt(0).toUpperCase();

    postsDiv.innerHTML += `
      <div class="border-b border-gray-700 p-4 flex gap-3">

        <div class="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
          ${firstLetter}
        </div>

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

          <div class="flex gap-6 mt-3 text-gray-400 text-sm">
            <span onclick="likePost('${data.id}','${data.username}')" class="cursor-pointer hover:text-red-500">
              ❤️ ${data.likes || 0}
            </span>
          </div>

          <!-- Comments -->
          <div class="ml-12 mt-2">
            <input id="comment-${data.id}" placeholder="Write comment..."
              class="w-full p-2 text-black rounded text-sm">

            <button onclick="addComment('${data.id}','${data.username}')"
              class="text-blue-400 text-sm mt-1">
              Reply
            </button>

            <div id="comments-${data.id}"></div>
          </div>

        </div>
      </div>
    `;

    loadComments(data.id);
  });
}

// 🔍 Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = allPosts.filter((post) =>
    post.username.toLowerCase().includes(value) ||
    post.text.toLowerCase().includes(value)
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
          <div class="bg-black p-2 rounded">
            ${data.message}
          </div>
        `;
      }
    });
  });
}

// 👤 Load user
window.onload = () => {
  const savedUsername = localStorage.getItem("username");

  if (savedUsername) {
    document.getElementById("username").value = savedUsername;
    document.getElementById("username").disabled = true;

    loadNotifications(savedUsername);
  }

  document.getElementById("postInput").focus();
};
