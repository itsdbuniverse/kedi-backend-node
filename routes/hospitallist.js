const express = require('express');
const multer = require('multer');
const router = express.Router();
const Hospitallist = require('../model/hospitallist');
const PatientDetails = require('../model/patient');
const User = require('../model/user');


router.post('/add-hospital-name', async function (req, res, next) {
    var hospitalId;
    Hospitallist.find().then(function (hospital) {
        if (hospital.length > 0) {
            hospitalId = hospital[0].hospitalId
            for (let i = 1; i < hospital.length; i++) {
                if (hospitalId < hospital[i].hospitalId)
                    hospitalId = hospital[i].hospitalId
            }
        }
        else
            hospitalId = 0;
        let newId = parseInt(hospitalId) + 1;
        let hospitalDetails = {
            'hospitalId': newId,
            'hospitalrefrenceId': "host-" + newId,
            'hospitalName': req.body.hospitalName
        }
        Hospitallist.create(hospitalDetails).then(hospital => {
            res.send({
                status: true,
                message: "Hospital added successfully!!",
                data: hospital
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while creating Details"
            });
        });

    })
});
router.get('/get-all-hospital-name', function (req, res, next) {
    Hospitallist.find({}).then(function (hospital) {
        res.send({
            status: true,
            message: "All hospital name!!",
            data: hospital
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting details"
        });
    });
});

router.put('/update-hospital-name-by-id/:hospitalId', function (req, res, next) {
    Hospitallist.findOne({ hospitalId: req.params.hospitalId }).then(function (prevHospital) {
        Hospitallist.findOneAndUpdate({ hospitalId: req.params.hospitalId }, req.body).then(function (hospital) {
            PatientDetails.updateMany(
                { hospital_id: req.params.hospitalId, hospital_name: prevHospital.hospitalName }, // Condition to match
                { $set: { hospital_name: req.body.hospitalName } } // Fields to unset (delete)
            ).then(result => console.log("updated PatientDetails ===> ")).catch(err => console.log(err));
            User.updateMany(
                { hospital_id: req.params.hospitalId, hospital_name: prevHospital.hospitalName }, // Condition to match
                { $set: { hospital_name: req.body.hospitalName } } // Fields to unset (delete)
            ).then(result => console.log("updated User===>>> ")).catch(err => console.log(err));
            prevHospital.hospitalName = req.body.hospitalName
            res.send({
                status: true,
                message: "Hospital Updated successfully!!",
                data: prevHospital
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while Updating hospital name"
            });
        });
    });

});

router.delete('/delete-hospital-by-id/:hospitalId', function (req, res, next) {
    Hospitallist.findOneAndDelete({ hospitalId: req.params.hospitalId }).then(function (hospdetails) {
        PatientDetails.updateMany(
            { hospital_id: req.params.hospitalId }, // Condition to match
            { $set: { hospital_id: "", hospital_name: "Select Hospital Name first", doctor_id: "", doctor_name: "Select The hospital Name first" } } // Fields to unset (delete)
        )
            .then(function (result) {
                console.log(result);
            })
            .catch(function (err) {
            });
        User.updateMany(
            { hospital_id: req.params.hospitalId }, // Condition to match
            { $set: { hospital_id: "", hospital_name: "Select Hospital Name first" } } // Fields to unset (delete)
        )
            .then(function (result) {
                console.log(result);
            })
            .catch(function (err) {
            });
        res.send({
            message: "Hospial details Deleted successfully!!",
            data: hospdetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting hospital details"
        });
    });
});

router.get('/hospital-by-id/:hospitalId', function (req, res, next) {
    Hospitallist.findOne({ hospitalId: req.params.hospitalId }).then(function (hospital) {
        res.send({
            status: true,
            message: "Hospital details!!",
            data: hospital
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding hospital"
        });
    });
});
module.exports = router;