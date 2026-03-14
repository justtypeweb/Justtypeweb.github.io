const firebaseConfig = {

apiKey: "AIzaSyDHixIgWj0F9OnwwK8G425FrPS4VsdNaCg",
authDomain: "justtypeweb-9662c.firebaseapp.com",
projectId: "justtypeweb-9662c",

};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

let username="";

function saveUser(){

username=document.getElementById("username").value;

if(username==""){

alert("Enter username");
return;

}

document.querySelector(".usernameBox").style.display="none";

document.getElementById("postSection").style.display="block";

}

function postMessage(){

let text=document.getElementById("postText").value;

if(text=="") return;

db.collection("posts").add({

username:username,
text:text,
date:new Date()

});

document.getElementById("postText").value="";

}

db.collection("posts")
.orderBy("date","desc")
.onSnapshot((snapshot)=>{

let postsDiv=document.getElementById("posts");

postsDiv.innerHTML="";

snapshot.forEach((doc)=>{

let data=doc.data();

postsDiv.innerHTML+=`

<div class="post">

<div class="username">${data.username}</div>

<div>${data.text}</div>

<div class="date">${new Date(data.date.seconds*1000).toLocaleString()}</div>

</div>

`;

});

});
