import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosmiddleware';

const UserOnboarding = () => {
  const [formData, setFormData] = useState({interests: []});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {

        // Handle registration logic here
    const email = formData.email;
    const password = formData.password;
    try{
            const response = await api.put('/api/users/updateProfile', { interests: formData.interests });
           
            window.location.href = '/participantdashboard';

    }
    catch(error){
        console.error("There was an error!", error);
        alert("Something went wrong. Please try again.");
    }
        

  }
  return (
    <div>
      <h1>UserOnboarding</h1>
      
      <form>
       
        <div>
            <label>Interests (comma separated): </label>
            <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value.split(',') })}
                placeholder="Enter interests"
            />  
        </div>
     
        <button type="button" onClick={handleSubmit}>Update Preferences</button>
      </form>

    </div>
  );
};

export default UserOnboarding;