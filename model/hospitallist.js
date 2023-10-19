const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HospitallistScema = new Schema({
    hospitalId: {
        type:Number,
    },
    hospitalrefrenceId: {
        type:String,
    },
    hospitalName: {
        type: String,
        required:true
    }
},
    { timestamps: { createdAt: 'created_at' } }
);
const Hospitallist = mongoose.model('hospitallist', HospitallistScema);

module.exports = Hospitallist;