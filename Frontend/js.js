// Frontend/src/App.js
import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [expireMinutes, setExpireMinutes] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [pasteLink, setPasteLink] = useState("");
  const [pasteContent, setPasteContent] = useState("");

  // Create a new paste
  const createPaste = async () => {
    const res = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        expireAfterMinutes: expireMinutes ? parseInt(expireMinutes) : 0,
        maxViews: maxViews ? parseInt(maxViews) : 0,
      }),
    });

    const data = await res.json();
    setPasteLink(data.link); // store returned link
  };

  // Fetch a paste by ID
  const fetchPaste = async (id) => {
    const res = await fetch(`/api?id=${id}`);
    if (res.status === 200) {
      const content = await res.text();
      setPasteContent(content);
    } else {
      const err = await res.text();
      setPasteContent(err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Pastebin Clone</h1>

      <textarea
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: "10px" }}
      ></textarea>

      <input
        type="number"
        placeholder="Expire after minutes (optional)"
        value={expireMinutes}
        onChange={(e) => setExpireMinutes(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="number"
        placeholder="Max views (optional)"
        value={maxViews}
        onChange={(e) => setMaxViews(e.target.value)}
      />

      <br />
      <button onClick={createPaste} style={{ marginTop: "10px" }}>
        Create Paste
      </button>

      {pasteLink && (
        <div style={{ marginTop: "20px" }}>
          <strong>Paste Link:</strong>{" "}
          <a href={pasteLink} target="_blank">
            {pasteLink}
          </a>
        </div>
      )}

      <hr />

      <h3>View a Paste</h3>
      <input
        type="text"
        placeholder="Enter Paste ID"
        onBlur={(e) => fetchPaste(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {pasteContent && (
        <div style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "10px" }}>
          {pasteContent}
        </div>
      )}
    </div>
  );
}

export default App;
