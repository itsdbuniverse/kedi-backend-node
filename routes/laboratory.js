const express = require('express');
const router = express.Router();
const Labrotarylist = require('../model/laboratory');

router.post('/add-lab-name', async function (req, res, next) {
    var laboratoryId;
    Labrotarylist.find().then(function (lab) {
        if (lab.length > 0) {
            laboratoryId = lab[0].laboratoryId
            for (let i = 1; i < lab.length; i++) {
                if (laboratoryId < lab[i].laboratoryId)
                    laboratoryId = lab[i].laboratoryId
            }
        }
        else
        laboratoryId = 0;
        let labDetails = {
            'laboratoryId': laboratoryId + 1,
            'laboratoryName': req.body.laboratoryName
        }
        Labrotarylist.create(labDetails).then(labs => {
            res.send({
                status: true,
                message: "Labrotary added successfully!!",
                data: labs
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while creating Details"
            });
        });

    })
});
router.get('/get-all-lab-name', function (req, res, next) {
    Labrotarylist.find({}).then(function (labs) {
        res.send({
            status: true,
            message: "All hospital name!!",
            data: labs
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting details"
        });
    });
});

router.put('/update-lab-name-by-id/:laboratoryId', function (req, res, next) {
    Labrotarylist.findOneAndUpdate({ laboratoryId: req.params.laboratoryId }, req.body).then(function (labs) {
        Labrotarylist.findOne({ laboratoryId: req.params.laboratoryId }).then(function (labs) {
            res.send({
                status:true,
                message: "Laboratary Updated successfully!!",
                data: labs
            });
        });
    }).catch(err => {
        res.status(500).send({
            status:false,
            message: err.message || "Some error occurred while Updating laboratary name"
        });
    });
});

router.delete('/delete-lab-by-id/:laboratoryId', function (req, res, next) {
    Labrotarylist.findOneAndDelete({ laboratoryId: req.params.laboratoryId }).then(function (labs) {
        res.send({
            message: "Laboratry details Deleted successfully!!",
            data: labs
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting hospital details"
        });
    });
});

router.get('/lab-by-id/:laboratoryId', function (req, res, next) {
    // User.findOneAndUpdate({ _id: req.params.id }, req.body).then(function (user) {
        Labrotarylist.findOne({ laboratoryId: req.params.laboratoryId }).then(function (labs) {
            res.send({
                status:true,
                message: "Hospital details!!",
                data: labs
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