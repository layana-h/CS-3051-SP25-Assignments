// login.js
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('li-username').value;
  const password = document.getElementById('li-password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.error) {
    document.getElementById('li-error').textContent = data.error;
  } else {
    window.location.href = 'index.html';
  }
});