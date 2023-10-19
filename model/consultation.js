const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// create User form schema & model
const ConsultationSchema = new Schema({
    consultationId:{
        type: Number
    },
    consultation_refrenceId:{
        type: String
    },
    c_appoDate:{
        type: String,
        required:true,
    },
    c_appoTime:{
        type:String,
        required:true,
    },
    consultationName:{
        type:String,
        required:true
    },
    consultationResult:{
        type:String,
        required:true
    },
    c_raison:{
        type:String,
        required:true
    },
    consultationPrescription:{
        type:String,
        required:true
    },
    consultationNotes:{
        type:String,
        required:true
    },
    consultationCharge:{
        type:Number,
        required:true
    },
    c_Hospital:{
        type:String,
        required:true
    },
    is_active:{
        type:Number
    },
    c_docsdata:{
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

const Consultation = mongoose.model('consultation',ConsultationSchema);

module.exports = Consultation;