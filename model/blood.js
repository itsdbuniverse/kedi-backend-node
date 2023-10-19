const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create User form schema & model
const BloodSchema = new Schema({
    bloodReportId:{
        type: Number
    },
    bloodReport_refrenceId:{
        type: String
    },
    blood_appoDate:{
        type: String,
        required:true,
    },
    blood_appoTime:{
        type:String,
        required:true,
    },
    blood_testName:{
        type:String,
        required:true
    },
    blood_testDetails:{
        type:String,
        required:true
    },
    blood_testResult:{
        type:String,
        required:true
    },
    blood_testCharge:{
        type:Number,
        required:true
    },
    blood_drsuggest:{
        type:String,
        required:true
    },
    blood_Hospital:{
        type:String,
        required:true
    },
    blood_raison:{
        type:String,
        required:true
    },
    docsdata:{
        type:String,
    },
    patientId:{
        type:Number
    },
    drId:{
        type:Number
    },
    drName:{
        type:String
    },
    drimg:{
        type:String
    }
  
},
{ timestamps: { createdAt: 'created_at' } });

const Blood = mongoose.model('bloodreports',BloodSchema);

module.exports = Blood;