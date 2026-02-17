import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import api from '../api/axiosmiddleware';
import FormBuilder from '../components/dynamicformbuild';
import MerchConfig from '../components/merchconfig'
import { Html5QrcodeScanner } from 'html5-qrcode';

const EditEvents = () => {
    const { eventId } = useParams();
    const user = JSON.parse(localStorage.getItem("userData"));
    const [eventDetails, setEventDetails] = useState({
        eventName: "",
        eventType: "normal",
        eventStartDate: "",
        eventEndDate: "",
        eventStatus: "draft",
        eligibility: "All are eligible",
        registrationDeadline: "",
        registrationLimit: 0,
        registrationFee: 0,
        registeredCount: 0,
        eventTags: [],
        formFields: [],
        merchandiseConfig: {
            itemName: "",
            price: 0,
            variants: "",
            stock: 0,
            purchaseLimit: 1
        },
        eventDescription: "Fill Description Here",

    });
    
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [participantSearch, setParticipantSearch] = useState("");
    const [participantTypeFilter, setParticipantTypeFilter] = useState("all");
    const [analytics, setAnalytics] = useState(null);

    if (!user) {
        return <Navigate to="/" />
    }
    if (user.role !== "organizer") {
        return <Navigate to="/" />
    }

    const fetchEventDetails = async () => {
        try {
            const response = await api.get(`/api/events/getEventbyId/${eventId}`);
            const event = response.data.event;
            
            // Handle backwards compatibility for old variant format
            if (event.merchandiseConfig?.variants && Array.isArray(event.merchandiseConfig.variants)) {
                // Convert old format to new format
                const variantString = event.merchandiseConfig.variants
                    .map(v => v.options || []).flat().join(', ');
                event.merchandiseConfig.variants = variantString;
            }
            
            setEventDetails(event);
            console.log(event);
        } catch (error) {
            console.log("Error fetching event details:", error);
        } finally {
        }
    }

    const fetchRegistrations = async () => {
        try {
            const response = await api.get(`/api/registration/getEventRegistrations/${eventId}`);
            setParticipants(response.data.participants);
            setFilteredParticipants(response.data.participants);
        } catch (error) {
            console.log('Error fetching registrations: ' + error.message);
        }
    }

    const filterParticipants = () => {
        let filtered = participants;
        
        if(participantTypeFilter !== "all") {
            filtered = filtered.filter(p => {
                // This checks the email domain since we don't have direct access to participantType
                const isIIIT = p.email.endsWith('@students.iiit.ac.in') || p.email.endsWith('@research.iiit.ac.in');
                if(participantTypeFilter === "iiit") return isIIIT;
                if(participantTypeFilter === "non-iiit") return !isIIIT;
                return true;
            });
        }
        
        // Filter by name search
        if(participantSearch !== "") {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(participantSearch.toLowerCase())
            );
        }
        
        setFilteredParticipants(filtered);
    };

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/api/registration/getEventAnalytics/${eventId}`);
            setAnalytics(response.data);
            console.log("Analytics data:", response.data);
        } catch (error) {
            console.log('Error fetching analytics: ' + error.message);
        }
    }
    
    // Function to check if field should be disabled based on event status
    const isFieldDisabled = (fieldName) => {
        const status = eventDetails.eventStatus;
        const registeredCount = eventDetails.registeredCount || 0;
        const eventType = eventDetails.eventType;
        
        if(status === 'draft') {
            return false; // All fields editable in draft
        }
        else if(status === 'published') {
            // Only description, deadline, limit, status editable
            const allowedFields = ['eventDescription', 'registrationDeadline', 'registrationLimit', 'eventStatus'];
            
            // Form fields only editable if no registrations
            if(fieldName === 'formFields' && registeredCount === 0) return false;
            
            // Stock is editable for merchandise events
            if(fieldName === 'merchandiseConfig' && eventType === 'merchandise') return false;
            
            return !allowedFields.includes(fieldName);
        }
        else if(['ongoing', 'completed', 'closed'].includes(status)) {
            // Only status editable
            return fieldName !== 'eventStatus';
        }
        
        return false;
    }
    const setFormFields = (newFields) => {
        setEventDetails({ ...eventDetails, formFields: newFields });
    };
    useEffect(() => {
        fetchEventDetails();
        fetchRegistrations();
        fetchAnalytics();

        let html5QrcodeScanner;
        async function onScanSuccess(decodedText, decodedResult) {

    console.log(`Scan result: ${decodedText}`, decodedResult);
    
    // Pause scanner and show confirmation
    html5QrcodeScanner.pause();
    
    // Show confirmation popup
    const confirmAttendance = confirm("Do you want to mark this participant as present?");
    
    if (confirmAttendance) {
        try{
            const response = await api.post('/api/registration/markattendance', {ticketID: decodedText, eventId: eventId })
            alert(response.data.message)
            // Refresh registrations to update attendance list
            fetchRegistrations();
        }
        catch(error){
            alert("Error marking attendance: " + (error.response?.data?.message || error.message));
            console.error("Error marking attendance:", error);
        }
    } else {
        alert("Attendance marking cancelled");
    }
    
    try{
        await html5QrcodeScanner.clear();
    }
    catch(error){
        console.error("Error clearing QR code scanner:", error);
    }

    }

    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 30, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
    return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => {
                    console.log("err", error);
                });
            }
        }
    }, [eventId]);
    
    useEffect(() => {
        filterParticipants();
    }, [participants, participantSearch, participantTypeFilter]);
    


    const changeDetails = (e) => {
        setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
    }

    const handleTagChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        setEventDetails({ ...eventDetails, eventTags: tags });
    }

    const saveChanges = async () => {
        try {
            // Only include merchandiseConfig for merchandise events
            const eventData = {...eventDetails};
            if(eventData.eventType !== 'merchandise') {
                 eventData.merchandiseConfig = {};
            }
            
            await api.put(`/api/events/updateEvent/${eventId}`, eventData);
            alert("Event updated successfully");
            
        } catch (error) {
            alert("Error updating event: " + error.response.data.message);
            console.error("Error updating event:", error);
        }
        await fetchEventDetails();
    };

    const handleDownloadFile = async (registrationId, fieldName) => {
        try {
            const response = await api.get(`/api/registration/downloadFile/${registrationId}/${encodeURIComponent(fieldName)}`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fieldName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Error downloading file: " + (error.response?.data?.message || error.message));
        }
    };

    const downloadCSV = async () => {
        try {
            const response = await api.get(`/api/events/exportParticipants/${eventId}`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            //Here we esentially are creating a dummy <a> tag 
            link.href = url;
            link.download = `${eventDetails.eventName}_participants.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Error downloading CSV: " + (error.response?.data?.message || error.message));
            console.error("Error downloading CSV:", error);
        }
    };

    const handleApproveOrder = async (registrationId) => {
        try {
            await api.put('/api/registration/approveMerchandiseOrder', { registrationId });
            alert('Order approved successfully');
            fetchRegistrations();
        } catch (error) {
            alert('Error approving order: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRejectOrder = async (registrationId) => {
        const reason = prompt('Please provide a reason for rejection (optional):') || 'Payment verification failed';
        try {
            await api.put('/api/registration/rejectMerchandiseOrder', { registrationId, reason });
            alert('Order rejected successfully');
            fetchRegistrations();
        } catch (error) {
            alert('Error rejecting order: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleViewPaymentProof = async (registrationId) => {
        try {
            const response = await api.get(`/api/registration/getPaymentProof/${registrationId}`, {
                responseType: 'blob'
            });
            
            const file = new Blob([response.data], { type: 'image/jpeg' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (error) {
            console.error(error);
            alert("Error viewing payment proof. Ensure you are authorized.");
        }
    };

    const needFormBuilder = ()=>{
        if(eventDetails.eventType !== 'normal'){
            return null;
        }
        return (
            <FormBuilder 
                    formFields={eventDetails.formFields} 
                    setFormFields={setFormFields} 
                    isLocked={isFieldDisabled('formFields')} 
            />

        )
    };
    const setMerchconfig = (MerchConfigfields) =>{
        setEventDetails({...eventDetails,merchandiseConfig: MerchConfigfields})

    }

    const needMerchConfig = ()=>{
        if(eventDetails.eventType !== 'merchandise'){
            return null;
        }
        return (
            <MerchConfig 
                currmerchconfig={eventDetails.merchandiseConfig} 
                setMerchconfig={setMerchconfig} 
                disabled={isFieldDisabled('merchandiseConfig')} 
                eventStatus={eventDetails.eventStatus}
            />
        )
    };

    return (
        
        <div>
            <div style={{width: "500px"}} id="reader"></div>
            <h2>Edit Event: {eventDetails.eventName}</h2>

            <label>Event Name</label>
            <input 
                name="eventName" 
                value={eventDetails.eventName} 
                onChange={changeDetails}
                disabled={isFieldDisabled('eventName')} 
            />
            <br />

            <label>Description</label>
            <textarea 
                name="eventDescription" 
                value={eventDetails.eventDescription} 
                onChange={changeDetails}
                disabled={isFieldDisabled('eventDescription')} 
            />
            <br />

            <label>Type</label>
            <select 
                name="eventType" 
                value={eventDetails.eventType} 
                onChange={changeDetails}
                disabled={isFieldDisabled('eventType')}
            >
                <option value="normal">Normal</option>
                <option value="merchandise">Merchandise</option>
            </select>
            <br />

            <label>Eligibility(All,IIIT,NON-IIIT)</label>
            <input 
                name="eligibility" 
                value={eventDetails.eligibility} 
                onChange={changeDetails}
                disabled={isFieldDisabled('eligibility')} 
            />
            <br />

            <label>Registration Deadline</label>
            <input 
                type="datetime-local" 
                name="registrationDeadline" 
                value={eventDetails.registrationDeadline ? new Date(eventDetails.registrationDeadline).toISOString().slice(0, 16) : ''} 
                onChange={changeDetails}
                disabled={isFieldDisabled('registrationDeadline')} 
            />
            <br />

            <label>Start Date</label>
            <input 
                type="datetime-local" 
                name="eventStartDate" 
                value={eventDetails.eventStartDate ? new Date(eventDetails.eventStartDate).toISOString().slice(0, 16) : ''} 
                onChange={changeDetails}
                disabled={isFieldDisabled('eventStartDate')} 
            />
            <br />

            <label>End Date</label>
            <input 
                type="datetime-local" 
                name="eventEndDate" 
                value={eventDetails.eventEndDate ? new Date(eventDetails.eventEndDate).toISOString().slice(0, 16) : ''} 
                onChange={changeDetails}
                disabled={['completed', 'ongoing', 'closed'].includes(eventDetails.eventStatus)} 
            />
            <br />

            <label>Registration Limit</label>
            <input 
                type="number" 
                name="registrationLimit" 
                value={eventDetails.registrationLimit} 
                onChange={changeDetails}
                disabled={isFieldDisabled('registrationLimit')} 
            />
            <br />

            <label>Registration Fee</label>
            <input 
                type="number" 
                name="registrationFee" 
                value={eventDetails.registrationFee} 
                onChange={changeDetails}
                disabled={['completed', 'ongoing', 'closed'].includes(eventDetails.eventStatus)} 
            />
            <br />

            <label>Tags (comma separated)</label>
            <input 
                name="eventTags" 
                value={eventDetails.eventTags?.join(',')} 
                onChange={handleTagChange}
                disabled={isFieldDisabled('eventTags')} 
            />
            <br />

            <label>Status</label>
            <select 
                name="eventStatus" 
                value={eventDetails.eventStatus} 
                onChange={changeDetails}
            >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="ongoing">Ongoing</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
            </select>
            <br />
            
            {needFormBuilder()}
            {needMerchConfig()}
            <button onClick={saveChanges}>Save Changes</button>
            
            <h2>Analytics</h2>
            {analytics && (
                <div>
                    <p><strong>Total Registrations:</strong> {analytics.totalRegistrations}</p>
                    <p><strong>Total Revenue:</strong> ₹{analytics.totalRevenue}</p>
                    {analytics.eventType === 'merchandise' && (
                        <div>
                            <p><strong>Units Sold:</strong> {analytics.unitsSold}</p>
                            <p><strong>Units Not Sold:</strong> {analytics.unitsNotSold}</p>
                            <p><strong>Total Stock:</strong> {analytics.totalStock}</p>
                        </div>
                    )}
                </div>
            )}
            
            <h2>Participant Registrations</h2>
            {participants.length > 0 && (
                <div>
                    <input 
                        placeholder="Search participants by name..." 
                        value={participantSearch} 
                        onChange={(e) => setParticipantSearch(e.target.value)}
                    />
                    <label> Participant Type: </label>
                    <select value={participantTypeFilter} onChange={(e) => setParticipantTypeFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="iiit">IIIT</option>
                        <option value="non-iiit">Non-IIIT</option>
                    </select>
                    <button onClick={downloadCSV} style={{marginLeft: '10px'}}>Download Participants CSV</button>
                </div>
            )}
            {participants.length === 0 ? (
                <p>No registrations yet</p>
            ) : filteredParticipants.length === 0 ? (
                <p>No participants match your search criteria</p>
            ) : (
                filteredParticipants.map((participant, index) => (
                    <div key={index} style={{border: '1px solid #ccc', padding: '15px', margin: '10px 0'}}>
                        <p><strong>Name:</strong> {participant.name}</p>
                        <p><strong>Email:</strong> {participant.email}</p>
                        <p><strong>Registered At:</strong> {new Date(participant.registeredAt).toLocaleDateString()}</p>
                        
                        {eventDetails.eventType === 'merchandise' && (
                            <div>
                                <p><strong>Order Status:</strong> 
                                    <span>
                                        {participant.status}
                                    </span>
                                </p>
                                
                                {participant.hasPaymentProof && (
                                    <div>
                                        <button onClick={() => handleViewPaymentProof(participant.registrationId)}>
                                            View Payment Proof
                                        </button>
                                    </div>
                                )}
                                
                                {participant.status === 'Pending' && (
                                    <div style={{marginTop: '10px'}}>
                                        <button 
                                            onClick={() => handleApproveOrder(participant.registrationId)}
                                           
                                        >
                                            Approve Order
                                        </button>
                                        <button 
                                            onClick={() => handleRejectOrder(participant.registrationId)}
                                            
                                        >
                                            Reject Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {Object.keys(participant.formData || {}).length > 0 && (
                            <div>
                                <p><strong>Form Responses:</strong></p>
                                {Object.entries(participant.formData).map(([question, answer]) => {
                                    const field = eventDetails.formFields?.find(f => f.label === question);
                                    if (field && field.type === 'file') {
                                        return (
                                            <div key={question}>
                                                <p>{question}: 
                                                    <button onClick={() => handleDownloadFile(participant.registrationId, question)}>
                                                        Download File
                                                    </button>
                                                </p>
                                            </div>
                                        );
                                    }
                                    return <p key={question}>{question}: {Array.isArray(answer) ? answer.join(', ') : answer}</p>;
                                })}
                            </div>
                        )}
                        
                        {participant.merchandiseSelection && participant.merchandiseSelection.length > 0 && (
                            <p><strong>Merchandise Selected:</strong> {participant.merchandiseSelection.join(', ')}</p>
                        )}
                    </div>
                ))
            )}
            
            <h2>Live Attendance Dashboard</h2>
            {participants.length === 0 ? (
                <p>No registrations yet</p>
            ) : (
                <div>
                    <div style={{marginBottom: '20px'}}>
                        <p><strong>Total Registered:</strong> {participants.length}</p>
                        <p><strong>Attended:</strong> {participants.filter(p => p.hasAttended).length}</p>
                        <p><strong>Not Yet Scanned:</strong> {participants.filter(p => !p.hasAttended).length}</p>
                    </div>
                    
                    {filteredParticipants.map((participant, index) => (
                        <div key={index} style={{border: '1px solid #ccc', padding: '15px', margin: '10px 0', backgroundColor: participant.hasAttended ? '#e6ffe6' : '#ffe6e6'}}>
                            <p><strong>Name:</strong> {participant.name}</p>
                            <p><strong>Email:</strong> {participant.email}</p>
                            <p><strong>Attended:</strong> {participant.hasAttended ? 'TRUE' : 'FALSE'}</p>
                            {participant.hasAttended && participant.attendedAt && (
                                <p><strong>Attended At:</strong> {new Date(participant.attendedAt).toLocaleString()}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default EditEvents;