import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKwUAMfUYFyX3jDFG4-XC-np80Og6Ebko",
  authDomain: "justtypeweb-9bfe5.firebaseapp.com",
  projectId: "justtypeweb-9bfe5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const postsDiv = document.getElementById("posts");

window.addPost = async function () {
  const username = document.getElementById("username").value;
  const text = document.getElementById("postInput").value;

  if (!username || !text) return alert("Fill all fields");

  await addDoc(collection(db, "posts"), {
    username,
    text,
    time: serverTimestamp()
  });

  document.getElementById("postInput").value = "";
};

const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {
  postsDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    postsDiv.innerHTML += `
      <div class="card">

        <b>@${data.username}</b>
        <p>${data.text}</p>

        <span class="like">❤️</span>

        <input placeholder="Comment..." />

      </div>
    `;
  });
});

// Navigation
window.showHome = () => {
  homeSection.classList.remove("hidden");
  notificationSection.classList.add("hidden");
  exploreSection.classList.add("hidden");
};

window.showNotifications = () => {
  homeSection.classList.add("hidden");
  notificationSection.classList.remove("hidden");
  exploreSection.classList.add("hidden");
};

window.showExplore = () => {
  homeSection.classList.add("hidden");
  notificationSection.classList.add("hidden");
  exploreSection.classList.remove("hidden");
};
