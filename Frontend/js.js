// GET button
document.getElementById('fetch-btn').addEventListener('click', () => {
  fetch('http://localhost:3000/Person')
    .then(response => response.json())
    .then(data => {
      document.getElementById('result').innerHTML = JSON.stringify(data, null, 2);
    })
    .catch(err => console.error('Error fetching persons:', err));
});

// POST form
document.getElementById('person-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const Name = document.getElementById('name').value;
  const Email = document.getElementById('email').value;
  const Occupation = document.getElementById('occupation').value;

  fetch('http://localhost:3000/Person', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Name, Email, Occupation })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('post-result').innerText = 'Person added successfully! ID: ' + data.insertId;
    document.getElementById('person-form').reset();
  })
  .catch(err => {
    document.getElementById('post-result').innerText = 'Error adding person.';
    console.error(err);
  });
});
