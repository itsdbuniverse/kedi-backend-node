const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create User form schema & model
const UrineStooleSchema = new Schema({
    uninetestId:{
        type: Number
    },
    uninetest_refrenceId:{
        type: String
    },
    u_appoDate:{
        type: String,
        required:true,
    },
    u_appoTime:{
        type:String,
        required:true,
    },
    u_testName:{
        type:String,
        required:true
    },
    u_raison:{
        type:String,
        required:true
    },
    u_testDetails:{
        type:String,
        required:true
    },
    u_testResult:{
        type:String,
        required:true
    },
    u_testCharge:{
        type:Number,
        required:true
    },
    u_drsuggest:{
        type:String,
        required:true
    },
    u_Hospital:{
        type:String,
        required:true
    },
    patientId:{
        type:Number
    },
    u_docsdata:{
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
    }
},
{ timestamps: { createdAt: 'created_at' } });

const Urinestoole = mongoose.model('urinestoole',UrineStooleSchema);

module.exports = Urinestoole;