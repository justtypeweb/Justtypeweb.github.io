import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, updateDoc, increment, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allPosts = [];
let replyTarget = null;

const postsDiv = document.getElementById("posts");
const notifDiv = document.getElementById("notifications");

// Add Post
window.addPost = async () => {
  const username = usernameInput.value;
  const text = postInput.value;

  if (!username || !text) return alert("Enter all");

  localStorage.setItem("username", username);

  await addDoc(collection(db, "posts"), {
    username, text, time: serverTimestamp(), likes: 0
  });

  postInput.value = "";
};

// Like
window.likePost = async (id) => {
  await updateDoc(doc(db, "posts", id), {
    likes: increment(1)
  });
};

// Comment
window.addComment = async (postId) => {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;

  if (!text) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    text, time: serverTimestamp(), parentId: replyTarget
  });

  replyTarget = null;
  input.value = "";
};

// Delete Comment
window.deleteComment = async (postId, id) => {
  await deleteDoc(doc(db, "posts", postId, "comments", id));
};

// Reply
window.replyTo = (postId, id) => {
  replyTarget = id;
  document.getElementById(`comment-${postId}`).focus();
};

// Load Posts
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, snap => {
  allPosts = [];
  snap.forEach(d => allPosts.push({ id: d.id, ...d.data() }));
  renderPosts(allPosts);
});

function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach(p => {
    postsDiv.innerHTML += `
      <div class="border-b border-gray-700 p-4">

        <b class="text-blue-400">@${p.username}</b>
        <p>${p.text}</p>

        <span onclick="likePost('${p.id}')" class="text-red-400 cursor-pointer">
          ❤️ ${p.likes || 0}
        </span>

        <input id="comment-${p.id}" placeholder="Comment..."
          class="w-full mt-2 p-2 bg-gray-900 border border-gray-700 rounded">

        <button onclick="addComment('${p.id}')" class="text-blue-400">Reply</button>

        <div id="comments-${p.id}"></div>
      </div>
    `;
  });
}

// Navigation
function hideAll() {
  homeSection.classList.add("hidden");
  notificationSection.classList.add("hidden");
  exploreSection.classList.add("hidden");
  aboutSection.classList.add("hidden");
  donateSection.classList.add("hidden");
}

window.showHome = () => { hideAll(); homeSection.classList.remove("hidden"); };
window.showNotifications = () => { hideAll(); notificationSection.classList.remove("hidden"); };
window.showExplore = () => { hideAll(); exploreSection.classList.remove("hidden"); };
window.showAbout = () => { hideAll(); aboutSection.classList.remove("hidden"); };
window.showDonate = () => { hideAll(); donateSection.classList.remove("hidden"); };

// Razorpay
window.payNow = function () {
  var options = {
    key: "rzp_test_XXXXXXXX",
    amount: "5000",
    currency: "INR",
    name: "JustTypeWeb",
    description: "Donation",
    handler: function () {
      alert("Payment Successful 🎉");
    }
  };

  new Razorpay(options).open();
};

// Load username
window.onload = () => {
  const saved = localStorage.getItem("username");
  if (saved) username.value = saved;
};
