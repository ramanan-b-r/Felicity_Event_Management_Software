import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axiosmiddleware';
const ManageOrganizers = () => {

    const user = JSON.parse(localStorage.getItem("userData") || "null");
    const [organizers, setOrganizers] = useState([]);
    const [userForm, setUserForm] = useState({ organizername: '', email: '', password: '', contactemail: '', description: '', category: "" });
    const getOrganizers = async () => {
        try {
            const response = await api.get('/api/users/getOrganizers');
            setOrganizers(response.data.organizers);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching organizers:", error);
        }
    };

    useEffect(() => {
        getOrganizers();
    }, []);

    const handleSubmit = async (e) => {
        try {
            const response = await api.post('/api/users/createOrganizer', userForm);

            if (response.data.credentials) {
                alert(
                    `Organizer account created successfully!\n\n` +
                    `Login Email: ${response.data.credentials.email}\n` +
                    `Password: ${response.data.credentials.password}\n\n` +
                    `SAVE THIS PASSWORD SAFELY - It will only be displayed once!\n` +
                    `(Credentials have also been sent via email)`
                );
            }

            setUserForm({ organizername: '', email: '', password: '', contactemail: '', description: '', category: '' });
            getOrganizers();
        } catch (error) {
            console.error("There was an error!", error);
            alert("Registration failed ensure all fields are given");
        }
    }
    const archiveaccount = async (organizerId, status) => {
        if (status === 'archived') {
            alert("Account is already archived");
            return;
        }
        try {
            const response = await api.put(`/api/users/updateOrganizerStatus`, { id: organizerId, status: 'archived' });
            getOrganizers();
        } catch (error) {
            console.error("There was an error!", error);
            alert("Archiving failed");
        }
    }
    const unarchiveaccount = async (organizerId, status) => {
        if (status === 'active') {
            alert("Account is already active");
            return;
        }
        try {
            const response = await api.put(`/api/users/updateOrganizerStatus`, { id: organizerId, status: 'active' });
            getOrganizers();
        } catch (error) {
            alert("Unarchiving failed");
        }

    }
    const deleteaccount = async (organizerId) => {
        try {
            const response = await api.put(`/api/users/deleteOrganizer`, { id: organizerId });
            getOrganizers();
        } catch (error) {
            alert("Deleting failed");
        }

    }
    if (!user) {
        return <Navigate to="/login" />
    }
    if (user.role !== 'admin') {
        return <Navigate to="/" />
    }
    return (
        <div>

            <h1>Manage Organizers Page</h1>

            <div>
                <p><strong>Create Organizer Account</strong></p>
                <label>Name: </label>
                <input type="text" placeholder="Organizer Name" onChange={(e) => { setUserForm({ ...userForm, organizername: e.target.value }) }} />
                <br />
                <label>Email: </label>
                <input type="email" placeholder="Organizer Email(if empty will be auto generated)" onChange={(e) => { setUserForm({ ...userForm, email: e.target.value }) }} />
                <br />
                <label> Password: </label>
                <input type="password" placeholder="Password(if empty will be auto generated)" onChange={(e) => { setUserForm({ ...userForm, password: e.target.value }) }} />
                <br />
                <label>Contact Email: </label>
                <input type="text" placeholder="Contact Email(alternate if not entered same as email)" onChange={(e) => { setUserForm({ ...userForm, contactemail: e.target.value }) }} />
                <br />
                <label>Description: </label>
                <input type="text" placeholder="Description" onChange={(e) => { setUserForm({ ...userForm, description: e.target.value }) }} />
                <br />
                <label>Category: </label>
                <input type="text" placeholder="Category" onChange={(e) => { setUserForm({ ...userForm, category: e.target.value }) }} />
                <br />
                <button onClick={handleSubmit}>Create Organizer</button>
            </div>
            {organizers.map((organizer) => (
                <div key={organizer._id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                    <p><strong>Name:</strong> {organizer.organizername}</p>
                    <p><strong>Email:</strong> {organizer.email}</p>
                    <p><strong>Contact Email:</strong> {organizer.contactemail}</p>
                    <p><strong>Password:</strong> {organizer.password}</p>
                    <p><strong>Description:</strong> {organizer.description}</p>
                    <p><strong>Category:</strong> {organizer.category}</p>
                    <p><strong>Status:</strong> {organizer.status}</p>
                    <button onClick={() => archiveaccount(organizer._id, organizer.status)}>Archive Account</button>
                    <button onClick={() => unarchiveaccount(organizer._id, organizer.status)}> UnArchive Account</button>

                    <button onClick={() => deleteaccount(organizer._id)}>Delete Account</button>
                </div>
            ))}
        </div>
    )
}

export default ManageOrganizers;