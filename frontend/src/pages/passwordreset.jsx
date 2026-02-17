import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PasswordReset = () => {
    const [userType, setUserType] = useState(''); // 'participant' or 'organizer'
    const [formData, setFormData] = useState({ email: '', reason: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userType) {
            alert("Please select your user type");
            return;
        }

        if (!formData.email) {
            alert("Please enter your email");
            return;
        }

        if (userType === 'organizer' && !formData.reason) {
            alert("Please provide a reason for password reset");
            return;
        }

        setLoading(true);
        try {
            let response;
            if (userType === 'organizer') {
                // Organizer: submit request for admin approval
                response = await axios.post('/api/users/organizerPasswordResetRequest', {
                    email: formData.email,
                    reason: formData.reason
                });
            } else {
                // Participant: send email directly with new password
                response = await axios.post('/api/users/participantPasswordReset', {
                    email: formData.email
                });
            }
            
            alert(response.data.message);
            setFormData({ email: '', reason: '' });
            setUserType('');
        } catch (error) {
            console.error("Password reset failed:", error);
            alert(error.response?.data?.message || "Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <p>Select your user type and submit a password reset request.</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>User Type: </label>
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="participant">Participant</option>
                        <option value="organizer">Organizer</option>
                    </select>
                </div>
                <br />

                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={`Enter your ${userType || 'user'} email`}
                        required
                    />
                </div>
                <br />

                {userType === 'organizer' && (
                    <>
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
                        <p>
                            Note: Organizer password reset requests require admin approval.
                        </p>
                        <br />
                    </>
                )}

                {userType === 'participant' && (
                    <>
                        <p>
                            A new password will be sent to your email address.
                        </p>
                        <br />
                    </>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Reset Password'}
                </button>
            </form>

            <p>
                <Link to="/login">Back to Login</Link>
            </p>
        </div>
    );
};

export default PasswordReset;
