import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const Register = () => {
  const [formData, setFormData] = useState({ role: '', firstName: '', lastName: '', email: '', password: '', contactnumber: '', collegename: '' });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {

    // Handle registration logic here
    const email = formData.email;
    const password = formData.password;

    const captchaToken = window.grecaptcha.getResponse();
    if (!captchaToken) {
      alert("Please complete the CAPTCHA");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/users/register`, { email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName, contactnumber: formData.contactnumber, collegename: formData.collegename, captchaToken });
      console.log("Registration successful:", response.data.user.email);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      // Redirect to dashboard
      window.location.href = '/useronboarding';

    }
    catch (error) {
      console.error("There was an error!", error);
      alert(`${error.response.data.message}`);
      window.grecaptcha.reset();
    }


  }
  return (
    <div>
      <h1>Register</h1>

      <form>
        <div>
          <label>First Name: </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label>Last Name: </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
          />
        </div>
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

        <br />
        <div>
          <label>Contact Number: </label>
          <input
            type="text"
            name="contactnumber"
            value={formData.contactnumber}
            onChange={handleChange}
            placeholder="Enter contact number"
          />
        </div>
        <br />
        <div>
          <label>College Name: </label>
          <input
            type="text"
            name="collegename"
            value={formData.collegename}
            onChange={handleChange}
            placeholder="Enter college name"
          />
        </div>
        <br />

        <div className="g-recaptcha" data-sitekey="6Le7wGcsAAAAAF8J5L9Ba4eMfkvEErzS7PSS4n74"></div>
        <br />

        <button type="button" onClick={handleSubmit}>Register</button>
      </form>

    </div>
  );
};

export default Register;