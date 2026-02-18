import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: '' });

  /* useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []); */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {

    // Handle login logic here
    const email = formData.email;
    const password = formData.password;
    const role = formData.role;

    if (!role) {
      alert("Please select your role");
      return;
    }

    const captchaToken = "disabled";
    /* const captchaToken = window.grecaptcha.getResponse();
    console.log("CAPTCHA Token:", captchaToken); // DEBUG
    if (!captchaToken) {
      alert("Please complete the CAPTCHA");
      return;
    } */

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/users/login`, { email, password, role, captchaToken })
      console.log("Login successful:", response.data.user.email);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      // Role-based redirect
      const userRole = response.data.user.role;
      if (userRole === 'participant') {
        window.location.href = '/participantdashboard';
      } else if (userRole === 'organizer') {
        window.location.href = '/organizerdashboard';
      } else if (userRole === 'admin') {
        window.location.href = '/admindashboard';
      } else {
        // Default fallback for admin or other roles
        window.location.href = '/admindashboard';
      }

    }
    catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data); // DEBUG
      alert(`${error.response?.data?.message || 'Login failed'}`);
      // window.grecaptcha.reset();
    }


  }
  return (
    <div>
      <h1>Login</h1>

      <form>
        <div>
          <label>Email: </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>
        <br />

        <div>
          <label>Role: </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="participant">Participant</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <br />

        <div>
          <label>Password: </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>
        <br />

        {/* <div className="g-recaptcha" data-sitekey="6Le7wGcsAAAAAF8J5L9Ba4eMfkvEErzS7PSS4n74"></div>
        <br /> */}

        <button type="button" onClick={handleSubmit}>Login</button>
        <br /><br />
        <button type="button" onClick={() => window.location.href = '/passwordreset'}>
          Reset Password
        </button>
      </form>

      <p>
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;