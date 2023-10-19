const express = require('express');
const router = express.Router();
const UrineStoole = require('../model/urinestoole');
const multer = require('multer');
const PatientDetails = require('../model/patient');
const User = require('../model/user');
const config = require('./../config');
const moment = require('moment')
var docs = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "u_docsdata") {
                cb(null, "public/reports/urinestooleReport")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if (file.fieldname === "u_docsdata") {
                docs = "public/reports/urinestooleReport/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
        }
    })
})
router.post('/add-urine-report-details', upload.fields([
    { name: "u_docsdata", maxCount: 1 },
]), async (req, res, next) => {
    var uninetestId;
    UrineStoole.find().then(function (urinereport) {
        if (urinereport.length > 0) {
            uninetestId = urinereport[0].uninetestId
            for (let i = 1; i < urinereport.length; i++) {
                if (uninetestId < urinereport[i].uninetestId)
                    uninetestId = urinereport[i].uninetestId
            }
        }
        else
            uninetestId = 0;
        let newId = parseInt(uninetestId) + 1;
        urinereportDetails = {
            'uninetestId': newId,
            'uninetest_refrenceId': "donuri-" + newId,
            'u_appoDate': req.body.u_appoDate,
            'u_appoTime': req.body.u_appoTime,
            'u_testName': req.body.u_testName,
            'u_testDetails': req.body.u_testDetails,
            'u_testResult': req.body.u_testResult,
            'u_testCharge': req.body.u_testCharge,
            'u_drsuggest': req.body.u_drsuggest,
            'u_Hospital': req.body.u_Hospital,
            'patientId': req.body.patientId,
            'u_docsdata': docs,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg,
            'u_raison': req.body.u_raison,
        }
        if (req.file) {
            urinereportDetails.document = req.file.path
        };
        UrineStoole.create(urinereportDetails).then(urinerprt => {
            res.send({
                message: "Urine report added successfully!!",
                data: urinerprt
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating Urine report"
            });
        });

    })
});
router.get('/get-all-urine-report-details', function (req, res, next) {
    UrineStoole.find({}).sort({ created_at: -1 }).then(function (urinereportdetails) {
        res.send({
            message: "All urine report details!!",
            data: urinereportdetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while getting all urine report"
        });
    });
});
router.get('/get-urin-report-by-id/:patientId', async function (req, res, next) {
    UrineStoole.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (urinestoolereport) {
        res.send({
            status: true,
            message: "urin report details!!",
            data: urinestoolereport,
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});

router.get('/get-urin-report-by-id-app/:patientId', async function (req, res, next) {
    let patient = await PatientDetails.findOne({ patientId: req.params.patientId });
    UrineStoole.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (urinestoolereport) {
        if (patient.is_approved == 1) {
            if (urinestoolereport.length > 0) {
                for (let item of urinestoolereport) {
                    let url = item.u_docsdata
                    if (url != '' && url != undefined && url != null) {
                        var splitUrl = url.split('/');
                        item.u_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
                    }
                    else {
                        item.u_docsdata = ''
                    }
                    var url1 = item.drimg
                    if (url1 != '' && url1 != undefined && url1 != null) {
                        var spliturl1 = url1.split('/');
                        item.drimg = config.projectUrl1 + spliturl1[1] + "/" + spliturl1[2] + "/" + spliturl1[3] + "/" + spliturl1[4]
                    }
                    else {
                        item.drimg = ''
                    }

                    item.u_appoDate = moment(item.u_appoDate, "llll").format("L")
                }
                res.send({
                    status: true,
                    message: "Patient details!!",
                    data: urinestoolereport
                });
            } else {
                res.send({
                    status: false,
                    message: "Report is not register with this patient id!!",
                    data: urinestoolereport
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

router.get('/get-urin-report-appdata/:uninetestId', async function (req, res, next) {
    UrineStoole.findOne({ uninetestId: req.params.uninetestId }).then(function (urinestoolereport) {
        let url = urinestoolereport.u_docsdata
        if (url !== "" && url != undefined && url != null) {
            let splitUrl = url.split('/');
            urinestoolereport.u_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
        }
        else {
            urinestoolereport.u_docsdata = ''
        }
        urinestoolereport.u_appoDate = moment(urinestoolereport.u_appoDate, "llll").format("L")
        res.send({
            status: true,
            message: "details!!",
            data: urinestoolereport
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.put('/update-urine-report-details/:uninetestId', function (req, res, next) {
    UrineStoole.findOneAndUpdate({ uninetestId: req.params.uninetestId }, req.body).then(function (urinereportdetails) {
        UrineStoole.findOne({ uninetestId: req.params.uninetestId }).then(function (urinereportdetails) {
            res.send({
                message: "Update successfully!!",
                data: urinereportdetails
            });
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while updating urine report details"
        });
    });
});
router.delete('/delete-urine-report-details/:uninetestId', function (req, res, next) {
    UrineStoole.findOneAndDelete({ uninetestId: req.params.uninetestId }).then(function (urinereportdetails) {
        res.send({
            message: "Urine report details Deleted successfully!!",
            data: urinereportdetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting urine report details"
        });
    });
});

router.put('/update-urinestole/', upload.single('u_docsdata'), async (req, res) => {
    console.log('update-urine-report-details ------->> called');
    console.log('update-urine-report-details ------->>', req.body);
    const filter = { uninetestId: req.body.uninetestId };
    const update = {
        u_appoDate: req.body.u_appoDate,
        u_appoTime: req.body.u_appoTime,
        u_testName: req.body.u_testName,
        u_testDetails: req.body.u_testDetails,
        u_testResult: req.body.u_testResult,
        u_testCharge: req.body.u_testCharge,
        u_Hospital: req.body.u_Hospital,
        patientId: req.body.patientId,
        drId: req.body.drId,
        drName: req.body.drName,
        drimg: req.body.drimg,
        u_drsuggest: req.body.u_drsuggest,
        u_raison: req.body.u_raison
    };
    if (req.file) {
        update.u_docsdata = req.file.path;
    }
    const options = { new: true };
    UrineStoole.findOneAndUpdate(filter, update, options).then(urineReport => {
        if (!urineReport) {
            return res.status(404).send({
                message: 'Urine report not found with id ' + req.params.uninetestId
            });
        }
        res.send({
            status: true,
            message: 'Urine report details updated successfully!!',
            data: urineReport
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || 'Some error occurred while updating urine report details'
        });
    });
});

module.exports = router;
