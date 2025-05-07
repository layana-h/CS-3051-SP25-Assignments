// if logout link present hook it up
const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
  logoutLink.addEventListener('click', async e => {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = 'login.html';
  });
}

// hide / show links based on login state
(async function checkLogin() {
  const res = await fetch('/api/me');
  const { user } = await res.json();
  const loginLink = document.querySelector('.site-nav .nav-link[href="login.html"]');
  const logoutLink = document.getElementById('logout-link');


  if (user) { 
    if (loginLink) loginLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline';
  } else { 
    if (loginLink) loginLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const current = location.pathname.split('/').pop();
  document.querySelectorAll('.site-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');

    if (
      (href === 'login.html' && (current === 'login.html' || current === 'signup.html')) ||
      href === current
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});