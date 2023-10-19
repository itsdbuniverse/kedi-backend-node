const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create User form schema & model
const PrescriptionSchema = new Schema({
    prescriptionId:{
        type: Number
    },
    prescription_refrenceId:{
        type: String
    },
    p_appoDate:{
        type: String,
        required:true,
    },
    p_nextcheckup:{
        type:String
    },
    p_appoTime:{
        type:String,
        required:true,
    },
    p_raison:{
        type:String,
        required:true,
    },
    patientId:{
        type:Number
    },
    p_docsdata:{
        type:String
    },
    patientId:{
        type:Number
    },
    pharmacyname:{
        type: String
    },
    medicinename:{
        type:Array
    },
    dosage:{
        type:String
    },
    p_diseases:{
        type:Array,
    },
    prescription:{
        type:String
    }
    // drId:{
    //     type:Number
    // },
    // drName:{
    //     type:String
    // },
    // drimg:{
    //     type:String
    // }
},
{ timestamps: { createdAt: 'created_at' } });

const Prescription = mongoose.model('prereports',PrescriptionSchema);

module.exports = Prescription;