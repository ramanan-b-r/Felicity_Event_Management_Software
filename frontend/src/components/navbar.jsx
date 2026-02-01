import {Link} from "react-router-dom";


const navbar = () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if(!user){
        return (
            <nav>
                <ul>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                </ul>
            </nav>
        );
    }

    else if(user.role=='participant'){
        return (
            <nav>
                <ul>
                    <li><Link to="/participantdashboard">Dashboard</Link></li>
                    <li><Link to="/events">Browse Events</Link></li>
                    <li><Link to="/clubs">Clubs</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/logout">Logout</Link></li>
                </ul>
            </nav>
        );
    } 
    else if(user.role=='organizer'){
        return (
            <nav>
                <ul>
                    <li><Link to="/organizerdashboard">Dashboard</Link></li>
                    <li><Link to="/createevent">Create Event</Link></li>
                    <li><Link to="/manage-events">Manage Events</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/logout">Logout</Link></li>
                </ul>
            </nav>
        );
    }
    else if(user.role=='admin'){
        return (
            <nav>
                <ul>
                    <li><Link to="/admindashboard">Dashboard</Link></li>
                    <li><Link to="/manageorganizers">Manage Organizers</Link></li>
                    <li><Link to="/passwordreset">Password Reset</Link></li>
                    <li><Link to="/logout">Logout</Link></li>
                </ul>
            </nav>
        );
    }   
};

export default navbar; 