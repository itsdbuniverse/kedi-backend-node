const express = require('express');
const router = express.Router();
const Pharmacistlist = require('../model/pharmacist');

router.post('/add-pharmacy-name', async function (req, res, next) {
    var pharmacistId;
    Pharmacistlist.find().then(function (pharma) {
        if (pharma.length > 0) {
            pharmacistId = pharma[0].pharmacistId
            for (let i = 1; i < pharma.length; i++) {
                if (pharmacistId < pharma[i].pharmacistId)
                    pharmacistId = pharma[i].pharmacistId
            }
        }
        else
        pharmacistId = 0;
        let pharmaDetails = {
            'pharmacistId': pharmacistId + 1,
            'pharmacyName': req.body.pharmacyName
        }
        Pharmacistlist.create(pharmaDetails).then(pharma => {
            res.send({
                status: true,
                message: "Pharmacy name added successfully!!",
                data: pharma
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while creating Details"
            });
        });

    })
});
router.get('/get-all-pharmacy-name', function (req, res, next) {
    Pharmacistlist.find({}).then(function (labs) {
        res.send({
            status:true,
            message: "All pharmacy name!!",
            data: labs
        });
    }).catch(err => {
        res.status(500).send({
            status:false,
            message: err.message || "Some error occurred while getting details"
        });
    });
});

router.put('/update-pharmacy-name-by-id/:pharmacistId', function (req, res, next) {
    Pharmacistlist.findOneAndUpdate({ pharmacistId: req.params.pharmacistId }, req.body).then(function (pharma) {
        Pharmacistlist.findOne({ pharmacistId: req.params.pharmacistId }).then(function (pharma) {
            res.send({
                status:true,
                message: "Pharmacy Updated successfully!!",
                data: pharma
            });
        });
    }).catch(err => {
        res.status(500).send({
            status:false,
            message: err.message || "Some error occurred while Updating laboratary name"
        });
    });
});

router.delete('/delete-lab-by-id/:pharmacistId', function (req, res, next) {
    Pharmacistlist.findOneAndDelete({ pharmacistId: req.params.pharmacistId }).then(function (pharma) {
        res.send({
            message: "Laboratry details Deleted successfully!!",
            data: pharma
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting hospital details"
        });
    });
});

router.get('/lab-by-id/:pharmacistId', function (req, res, next) {
    // User.findOneAndUpdate({ _id: req.params.id }, req.body).then(function (user) {
        Pharmacistlist.findOne({ pharmacistId: req.params.pharmacistId }).then(function (pharma) {
            res.send({
                status:true,
                message: "Hospital details!!",
                data: pharma
            });
        // });
    }).catch(err => {
        res.status(500).send({
            status:false,
            message: err.message || "Some error occurred while finding hospital"
        });
    });
});
module.exports = router;