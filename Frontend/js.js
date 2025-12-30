async function createPaste() {
            const text = document.getElementById('pasteText').value;
            const expireMinutes = document.getElementById('expireMinutes').value;
            const maxViews = document.getElementById('maxViews').value;

            const response = await fetch('http://localhost:3000/paste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    expireAfterMinutes: expireMinutes,
                    maxViews: maxViews
                })
            });

            const data = await response.json();
            const pasteLink = document.getElementById('pasteLink');
            pasteLink.href = data.link;
            pasteLink.textContent = data.link;
            document.getElementById('linkSection').style.display = 'block';
        }
