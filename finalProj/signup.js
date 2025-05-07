// signup.js
document.getElementById('signupForm').addEventListener('submit', async e => {
  e.preventDefault();

  const username = document.getElementById('su-username').value;
  const password = document.getElementById('su-password').value;
  const errorEl  = document.getElementById('su-error');

  errorEl.textContent = '';

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.error) {
      errorEl.textContent = data.error;
      return;
    }

    window.location.href = 'index.html';

  } catch (err) {
    errorEl.textContent = 'Unexpected error. Please try again.';
    console.error(err);
  }
});