import React from 'react';

const FormBuilder = ({ formFields, setFormFields, isLocked }) => {

    const addField = () => {
        setFormFields([...formFields, { label: "", type: "text", required: false, options: [] }]);
    };

    const removeField = (index) => {
        const newFields = [...formFields]
        newFields.splice(index, 1);
        setFormFields(newFields);
    };

    const updateField = (index, key, value) => {
        const newFields = [...formFields];
        newFields[index][key] = value;
        setFormFields(newFields);
    };

    const handleOptions = (index, value) => {
        const optionsArray = value.split(',');
        updateField(index, 'options', optionsArray);
    };

    return (
        <div>
            <h3>Registration Form Builder</h3>
            
            {isLocked && <h4>LOCKED: Cannot edit (Registrations exist)</h4>}

            {formFields.map((field, index) => (
                <div key={index} >
                    
                    {!isLocked && (
                        <div>
                            <button onClick={() => removeField(index)}>Delete</button>
                        </div>
                    )}

                    <label>Question:</label>
                    <input 
                        type="text" 
                        placeholder="e.g. T-Shirt Size"
                        value={field.label} 
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        disabled={isLocked}
                    />

                    <label> Type: </label>
                    <select 
                        value={field.type} 
                        onChange={(e) => updateField(index, 'type', e.target.value)}
                        disabled={isLocked}
                    >
                        <option value="text">Text Answer</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                    </select>

                    <label style={{ marginLeft: '10px' }}>
                        <input 
                            type="checkbox" 
                            checked={field.required}
                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                            disabled={isLocked}
                        /> 
                        Required?
                    </label>

                    {(field.type === 'dropdown' || field.type === 'checkbox') && (
                        <div>
                            <label>Options (comma separated): </label>
                            <input 
                                type="text" 
                                placeholder="Red, Blue, Green"
                                value={field.options.join(',')}
                                onChange={(e) => handleOptions(index, e.target.value)}
                                disabled={isLocked}
                            />
                        </div>
                    )}
                </div>
            ))}

            {!isLocked && <button onClick={addField}>+ Add New Question</button>}
        </div>
    );
};

export default FormBuilder;