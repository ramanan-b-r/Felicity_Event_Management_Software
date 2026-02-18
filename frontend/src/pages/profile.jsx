import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axiosmiddleware';

const Profile = () => {
  const currentUser = JSON.parse(localStorage.getItem("userData"));
  if (!currentUser) {
    return <Navigate to="/login" />
  }

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/users/getProfile');
      setUser(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchProfile();
  }, []);

  const changeFirstName = async () => {
    const newName = prompt("Enter your new first name:", user.firstName);
    if (newName && newName !== user.firstName) {
      try {

        const response = await api.put('/api/users/updateProfile', { firstName: newName });
        setUser(prevUser => ({ ...prevUser, firstName: response.data.user.firstName }));
      } catch (error) {
        console.error("Failed to update first name:", error);
      }
    }
  };
  const changeLastName = async () => {
    const newName = prompt("Enter your new last name:", user.lastName);
    if (newName && newName !== user.lastName) {
      try {

        const response = await api.put('/api/users/updateProfile', { lastName: newName });
        setUser(prevUser => ({ ...prevUser, lastName: response.data.user.lastName }));
      } catch (error) {
        console.error("Failed to update last name:", error);
      }
    }
  };
  const changeCollege = async () => {
    const newCollege = prompt("Enter your new college name:", user.collegename);
    if (newCollege && newCollege !== user.collegename) {
      try {

        const response = await api.put('/api/users/updateProfile', { collegename: newCollege });
        setUser(prevUser => ({ ...prevUser, collegename: response.data.user.collegename }));
      } catch (error) {
        console.error("Failed to update college name:", error);
      }
    }
  };

  //maybe need to validarte later
  const changeContactNumber = async () => {
    const newContact = prompt("Enter your new contact number:", user.contactnumber);
    if (newContact && newContact !== user.contactnumber) {
      try {

        const response = await api.put('/api/users/updateProfile', { contactnumber: newContact });
        setUser(prevUser => ({ ...prevUser, contactnumber: response.data.user.contactnumber }));
      } catch (error) {
        console.error("Failed to update contact number:", error);
      }
    }
  };


  const changeInterests = async () => {
    const interests = prompt("Add new interests seperated by commas", user.interests?.join(','))
    if (interests !== user.interests?.join(',')) {

      try {
        const interestarray = interests.split(',')
        const response = await api.put('/api/users/updateProfile', { interests: interestarray })
        setUser(prevUser => ({ ...prevUser, interests: response.data.user.interests }));

      }
      catch (err) {
        alert("Type in the fields properly")
      }
    }
  }

  const changeOrganizerName = async () => {
    const newName = prompt("Enter your new organizer name:", user.organizername);
    if (newName && newName !== user.organizername) {
      try {
        const response = await api.put('/api/users/updateProfile', { organizername: newName });
        setUser(prevUser => ({ ...prevUser, organizername: response.data.user.organizername }));
      } catch (error) {
        console.error("Failed to update organizer name:", error);
      }
    }
  };

  const changeCategory = async () => {
    const newCategory = prompt("Enter your new category:", user.category);
    if (newCategory && newCategory !== user.category) {
      try {
        const response = await api.put('/api/users/updateProfile', { category: newCategory });
        setUser(prevUser => ({ ...prevUser, category: response.data.user.category }));
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    }
  };

  const changeDescription = async () => {
    const newDescription = prompt("Enter your new description:", user.description);
    if (newDescription && newDescription !== user.description) {
      try {
        const response = await api.put('/api/users/updateProfile', { description: newDescription });
        setUser(prevUser => ({ ...prevUser, description: response.data.user.description }));
      } catch (error) {
        console.error("Failed to update description:", error);
      }
    }
  };

  const changeContactEmail = async () => {
    const newContactEmail = prompt("Enter your new contact email:", user.contactemail);
    if (newContactEmail && newContactEmail !== user.contactemail) {
      try {
        const response = await api.put('/api/users/updateProfile', { contactemail: newContactEmail });
        setUser(prevUser => ({ ...prevUser, contactemail: response.data.user.contactemail }));
      } catch (error) {
        console.error("Failed to update contact email:", error);
      }
    }
  };

  const changeDiscordWebhookUrl = async () => {
    const newUrl = prompt("Enter your Discord Webhook URL:", user.discordWebhookUrl || "");
    if (newUrl !== null && newUrl !== user.discordWebhookUrl) {
      try {
        const response = await api.put('/api/users/updateProfile', { discordWebhookUrl: newUrl });
        setUser(prevUser => ({ ...prevUser, discordWebhookUrl: response.data.user.discordWebhookUrl }));
      } catch (error) {
        console.error("Failed to update Discord webhook URL:", error);
      }
    }
  };

  const changePassword = async () => {
    const newPassword = prompt("Enter your new password:");
    if (newPassword && newPassword.trim() !== '') {
      try {
        const response = await api.put('/api/users/changePassword', { newPassword });
        alert(response.data.message);
      } catch (error) {
        console.error("Failed to change password:", error);
        alert(error.response?.data?.message || "Failed to change password");
      }
    }
  };



  if (loading) {
    return <div>Loading your profile...</div>;
  }

  if (!user) {
    return <div>No user data found.</div>;
  }

  let rolerelatedcontent = null;
  //need to add followed clbs also for participants
  //adding a simple ? to the user.interest fiels because that is optional 
  if (user.role === 'participant') {
    rolerelatedcontent = (
      <div>
        <h3>Participant Info</h3>
        <p><strong>First Name:</strong>{user.firstName}</p>
        <button onClick={changeFirstName}>Edit First Name</button>
        <p><strong>Last Name:</strong>{user.lastName}</p>
        <button onClick={changeLastName}>Edit Last Name</button>
        <p><strong>College Name:</strong>{user.collegename}</p>
        <button onClick={changeCollege}>Edit College Name</button>
        <p><strong>Participant Type:</strong> {user.participanttype}</p>
        <p><strong>Contact Number:</strong> {user.contactnumber}</p>
        <button onClick={changeContactNumber}>Edit Contact Number</button>
        <p><strong>Email:</strong> {user.email}</p>

        <p><strong>Interests:</strong> {user.interests?.join(', ')}</p>
        <button onClick={changeInterests}>Edit Interests</button>

        <p><strong>Password:</strong> ********</p>
        <button onClick={changePassword}>Change Password</button>

        <p><strong>Followed Clubs:</strong></p>
        {user.followedClubs && user.followedClubs.length > 0 ? (
          <ul>
            {user.followedClubs.map((club) => (
              <li key={club._id}>{club.organizername}</li>
            ))}
          </ul>
        ) : (
          <p>No clubs followed yet</p>
        )}
        <p><em>To manage clubs, visit the Organizers page</em></p>
      </div>
    );
  }
  else if (user.role === 'organizer') {
    rolerelatedcontent = (
      <div>
        <h3>Organizer Info</h3>
        <p><strong>Name:</strong> {user.organizername}</p>
        <button onClick={changeOrganizerName}>Edit Organizer Name</button>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Category:</strong> {user.category}</p>
        <button onClick={changeCategory}>Edit Category</button>
        <p><strong>Description:</strong> {user.description}</p>
        <button onClick={changeDescription}>Edit Description</button>
        <p><strong>Contact Email:</strong> {user.contactemail}</p>
        <button onClick={changeContactEmail}>Edit Contact Email</button>
        <p><strong>Discord Webhook URL:</strong> {user.discordWebhookUrl || "(not set)"}</p>
        <button onClick={changeDiscordWebhookUrl}>Edit Discord Webhook URL</button>
      </div>
    );
  }
  else if (user.role === 'admin') {
    rolerelatedcontent = (
      <div>
        <h3>Admin Info</h3>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Profile</h2>

      {rolerelatedcontent}

    </div>
  );
};

export default Profile;