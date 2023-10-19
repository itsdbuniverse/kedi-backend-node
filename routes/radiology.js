const express = require('express');
const router = express.Router();
const multer = require('multer');
const RadiologyReport = require('../model/radiology');
const PatientDetails = require('../model/patient');
const User = require('../model/user');
const config = require('./../config');
const moment = require('moment')
var docs = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "r_docsdata") {
                cb(null, "public/reports/radioscanReport")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if (file.fieldname === "r_docsdata") {
                docs = "public/reports/radioscanReport/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
        }
    })
})
router.post('/add-radio-report', upload.fields([
    { name: "r_docsdata", maxCount: 1 },
]), async function (req, res, next) {
    var radiologyId;
    RadiologyReport.find().then(function (radio) {
        if (radio.length > 0) {
            radiologyId = radio[0].radiologyId
            for (let i = 1; i < radio.length; i++) {
                if (radiologyId < radio[i].radiologyId)
                    radiologyId = radio[i].radiologyId
            }
        }
        else
            radiologyId = 0
        let newId = parseInt(radiologyId) + 1;
        radiologyDetails = {
            'radiologyId': newId,
            'radiology_refrenceId': "donpre-" + newId,
            'r_appoDate': req.body.r_appoDate,
            'r_appoTime': req.body.r_appoTime,
            'r_testName': req.body.r_testName,
            'r_testDetails': req.body.r_testDetails,
            'r_testResult': req.body.r_testResult,
            'r_testCharge': req.body.r_testCharge,
            'r_Hospital': req.body.r_Hospital,
            'patientId': req.body.patientId,
            'is_active': 1,
            'r_docsdata': docs,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg,
            'r_notes': req.body.r_notes,
            'r_raison': req.body.r_raison,
        }
        if (req.file) {
            radiologyDetails.document = req.file.path
        };
        RadiologyReport.create(radiologyDetails).then(r => {
            res.send({
                status: true,
                message: "radiology report details added successfully!!",
                data: r
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while creating Radilogy report Details"
            });
        });

    })
});
router.get('/get-radiology-report-by-id/:patientId', async function (req, res, next) {
    RadiologyReport.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (radiologyreport) {
        res.send({
            status: true,
            message: "radiology report details!!",
            data: radiologyreport,
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.get('/get-radiology-report-by-id-app/:patientId', async function (req, res, next) {
    let patient = await PatientDetails.findOne({ patientId: req.params.patientId });
    RadiologyReport.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (radiologyreport) {
        if (patient.is_approved == 1) {
            if (radiologyreport.length > 0) {
                for (let item of radiologyreport) {
                    let url = item.r_docsdata
                    if (url != '' && url != undefined && url != null) {
                        var splitUrl = url.split('/');
                        item.r_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
                    }
                    else {
                        item.r_docsdata = ''
                    }
                    var url1 = item.drimg
                    if (url1 != '' && url1 != undefined && url1 != null) {
                        var spliturl1 = url1.split('/');
                        item.drimg = config.projectUrl1 + spliturl1[1] + "/" + spliturl1[2] + "/" + spliturl1[3] + "/" + spliturl1[4]
                    }
                    else {
                        item.drimg = ''
                    }

                    item.r_appoDate = moment(item.r_appoDate, "llll").format("L")
                }
                res.send({
                    status: true,
                    message: "Patient details!!",
                    data: radiologyreport
                });
            } else {
                res.send({
                    status: false,
                    message: "Report is not register with this patient id!!",
                    data: radiologyreport
                });
            }
        } else {
            res.send({
                status: true,
                message: "Patient details!!",
                data: bloodreport
            });
        }
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});

router.get('/get-radiology-report-appdata/:radiologyId', async function (req, res, next) {
    RadiologyReport.findOne({ radiologyId: req.params.radiologyId }).then(function (radiologyreport) {
        let url = radiologyreport.r_docsdata
        if (url !== "" && url != undefined && url != null) {
            let splitUrl = url.split('/');
            radiologyreport.r_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
        }
        else {
            radiologyreport.r_docsdata = ''
        }
        radiologyreport.r_appoDate = moment(radiologyreport.r_appoDate, "llll").format("L")
        res.send({
            status: true,
            message: "details!!",
            data: radiologyreport
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});

router.get('/get-all-radiology-report-details', function (req, res, next) {
    RadiologyReport.find({}).sort({ created_at: -1 }).then(function (radiologyreport) {
        res.send({
            message: "All radiology report details!!",
            data: radiologyreport
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while getting all blood report details"
        });
    });
});
router.put('/update-radiology-report-details/:radiologyId', function (req, res, next) {
    RadiologyReport.findOneAndUpdate({ radiologyId: req.params.radiologyId }, req.body).then(function (radiologyreport) {
        RadiologyReport.findOne({ radiologyId: req.params.radiologyId }).then(function (radiologyreport) {
            res.send({
                message: "Update successfully!!",
                data: radiologyreport
            });
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while updating radiology report details"
        });
    });
});
router.delete('/delete-radiology-report-details/:radiologyId', function (req, res, next) {
    RadiologyReport.findOneAndDelete({ radiologyId: req.params.radiologyId }).then(function (radiologyreport) {
        res.send({
            message: "Radiology report details Deleted successfully!!",
            data: radiologyreport
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting radiology report details"
        });
    });
});

router.put('/update-radio-report/', upload.single("r_docsdata"), async function (req, res, next) {
    console.log("update-radio-report ------->> called");
    console.log("update-radio-report ------->>", req.body);
    const filter = { radiologyId: req.body.radiologyId };
    const update = {
        r_appoDate: req.body.r_appoDate,
        r_appoTime: req.body.r_appoTime,
        r_testName: req.body.r_testName,
        r_testDetails: req.body.r_testDetails,
        r_testResult: req.body.r_testResult,
        r_testCharge: req.body.r_testCharge,
        r_Hospital: req.body.r_Hospital,
        patientId: req.body.patientId,
        drId: req.body.drId,
        drName: req.body.drName,
        drimg: req.body.drimg,
        r_notes: req.body.r_notes,
        r_raison: req.body.r_raison,
    };
    if (req.file) {
        update.r_docsdata = req.file.path;
    }
    const options = { new: true };
    RadiologyReport.findOneAndUpdate(filter, update, options).then(radiology => {
        if (!radiology) {
            return res.status(404).send({
                message: "Radiology report not found with id " + req.params.id
            });
        }
        res.send({
            status: true,
            message: "Radiology report details updated successfully!!",
            data: radiology
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while updating radiology report details"
        });
    });
});




module.exports = router;

