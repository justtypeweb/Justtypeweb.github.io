var firebaseConfig = {
apiKey: "AIzaSyDHixIgWj0F9OnwwK8G425FrPS4VsdNaCg",
authDomain: "justtypeweb-9662c.firebaseapp.com",
databaseURL: "https://justtypeweb-9662c-default-rtdb.firebaseio.com",
projectId: "justtypeweb-9662c",
storageBucket: "usttypeweb-9662c.firebasestorage.app"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var storage = firebase.storage();

var username="";

function start(){

username=document.getElementById("username").value;

if(username==""){
alert("Enter username");
return;
}

document.getElementById("usernameBox").style.display="none";
document.getElementById("postSection").style.display="block";

loadPosts();

}

function uploadPost(){

var text=document.getElementById("textPost").value;

var file=document.getElementById("imageUpload").files[0];

var date=new Date().toISOString();

if(file){

var storageRef=storage.ref("images/"+file.name);

storageRef.put(file).then(function(snapshot){

snapshot.ref.getDownloadURL().then(function(url){

savePost(text,url,date);

});

});

}else{

savePost(text,"",date);

}

}

function savePost(text,image,date){

database.ref("posts/"+date).set({

username:username,
text:text,
image:image,
date:date

});

}

function loadPosts(){

database.ref("posts").on("value",function(snapshot){

var posts=snapshot.val();

var html="";

for(var key in posts){

var p=posts[key];

html+=`
<div class="post">

<h3>${p.username}</h3>
<p>${p.text}</p>
<img src="${p.image}" width="200">
<br>
<small>${p.date}</small>

</div>
`;

}

document.getElementById("posts").innerHTML=html;

});

}
async function uploadPost(){

var text=document.getElementById("textPost").value;
var file=document.getElementById("imageUpload").files[0];

var postId=Date.now();

var imageURL="";

if(file){

let formData=new FormData();
formData.append("image",file);

let res=await fetch("https://api.imgbb.com/1/upload?key=8da594cfe17b37f3cbef03114439f7f5",{
method:"POST",
body:formData
});

let data=await res.json();

imageURL=data.data.url;

}

database.ref("posts/"+postId).set({

username:username,
text:text,
image:imageURL,
date:new Date().toLocaleString(),
likes:0

});

}
