import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axiosmiddleware';

const AdminPasswordReset = () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />
    }

    const getPasswordResetRequests = async () => {
        try {
            const response = await api.get('/api/users/getPasswordResetRequests');
            setRequests(response.data.requests);
        } catch (error) {
            alert("Error fetching password reset requests: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPasswordResetRequests();
    }, []);

    const handleRequest = async (requestId, status, comment = '') => {
        if (status === 'approved' && !comment.trim()) {
            const commentInput = prompt("Please add a comment for approval:");
            if (!commentInput) return;
            comment = commentInput;
        } else if (status === 'rejected' && !comment.trim()) {
            const commentInput = prompt("Please add a reason for rejection:");
            if (!commentInput) return;
            comment = commentInput;
        }

        setProcessingId(requestId);
        try {
            const response = await api.put('/api/users/handlePasswordResetRequest', {
                requestId,
                status,
                comment
            });
            
            alert(response.data.message);
            
            // Refresh the requests
            getPasswordResetRequests();
        } catch (error) {
            alert("Error handling request: " + error.response?.data?.message || error.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div>Loading password reset requests...</div>;
    }

    return (
        <div>
            <h2>Password Reset Requests</h2>
            
            {requests.length === 0 ? (
                <p>No password reset requests found.</p>
            ) : (
                requests.map((request) => (
                    <div key={request._id} style={{border: '1px solid #ccc', padding: '15px', margin: '10px 0'}}>
                        <h3>Request from: {request.organizerName}</h3>
                        <p><strong>Email:</strong> {request.organizerEmail}</p>
                        <p><strong>Reason:</strong> {request.reason}</p>
                        <p><strong>Status:</strong> {request.status}</p>
                        <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                        {request.comment && <p><strong>Admin Comment:</strong> {request.comment}</p>}
                        
                        {request.status === 'pending' && (
                            <div>
                                <button 
                                    onClick={() => handleRequest(request._id, 'approved')}
                                    disabled={processingId === request._id}
                                >
                                    {processingId === request._id ? 'Processing...' : 'Approve'}
                                </button>
                                <button 
                                    onClick={() => handleRequest(request._id, 'rejected')}
                                    disabled={processingId === request._id}
                                >
                                    {processingId === request._id ? 'Processing...' : 'Reject'}
                                </button>
                            </div>
                        )}
                        
                        {request.status !== 'pending' && (
                            <p><strong>Last Updated:</strong> {new Date(request.updatedAt).toLocaleDateString()}</p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminPasswordReset;