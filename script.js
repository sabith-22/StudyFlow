
const wrapper = document.querySelector('.wrapper');
const registerLink = document.querySelector('.register-link');
const loginLink = document.querySelector('.login-link');

registerLink.onclick = () => {
  wrapper.classList.add('active');
};

loginLink.onclick = () => {
  wrapper.classList.remove('active');
};

// 🔗 Connect Frontend to Backend

// Login Form Submission
document.querySelector('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`✅ Welcome back, ${data.username}!`);
      e.target.reset();
      
      localStorage.setItem("username", data.username);
      window.location.href = "dashboard.html";
  

    } else {
      alert(`❌ ${data.message}`);
    }
  } catch (err) {
    alert("🚨 Backend not reachable. Is the server running?");
  }
});

// Signup Form Submission
document.querySelector('#signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
  
    console.log("🔄 Signup form submitted with:", { username, email, password });
  
    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await res.json();
      console.log("📨 Response from server:", data);
  
      if (res.ok) {
        alert('✅ Signup successful! Please login.');
        wrapper.classList.remove('active');
        e.target.reset();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      alert("🚨 Backend not reachable. Is the server running?");
    }
  });
  
