const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create User form schema & model
const PatientSchema = new Schema({
    patientId:{
        type: Number
    },
    patient_refrenceId:{
        type: String
    },
    patientName:{
        type: String,
        required: [true, 'What is Patient name? Name field is required'],
        trim: true,
    },
    patientGender: {
        type: String,
        required: [true, 'What is Patient Gender? Gender field is required'],
    },
    patientMobile: {
        type: Number,
        required: [true, 'What is your contact number? Tis field is required'],
        unique: true,
    },
    patientEmail: {
        type: String,
        required: [true, 'What is your EmailId? EmailId field is required'],
        match:[ /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , 'Please add a valid email address.'],
        unique: true,
        lowercase: true,
    },
    patientDOB: {
        type: String,
        required: [true, 'What is Patient DOB? DOB field is required'],
    },
    patientMedicationTaken: {
        type: Array,
        // required:true
    }, 
    is_active:{
        type:Number
    },
    is_approved:{
        type:Number
    },
    profile:{
        type:String
    },
   
    patientPid:{
        type:String,
        required: true,
    },
    patientPiddoc:{
        type:String,
        required: true,
    },
    patientAddress:{
        type: String,
        trim: true,
        required: true,
    },
    docimg:{
        type:String
    },
    otp:{
        type:Number
    },
    qrcode:{
        type:String
    },
    hospital_id:{
        type:Number
    },
    hospital_name:{
        type:String
    },
    doctor_id:{
        type:Number
    },
    doctor_name:{
        type:String
    },
    notifyToken:{
        type:String
    },
    pharma_id:{
        type: Number
    },
    addedByPharma:{
        type : Boolean
    }
   
},
{ timestamps: { createdAt: 'created_at' } });
const PatientDetails = mongoose.model('patient',PatientSchema);
module.exports = PatientDetails;