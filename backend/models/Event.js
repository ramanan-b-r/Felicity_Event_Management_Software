const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FormFieldSchema = new Schema({
    label: { type: String, required: true }, 
    type: { 
        type: String, 
        enum: ['text', 'number', 'email', 'dropdown', 'date', 'checkbox'], 
        required: true 
    },
    options: [{ type: String }], 
    required: { type: Boolean, default: false }
});

const MerchandiseSchema = new Schema({
    itemName: { type: String }, 
    price: { type: Number },    
    images: [{ type: String }], 
    
    variants: [{
        variantType: { type: String }, 
        options: [{ type: String }]    
    }],
    
    stock: { type: Number, default: 0 }, 
    purchaseLimit: { type: Number, default: 1 } 
});

const EventSchema = new Schema({
    eventName: { type: String, required: true },
    eventDescription: { type: String, required: true },
    eventType: { 
        type: String, 
        enum: ['normal', 'merchandise'], 
        required: true 
    },
    eligibility: { type: String, required: true }, 
    registrationDeadline: { type: Date, required: true },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    registrationLimit: { type: Number, required: true }, 
    registrationFee: { type: Number, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventTags: [{ type: String }],
    eventStatus :{
        type: String,
        enum: ['draft', 'ongoing', 'published', 'closed'],
        default: 'draft'
    },

    
    formFields: [FormFieldSchema], 

    merchandiseConfig: MerchandiseSchema 

}, {
    timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);