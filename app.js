const firebaseConfig = {
apiKey: "AIzaSyADR4IeYV2RisrwnNpnMHPAlohG2TMvTdw",
authDomain: "justtypeweb-3c2dd.firebaseapp.com",
projectId: "justtypeweb-3c2dd"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let user = null;


document.getElementById("login").onclick = () => {

const provider = new firebase.auth.GoogleAuthProvider();

auth.signInWithPopup(provider);

};


auth.onAuthStateChanged(u => {

user = u;

});


document.getElementById("postBtn").onclick = async () => {

if(!user){
alert("Login first");
return;
}

let text = document.getElementById("postText").value;

await db.collection("posts").add({

user: user.displayName,
text: text,
date: new Date()

});

document.getElementById("postText").value="";

loadPosts();

};


function loadPosts(){

db.collection("posts")
.orderBy("date","desc")
.onSnapshot(snapshot => {

let html="";

snapshot.forEach(doc=>{

let data = doc.data();

html += `
<div class="post">
<b>${data.user}</b>
<p>${data.text}</p>
</div>
`;

});

document.getElementById("posts").innerHTML = html;

});

}

loadPosts();