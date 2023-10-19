const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PharmacistlistScema = new Schema({
    pharmacistId: {
        type:Number,
        required:true,
    },
    pharmacyName: {
        type: String,
        required:true
    }
},
    { timestamps: { createdAt: 'created_at' } }
);
const Pharmacistlist = mongoose.model('pharmacistlist', PharmacistlistScema);

module.exports = Pharmacistlist;