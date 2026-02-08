import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const OrganizerPasswordReset = () => {
    const [formData, setFormData] = useState({ email: '', reason: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.reason) {
            alert("Please fill in both email and reason");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/users/organizerPasswordResetRequest', {
                email: formData.email,
                reason: formData.reason
            });
            alert(response.data.message);
            setFormData({ email: '', reason: '' });
        } catch (error) {
            console.error("Password reset request failed:", error);
            alert(error.response?.data?.message || "Password reset request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Organizer Password Reset</h2>
            <p>Submit a password reset request. An admin will review and approve/reject your request.</p>
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your organizer email"
                        required
                    />
                </div>
                <br />

                <div>
                    <label>Reason: </label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Explain why you need a password reset"
                        rows="4"
                        cols="50"
                        required
                    />
                </div>
                <br />

                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>

            <p>
                <Link to="/login">Back to Login</Link>
            </p>
        </div>
    );
};

export default OrganizerPasswordReset;