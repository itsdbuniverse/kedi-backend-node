const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Notification = require('../model/notification');
const Patient = require('../model/patient');
const { sendSms } = require('../Firebase')
const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en')

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

/* update token in user and patient */
router.put('/token/user/:userId', async (req, res) => {
    try {
        console.log(req.body.token, req.params.userId)
        await User.findOneAndUpdate({ userId: req.params.userId }, { notifyToken: req.body.token })
            .then((user) => {
                res.status(200).json({ Message: "Token added successfully" })
            })
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})

router.put('/token/patient/:patientId', async (req, res) => {
    try {
        await Patient.findOneAndUpdate({ patientId: req.params.patientId }, { notifyToken: req.body.token })
            .then((user) => {
                res.status(200).json({ Message: "Token added successfully" })
            })
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})

router.get('/admin/all', async (req, res) => {
    try {
        const admins = await User.find({ role: 1 })
        if (admins.length > 0) {
            res.status(200).json({ admins })
        } else {
            res.status(200).json({ Message: "Admin not found" })
        }
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})

/* Send notifications */
router.post('/admin/send', async (req, res) => {
    try {
        const { userId, title, message, patientId } = req.body
        console.log("userId", userId , "patientId" , patientId)
        if (userId) {
            const user = await User.findOne({ userId })
            console.log(user)
            if (user.role == 2) {
                console.log("inside user >>>>>>>>>>>>>>>>>")
                const notification = await Notification.create({
                    patientId: null,
                    userId: userId,
                    notificationTitle: title,
                    notificationMsg: message,
                })
                sendSms(user.notifyToken, title, message)
                res.status(200).json({
                    notification
                })
            }
        }
        else if (patientId) {
            const patient = await Patient.findOne({ patientId })
            const notification = await Notification.create({
                patientId: patientId,
                userId: null,
                notificationTitle: title,
                notificationMsg: message,
            })
            sendSms(patient.notifyToken, title, message)
            res.status(200).json({
                notification
            })
        }
    } catch (error) {
        res.status(500).json({
            error: "user or patient not found"
        })
    }
})

router.post('/doctor/send', async (req, res) => {
    try {
        const { admin, title, message, patientId } = req.body
        console.log("patientId", patientId)
        const admins = await User.find({ role: 1 })
        let tokens = []
        if (admins.length > 0) {
            for (let elm of admins) {
                tokens.push(elm.notifyToken)
            }
        } else {
            res.status(200).json({ Message: "Did Not found any ADMINS" })
        }
        if (admin) {
            const notification = await Notification.create({
                patientId: null,
                userId: null,
                admin: admin,
                notificationTitle: title,
                notificationMsg: message,
            })
            for (let token of tokens) {
                sendSms(token, title, message)
            }
            res.status(200).json({
                notification
            })
        }
        else if (patientId) {

            const patient = await Patient.findOne({ patientId })
            const notification = await Notification.create({
                patientId: patientId,
                userId: null,
                notificationTitle: title,
                notificationMsg: message,
            })
            sendSms(patient.notifyToken, title, message)
            res.status(200).json({
                notification
            })
        }
    } catch (error) {
        res.status(500).json({
            error: "Patient not found"
        })
    }
})

router.post('/patient/send', async (req, res) => {
    try {
        const { admin, title, message, doctorId } = req.body
        console.log("doctorId", doctorId)
        const admins = await User.find({ role: 1 })
        let tokens = []
        if (admins.length > 0) {
            for (let elm of admins) {
                tokens.push(elm.notifyToken)
            }
        } else {
            res.status(200).json({ Message: "Did Not found any ADMINS" })
        }
        if (admin) {
            const notification = await Notification.create({
                patientId: null,
                userId: null,
                admin: admin,
                notificationTitle: title,
                notificationMsg: message,
            })
            for (let token of tokens) {
                sendSms(token, title, message)
            }
            res.status(200).json({
                notification
            })
        }
        else if (doctorId) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> inside doctor')
            const doctor = await User.findOne({ userId: doctorId })
            console.log("doctor", doctor.userId)
            if (doctor.role == 2) {
                const notification = await Notification.create({
                    patientId: null,
                    userId: doctorId,
                    notificationTitle: title,
                    notificationMsg: message,
                })
                sendSms(doctor.notifyToken, title, message)
                res.status(200).json({
                    notification
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})



/* Recive notifications */
router.get('/admin/recive', async (req, res) => {
    try {
        const notifications = await Notification.find({ admin: true }).sort({createdAt:-1})
        if (notifications.length) {
            let notify = []
            for (let elm of notifications) {
                notify.push({
                    "_id": elm._id,
                    "patientId": elm.patientId,
                    "userId": elm.userId,
                    "notificationTitle": elm.notificationTitle,
                    "notificationMsg": elm.notificationMsg,
                    "updatedAt": timeAgo.format(elm.updatedAt),
                    "createdAt": timeAgo.format(elm.createdAt)
                })
            }
            res.status(200).json({
                status : true,
                message : 'successfullly recive notifications',
                notifications : notify
            })
        } else {
            res.status(404).json({
                status : false,
                message : 'Notifications not Found'
            })
        }
    } catch (err) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})

router.get('/doctor/recive/:doctorId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.doctorId }).sort({createdAt:-1})
        if (notifications.length) {
            let notify = []
            for (let elm of notifications) {
                notify.push({
                    "_id": elm._id,
                    "userId": elm.userId,
                    "notificationTitle": elm.notificationTitle,
                    "notificationMsg": elm.notificationMsg,
                    "updatedAt": timeAgo.format(elm.updatedAt),
                    "createdAt": timeAgo.format(elm.createdAt)
                })
            }
            res.status(200).json({
                status : true,
                message : 'successfullly recive notifications',
                notifications : notify
            })
        } else {
            res.status(404).json({
                status : false,
                message : 'Notifications not Found'
            })
        }
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})

router.get('/patient/recive/:patientId', async (req, res) => {
    try {
        const notifications = await Notification.find({ patientId: req.params.patientId }).sort({createdAt:-1})
        if (notifications.length) {
            let notify = []
            for (let elm of notifications) {
                notify.push({
                    "_id": elm._id,
                    "patientId": elm.patientId,
                    "notificationTitle": elm.notificationTitle,
                    "notificationMsg": elm.notificationMsg,
                    "updatedAt": timeAgo.format(elm.updatedAt),
                    "createdAt": timeAgo.format(elm.createdAt)
                })
            }
            res.status(200).json({
                status : true,
                message : 'successfullly recive notifications',
                notifications : notify
            })
        } else {
            res.status(404).json({
                status : false,
                message : 'Notifications not Found'
            })
        }
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
})


router.put('/notify/isOpen/:notifyId', async (req, res) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.notifyId }, { isOpen: true })
            .then(() => {
                res.status(200).json({
                    success: true,
                    msg: "Successfully done"
                })
            })
    } catch (error) {
        res.status(500).json({
            error
        })
    }
})

module.exports = router;