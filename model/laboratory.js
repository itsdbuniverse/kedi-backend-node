const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LabrotarylistScema = new Schema({
    laboratoryId: {
        type:Number,
        required:true,
    },
    laboratoryName: {
        type: String,
        required:true
    }
},
    { timestamps: { createdAt: 'created_at' } }
);
const Labrotarylist = mongoose.model('labrotarylist', LabrotarylistScema);

module.exports = Labrotarylist;