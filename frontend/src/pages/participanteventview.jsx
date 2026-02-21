
import { useParams } from 'react-router-dom';
import api from '../api/axiosmiddleware';
import { useState, useEffect } from "react"
import EventChat from '../components/eventchat';
const ParticipantEventView = () => {
  const user = JSON.parse(localStorage.getItem('userData'));
  if (user.role !== 'participant') {
    window.location.href = '/';
  }
  const { eventId } = useParams();
  const [event, setEvent] = useState({});
  const [formData, setFormData] = useState({});
  const [fileUploads, setFileUploads] = useState({});
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [purchaseError, setPurchaseError] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const getEventDetails = async () => {
    try {
      const response = await api.get(`/api/events/getEvent/${eventId}`);
      const eventDetails = response.data.events;
      setEvent(eventDetails);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getEventDetails();
  }, []);

  const handleInputChange = (fieldLabel, value) => {
    setFormData({ ...formData, [fieldLabel]: value });
  };

  const handleFileUpload = (fieldLabel, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    if (file && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Only images and PDF files are allowed');
      return;
    }
    setFileUploads({ ...fileUploads, [fieldLabel]: file });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    setPaymentProof(file);

  };

  const handleSubmit = async () => {
    try {
      if (event.eventType === 'merchandise') {
        if (!paymentProof) {
          alert('Please upload payment proof for merchandise orders');
          return;
        }
        const formDataToSend = new FormData();
        formDataToSend.append('eventId', eventId);
        formDataToSend.append('selectedVariants', JSON.stringify(selectedVariants));
        formDataToSend.append('paymentProof', paymentProof);

        const response = await api.put('/api/registration/eventRegistration', formDataToSend);
        alert(`Registration submitted! ${response.data.message}`);
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('eventId', eventId);
        formDataToSend.append('formData', JSON.stringify(formData));

        Object.keys(fileUploads).forEach(fieldLabel => {
          formDataToSend.append(fieldLabel, fileUploads[fieldLabel]);
        });

        const response = await api.put('/api/registration/eventRegistration', formDataToSend);
        alert(`Registration submitted! ${response.data.message}`);
      }
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
    }
  };

  const handleVariantChange = (variant, isChecked) => {
    const newSelected = isChecked
      ? [...selectedVariants, variant]
      : selectedVariants.filter(v => v !== variant);

    // Check purchase limit
    if (newSelected.length > (event.merchandiseConfig?.purchaseLimit || 1)) {
      setPurchaseError(`Cannot select more than ${event.merchandiseConfig.purchaseLimit} items`);
      return;
    }

    // Check remaining stock
    if (newSelected.length > (event.merchandiseConfig?.itemsRemaining || 0)) {
      setPurchaseError(`Only ${event.merchandiseConfig.itemsRemaining} items available in stock`);
      return;
    }

    setPurchaseError("");
    setSelectedVariants(newSelected);
  };

  const renderField = (field) => {
    if (field.type === 'text') {
      return <input type="text" onChange={(e) => handleInputChange(field.label, e.target.value)} />;
    }
    if (field.type === 'number') {
      return <input type="number" onChange={(e) => handleInputChange(field.label, e.target.value)} />;
    }
    if (field.type === 'file') {
      return (
        <div>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(field.label, e.target.files[0])} />
          <p>Max 5MB (Images or PDF only)</p>
          {fileUploads[field.label] && <p>Selected: {fileUploads[field.label].name}</p>}
        </div>
      );
    }
    if (field.type === 'dropdown') {
      return (
        <select onChange={(e) => handleInputChange(field.label, e.target.value)}>
          <option value="">Select...</option>
          {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (field.type === 'checkbox') {
      return (
        <div>
          {field.options.map((opt, i) => (
            <label key={i}>
              <input type="checkbox" onChange={(e) => {
                const current = formData[field.label] || [];
                if (e.target.checked) {
                  handleInputChange(field.label, [...current, opt]);
                } else {
                  handleInputChange(field.label, current.filter(x => x !== opt));
                }
              }} /> {opt}
            </label>
          ))}
        </div>
      );
    }
  };

  if (event.eventType === 'normal') {
    return (
      <div>
        <h1>{event.eventName}</h1>
        <p>{event.eventDescription}</p>
        <p><strong>Eligibility:</strong> {event.eligibility}</p>
        <p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
        <p><strong>Event Dates:</strong> {new Date(event.eventStartDate).toLocaleDateString()} - {new Date(event.eventEndDate).toLocaleDateString()}</p>
        <p><strong>Registration Fee:</strong> ₹{event.registrationFee}</p>
        <p><strong>Tags:</strong> {event.eventTags?.join(', ') || 'None'}</p>
        <p><strong>Event Category:</strong> {event.eventCategory}</p>

        <h2>Registration Form</h2>
        {event.formFields && event.formFields.length > 0 ? (
          <div>
            {event.formFields.map((field, index) => (
              <div key={index}>
                <label><strong>{field.label}:</strong> {field.required && '*'}</label>
                {renderField(field)}
              </div>
            ))}
            <button onClick={handleSubmit}>Register</button>
          </div>
        ) : (
          <button onClick={handleSubmit}>Register</button>
        )}
        <EventChat eventId={eventId} isOrganizer={false} />
      </div>
    );
  }
  else if (event.eventType === 'merchandise') {
    const variants = event.merchandiseConfig?.variants ?
      event.merchandiseConfig.variants.split(',').map(v => v.trim()).filter(v => v) : [];

    return (
      <div>
        <h1>{event.eventName} (Merchandise Event)</h1>
        <p>{event.eventDescription}</p>
        <p><strong>Eligibility:</strong> {event.eligibility}</p>
        <p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
        <p><strong>Event Dates:</strong> {new Date(event.eventStartDate).toLocaleDateString()} - {new Date(event.eventEndDate).toLocaleDateString()}</p>
        <p><strong>Registration Fee:</strong> ₹{event.registrationFee}</p>
        <p><strong>Tags:</strong> {event.eventTags?.join(', ') || 'None'}</p>
        <p><strong>Event Category:</strong> {event.eventCategory}</p>

        <h2>Merchandise Details</h2>
        <p><strong>Item Name:</strong> {event.merchandiseConfig?.itemName}</p>
        <p><strong>Price:</strong> ₹{event.merchandiseConfig?.price}</p>
        <p><strong>Items Available:</strong> {event.merchandiseConfig?.itemsRemaining}</p>
        <p><strong>Purchase Limit per person:</strong> {event.merchandiseConfig?.purchaseLimit}</p>

        {variants.length > 0 && (
          <div>
            <h3>Select Variants:</h3>
            {variants.map((variant, index) => (
              <div key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedVariants.includes(variant)}
                    onChange={(e) => handleVariantChange(variant, e.target.checked)}
                  />
                  {variant}
                </label>
              </div>
            ))}
            {purchaseError && <p style={{ color: 'red' }}>{purchaseError}</p>}
            <p>Selected: {selectedVariants.join(', ')}</p>
          </div>
        )}

        <div>
          <h3>Payment Proof</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            required
          />
          {paymentProof && <p>File selected: {paymentProof.name}</p>}

        </div>

        <button
          onClick={handleSubmit}
          disabled={variants.length > 0 && selectedVariants.length === 0}
        >
          Register
        </button>
        <EventChat eventId={eventId} isOrganizer={false} />
      </div>
    );
  }

};

export default ParticipantEventView;