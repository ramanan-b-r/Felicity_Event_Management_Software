import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const Register = () => {
  const [formData, setFormData] = useState({role:'',firstName:'',lastName:'',email:'',password:'',contactnumber:'',participanttype:'',collegename:''});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {

        // Handle registration logic here
    const email = formData.email;
    const password = formData.password;
    try{
            const response = await axios.post('/api/users/register', { email:formData.email, password: formData.password ,firstName:formData.firstName,lastName:formData.lastName,contactnumber:formData.contactnumber,participanttype:formData.participanttype,collegename:formData.collegename});
            console.log("Registration successful:", response.data.user.email);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify(response.data.user));
            // Redirect to dashboard
            window.location.href = '/useronboarding';

    }
    catch(error){
        console.error("There was an error!", error);
        alert("Login failed. Please check your credentials and try again.");
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
        <div>
            
            <select name="participanttype" onChange={handleChange}>
                <option value="">Select Participant Type</option>
                <option value="IIIT">IIIT</option>
                <option value="Non-IIIT">Non-IIIT</option>
            </select>        
        </div>
        <button type="button" onClick={handleSubmit}>Login</button>
      </form>

    </div>
  );
};

export default Register;