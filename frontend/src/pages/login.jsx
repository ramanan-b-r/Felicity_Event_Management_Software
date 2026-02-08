import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {

        // Handle login logic here
    const email = formData.email;
    const password = formData.password;
    try{
            const response = await axios.post('/api/users/login', { email, password })
            console.log("Login successful:", response.data.user.email);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify(response.data.user));
            
            // Role-based redirect
            const userRole = response.data.user.role;
            if (userRole === 'participant') {
                window.location.href = '/participantdashboard';
            } else if (userRole === 'organizer') {
                window.location.href = '/organizerdashboard';
            } else if(userRole === 'admin'){
                window.location.href = '/admindashboard';
            } else  {
                // Default fallback for admin or other roles
                window.location.href = '/admindashboard';
            }

    }
    catch(error){
        console.error("There was an error!", error);
        alert(`${error.response.data.message}`);
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

        <button type="button" onClick={handleSubmit}>Login</button>
        <br /><br />
        <button type="button" onClick={() => window.location.href = '/organizerpasswordreset'}>
          Organizer Password Reset
        </button>
      </form>

      <p>
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;