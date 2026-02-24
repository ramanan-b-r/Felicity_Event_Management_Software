import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosmiddleware';

const UserOnboarding = () => {
  const user = JSON.parse(localStorage.getItem('userData'));
  if (user.role !== 'participant') {
    window.location.href = '/';
  }
  const [formData, setFormData] = useState({ interests: [] });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    try {
      const response = await api.put('/api/users/updateProfile', { interests: formData.interests });

      alert("You will now go to clubs page where you can follow organizers");
      window.location.href = '/clubs';

    }
    catch (error) {
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