function addPost() {
  const username = document.getElementById("username").value;
  const text = document.getElementById("postInput").value;

  if (!username || !text) {
    alert("Enter username and post!");
    return;
  }

  const postDiv = document.createElement("div");
  postDiv.className = "bg-gray-900 p-4 rounded";

  const time = new Date().toLocaleString();

  postDiv.innerHTML = `
    <b>@${username}</b>
    <p>${text}</p>
    <small>${time}</small>
  `;

  const posts = document.getElementById("posts");
  posts.prepend(postDiv);

  document.getElementById("postInput").value = "";
}
