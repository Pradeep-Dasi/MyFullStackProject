async function createPaste() {
  const content = document.getElementById("content").value;
  const ttl = document.getElementById("ttl").value;
  const views = document.getElementById("views").value;

  if (!content.trim()) {
    alert("Content cannot be empty");
    return;
  }

  const body = { content };

  if (ttl) body.ttl_seconds = Number(ttl);
  if (views) body.max_views = Number(views);

  try {
    const res = await fetch("http://localhost:3000/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("result").innerText = data.error;
      return;
    }

    document.getElementById("result").innerHTML =
      `Paste created: <a href="${data.url}" target="_blank">${data.url}</a>`;
  } catch (err) {
    alert("Cannot connect to backend");
  }
}

