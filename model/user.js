const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create User form schema & model
const UserSchema = new Schema({
    userId: {
        type: Number,
    },
    user_refrenceId: {
        type: String,
    },
    userType: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: [true, 'What is your Name? Name field is required'],
        trim: true,
    },
    userGender: {
        type: String,
        required: [true, 'What is your gender? Gender field is required'],
    },
    userDOB: {
        type: String,
        required: [true, 'What is user DOB? DOB field is required'],
    },
    userMobile: {
        type: Number,
        required: [true, 'What is your contact number? Tis field is required'],
        unique: true,
    },
    userAddress:{
        type: String,
        trim: true,
        required: [true, 'What is your Address? Address field is required'],
    },
    userPiddoc:{
        type:String,
        required: true,
    },
    userPid:{
        type:String,
        required: true,
    },
    userEmail: {
        type: String,
        required: [true, 'What is your EmailId? EmailId field is required'],
        match:[ /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , 'Please add a valid email address.'],
        unique: true,
        lowercase: true,
    },
    userPassword:{
        type: String,
        required: [true, 'Please fill the Password Feild. Password field is required'],
    },
    otp:{
        type:Number
    },
    role:{
        type:Number
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
    docimg:{
        type:String
    },
    hospital_id:{
        type:Number
    },
    hospital_name:{
        type:String
    },
    phrma_id:{
        type:Number
    },
    phrma_name:{
        type:String
    },
    lab_id:{
        type:Number
    },
    lab_name:{
        type:String
    },
    notifyToken:{
        type:String
    }
},
{ timestamps: { createdAt: 'created_at' } });

const User = mongoose.model('user',UserSchema);

module.exports = User;