const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// create User form schema & model
const notificationSchema = new Schema({
    patientId: {
        type: Number
    },
    userId: {
        type: Number
    },
    admin:{
        type:Boolean
    },
    notificationTitle: {
        type: String
    },
    notificationMsg: {
        type: String
    },
    isOpen:{
        type : Boolean,
        default: false
    }
},
    { timestamps: true });

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification; 