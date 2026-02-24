import { Navigate } from "react-router-dom"
import api from '../api/axiosmiddleware';
import { useState, useEffect } from "react"

const Clubs = () => {
    const user = JSON.parse(localStorage.getItem("userData"))
    const [organizers, setOrganizers] = useState([])
    const [filtered, setFiltered] = useState([])
    const [followedOrganizers, setFollowedOrganizers] = useState([])

    if (!user) {
        return <Navigate to="/login" />
    }
    if (user.role !== 'participant') {
        if (user.role === 'organizer') {
            return <Navigate to="/organizerdashboard" />
        }
        return <Navigate to="/admindashboard" />
    }

    const getAllOrganizers = async () => {
        try {
            const response = await api.get('/api/users/getAllOrganizers');
            setOrganizers(response.data.organizers);
            setFiltered(response.data.organizers);
        } catch (error) {
            alert("Error fetching organizers: " + error.message);
        }
    }

    const getProfile = async () => {
        try {
            const response = await api.get('/api/users/getProfile');
            // Extract just the IDs from the populated followedClubs
            const followedIds = (response.data.followedClubs || []).map(club =>
                typeof club === 'string' ? club : club._id
            );
            setFollowedOrganizers(followedIds);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }

    useEffect(() => {
        getAllOrganizers()
        getProfile()
    }, [])

    const followOrganizer = async (organizerId) => {
        try {
            await api.post('/api/users/followOrganizer', { organizerId: organizerId });
            setFollowedOrganizers([...followedOrganizers, organizerId]);
            alert("Successfully followed organizer!");
        } catch (error) {
            alert("Error following organizer: " + error.message);
        }
    }

    const unfollowOrganizer = async (organizerId) => {
        try {
            await api.post('/api/users/unfollowOrganizer', { organizerId: organizerId });
            setFollowedOrganizers(followedOrganizers.filter(id => id !== organizerId));
            alert("Successfully unfollowed organizer!");
        } catch (error) {
            alert("Error unfollowing organizer: " + error.message);
        }
    }

    const filterOrganizers = (e) => {
        if (e.target.value === "followed") {
            const temp = organizers.filter(organizer => followedOrganizers.includes(organizer._id))
            setFiltered(temp)
        }
        else if (e.target.value === "unfollowed") {
            const temp = organizers.filter(organizer => !followedOrganizers.includes(organizer._id))
            setFiltered(temp)
        }
        else if (e.target.value === "all") {
            setFiltered(organizers)
        }
    }

    return (
        <div>
            <h2>Organizers / Clubs</h2>
            <label>Filter organizers</label>
            <select onChange={filterOrganizers}>
                <option value="all">All Organizers</option>
                <option value="followed">Followed</option>
                <option value="unfollowed">Unfollowed</option>
            </select>

            {filtered.length === 0 ? <p>No organizers found</p> : filtered.map((organizer) => (
                <div key={organizer._id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
                    <h3>{organizer.organizername}</h3>
                    <p><strong>Category:</strong> {organizer.category}</p>
                    <p><strong>Description:</strong> {organizer.description}</p>
                    <p><strong>Contact Email:</strong> {organizer.contactemail}</p>

                    {followedOrganizers.includes(organizer._id) ? (
                        <button onClick={() => unfollowOrganizer(organizer._id)}>Unfollow</button>
                    ) : (
                        <button onClick={() => followOrganizer(organizer._id)}>Follow</button>
                    )}
                    <button onClick={() => window.location.href = `/organizerview/${organizer._id}`}>View Details</button>
                </div>
            ))}
        </div>
    )
};

export default Clubs;
