const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create User form schema & model
const RadiologySchema = new Schema({
    radiologyId:{
        type: Number
    },
    radiology_refrenceId:{
        type: String
    },
    r_appoDate:{
        type: String,
        required:true,
    },
    r_appoTime:{
        type:String,
        required:true,
    },
    r_testName:{
        type:String,
        required:true
    },
    r_testDetails:{
        type:String,
        required:true
    },
    r_testResult:{
        type:String,
        required:true
    },
    r_testCharge:{
        type:Number,
        required:true
    },
    r_Hospital:{
        type:String,
        required:true
    },
    r_raison:{
        type:String,
        required:true
    },
    is_active:{
        type:Number
    },
    patientId:{
        type:Number
    },
    r_docsdata:{
        type:String
    },
    drId:{
        type:Number
    },
    drName:{
        type:String
    },
    drimg:{
        type:String
    },
    r_notes:{
        type:String
    }
},
{ timestamps: { createdAt: 'created_at' } });

const Radiology = mongoose.model('radiology',RadiologySchema);

module.exports = Radiology;