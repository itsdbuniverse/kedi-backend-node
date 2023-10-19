const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create User form schema & model
const VaccinationSchema = new Schema({
    vaccinationId:{
        type: Number
    },
    vaccination_refrenceId:{
        type: String
    },
    v_appoDate:{
        type: String,
        required:true,
    },
    v_appoTime:{
        type:String,
        required:true,
    },
    vaccinationName:{
        type:String,
        required:true
    },
    vaccinationDetails:{
        type:String,
        required:true
    },
    vaccinationcharge:{
        required:true,
        type:Number
    },
    v_Hospital:{
        type:String,
        required:true
    },
    v_raison:{
        type:String,
        required:true
    },
    patientId:{
        type:Number
    },
    v_docsdata:{
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
    expirydate:{
        type:String
    }
},
{ timestamps: { createdAt: 'created_at' } });

const Vaccination = mongoose.model('vaccination',VaccinationSchema);

module.exports = Vaccination;