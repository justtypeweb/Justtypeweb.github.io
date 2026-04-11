// 🎯 Render Posts (UPDATED UI COLORS)
function renderPosts(posts) {
  postsDiv.innerHTML = "";

  posts.forEach((data) => {
    postsDiv.innerHTML += `
      <div class="border-b border-[#444444] p-4">

        <b class="text-[#E0E0E0]">@${data.username}</b>
        <p class="text-[#B0B0B0]">${data.text}</p>

        <div class="flex gap-4 mt-2 text-[#888888]">
          <span onclick="likePost('${data.id}','${data.username}')" 
                class="cursor-pointer hover:text-red-400">
            ❤️ ${data.likes || 0}
          </span>
        </div>

        <input id="comment-${data.id}" placeholder="Comment..."
          class="w-full mt-2 p-2 bg-[#1e1e1e] text-white border border-[#444444] rounded">

        <button onclick="addComment('${data.id}','${data.username}')"
          class="text-[#888888] hover:text-white mt-1">
          Reply
        </button>

        <div id="comments-${data.id}"></div>

      </div>
    `;

    loadComments(data.id);
  });
}

// 🔍 Explore UI
function renderExplore() {
  const div = document.getElementById("explorePosts");
  div.innerHTML = "";

  const sorted = [...allPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0));

  sorted.forEach((p) => {
    div.innerHTML += `
      <div class="border-b border-[#444444] p-3">
        <b class="text-[#E0E0E0]">@${p.username}</b>
        <p class="text-[#B0B0B0]">${p.text}</p>
        <span class="text-[#888888]">❤️ ${p.likes || 0}</span>
      </div>
    `;
  });
}

// 🔔 Notifications UI
function loadNotifications(username) {
  const q = query(collection(db, "notifications"), orderBy("time", "desc"));

  onSnapshot(q, (snapshot) => {
    notifDiv.innerHTML = "";

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      if (data.toUser === username) {
        notifDiv.innerHTML += `
          <div class="bg-[#1e1e1e] p-2 rounded border border-[#444444] text-[#B0B0B0]">
            ${data.message}
          </div>
        `;
      }
    });
  });
}
