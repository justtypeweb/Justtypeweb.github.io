import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDHixIgWj0F9OnwwK8G425FrPS4VsdNaCg",
authDomain: "justtypeweb-9662c.firebaseapp.com",
projectId: "justtypeweb-9662c",
storageBucket: "justtypeweb-9662c.firebasestorage.app",
messagingSenderId: "157242433767",
appId: "1:157242433767:web:cd75b184b5b5ebc25c8242"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadPost(){

const username = document.getElementById("username").value;
const text = document.getElementById("postText").value;

if(username=="" || text==""){
alert("Enter username and text");
return;
}

await addDoc(collection(db,"posts"),{
username:username,
text:text,
date:new Date().toLocaleString()
});

location.reload();

}

async function loadPosts(){

const querySnapshot = await getDocs(collection(db,"posts"));

querySnapshot.forEach((doc)=>{

const post = doc.data();

const div = document.createElement("div");
div.className="post";

div.innerHTML = `
<b>${post.username}</b><br>
${post.text}<br>
<small>${post.date}</small>
`;

document.getElementById("posts").appendChild(div);

});

}

loadPosts();