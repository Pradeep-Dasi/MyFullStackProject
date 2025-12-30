const API_URL = "/api"; // if frontend is separate, replace with full URL

    async function createPaste() {
      const text = document.getElementById("text").value;
      const expireMinutes = document.getElementById("expireMinutes").value;
      const maxViews = document.getElementById("maxViews").value;

      if (!text) return alert("Please enter some text");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          expireAfterMinutes: expireMinutes ? parseInt(expireMinutes) : 0,
          maxViews: maxViews ? parseInt(maxViews) : 0
        })
      });

      const data = await res.json();
      document.getElementById("pasteLink").innerHTML = 
        `<strong>Paste Link:</strong> <a href="${data.link}" target="_blank">${data.link}</a>`;
    }

    async function viewPaste() {
      const id = document.getElementById("pasteId").value;
      if (!id) return alert("Please enter Paste ID");

      const res = await fetch(`${API_URL}?id=${id}`);
      const contentDiv = document.getElementById("pasteContent");

      if (res.status === 200) {
        const text = await res.text();
        contentDiv.textContent = text;
      } else {
        const err = await res.text();
        contentDiv.textContent = err;
      }
    }
