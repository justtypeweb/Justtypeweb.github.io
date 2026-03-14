const firebaseConfig = {
  apiKey: "AIzaSyADR4IeYV2RisrwnNpnMHPAlohG2TMvTdw",
  authDomain: "justtypeweb-3c2dd.firebaseapp.com",
  projectId: "justtypeweb-3c2dd",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let username = null;

const loginBtn = document.getElementById("loginBtn");
const postBtn = document.getElementById("postBtn");

loginBtn.onclick = () => {

  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);

};


auth.onAuthStateChanged(async (user) => {

  if (!user) return;

  currentUser = user;

  const userDoc = await db.collection("users").doc(user.uid).get();

  if (userDoc.exists) {

    username = userDoc.data().username;

  } else {

    document.getElementById("usernameBox").style.display = "block";

  }

});


document.getElementById("saveUsername").onclick = async () => {

  let name = document.getElementById("usernameInput").value.trim();

  if (name.length < 3) {

    alert("Username must be at least 3 characters");
    return;

  }

  const check = await db.collection("users")
  .where("username","==",name)
  .get();

  if (!check.empty) {

    alert("Username already taken");
    return;

  }

  await db.collection("users").doc(currentUser.uid).set({
    username: name
  });

  username = name;

  document.getElementById("usernameBox").style.display = "none";

};


postBtn.onclick = async () => {

  if (!username) {

    alert("Create username first");
    return;

  }

  const text = document.getElementById("postText").value.trim();

  if (text === "") return;

  await db.collection("posts").add({

    username: username,
    text: text,
    date: Date.now()

  });

  document.getElementById("postText").value = "";

};


db.collection("posts")
.orderBy("date","desc")
.onSnapshot((snapshot) => {

  let html = "";

  snapshot.forEach((doc) => {

    const data = doc.data();

    html += `
      <div class="post">
        <b>${data.username}</b>
        <p>${data.text}</p>
      </div>
    `;

  });

  document.getElementById("posts").innerHTML = html;

});