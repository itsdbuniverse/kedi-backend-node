const express = require('express');
const multer = require('multer');
const router = express.Router();
const BloodReport = require('../model/blood');
var path = require('path');
const moment = require('moment')
const config = require('./../config')
const PatientDetails = require('../model/patient');
const User = require('../model/user');
// const upload = multer({ dest: path.join(__dirname, '../public/images/temp/') })
var docsdata1 = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "docsdata") {
                cb(null, "public/reports/bloodReport/")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if (file.fieldname === "docsdata") {
                docsdata1 = "public/reports/bloodReport/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
        }
    })
})

router.post('/add-blood-report-details', upload.fields([
    { name: "docsdata", maxCount: 1 },
]), async function (req, res, next) {
    var bloodReportId;
    BloodReport.find().then(function (bloodreport) {
        if (bloodreport.length > 0) {
            bloodReportId = bloodreport[0].bloodReportId
            for (let i = 1; i < bloodreport.length; i++) {
                if (bloodReportId < bloodreport[i].bloodReportId)
                    bloodReportId = bloodreport[i].bloodReportId
            }
        }
        else
            bloodReportId = 0;
        let newId = parseInt(bloodReportId) + 1;
        let bloodreportDetails = {
            'bloodReport_refrenceId': "donblo-" + newId,
            'bloodReportId': newId,
            'blood_appoDate': req.body.blood_appoDate,
            'blood_appoTime': req.body.blood_appoTime,
            'blood_testName': req.body.blood_testName,
            'blood_testDetails': req.body.blood_testDetails,
            'blood_testResult': req.body.blood_testResult,
            'blood_testCharge': req.body.blood_testCharge,
            'blood_drsuggest': req.body.blood_drsuggest,
            'blood_Hospital': req.body.blood_Hospital,
            'blood_raison': req.body.blood_raison,
            'patientId': req.body.patientId,
            'docsdata': docsdata1,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg
        }
        BloodReport.create(bloodreportDetails).then(b => {
            res.send({
                status: true,
                message: "Blood report details added successfully!!",
                data: b
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while creating Blood report Details"
            });
        });

    })
});
router.get('/get-all-blood-report-details', function (req, res, next) {
    BloodReport.find({}).sort({ created_at: -1 }).then(function (bloodreportdetails) {
        res.send({
            status: true,
            message: "All blood report details!!",
            data: bloodreportdetails
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all blood report details"
        });
    });
});
router.get('/get-blood-report-by-id/:patientId', async function (req, res, next) {
    BloodReport.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (bloodreport) {
        res.send({
            status: true,
            message: "Patient details!!",
            data: bloodreport
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding patient"
        });
    });
});

router.get('/get-blood-report-by-id-app/:patientId', async function (req, res, next) {
    let patient = await PatientDetails.findOne({ patientId: req.params.patientId });
    BloodReport.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (bloodreport) {
        if (patient.is_approved == 1) {
            if (bloodreport.length > 0) {
                for (let item of bloodreport) {
                    let url = item.docsdata
                    if (url != '' && url != undefined && url != null) {
                        var splitUrl = url.split('/');
                        item.docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
                    }
                    else {
                        item.docsdata = ''
                    }
                    var url1 = item.drimg
                    if (url1 != '' && url1 != undefined && url1 != null) {
                        var spliturl1 = url1.split('/');
                        item.drimg = config.projectUrl1 + spliturl1[1] + "/" + spliturl1[2] + "/" + spliturl1[3] + "/" + spliturl1[4]
                    }
                    else {
                        item.drimg = ''
                    }

                    console.log("item.blood_appoDate", item.blood_appoDate)
                    item.blood_appoDate = moment(item.blood_appoDate, "llll").format("L")
                }
                res.send({
                    status: true,
                    message: "Patient details!!",
                    data: bloodreport
                });
            } else {
                res.send({
                    status: false,
                    message: "Report is not register with this patient id!!",
                    data: bloodreport
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
            message: err.message || "Some error occurred while finding patient"
        });
    });
});

router.get('/get-blood-report-appdata/:bloodReportId', async function (req, res, next) {
    BloodReport.findOne({ bloodReportId: req.params.bloodReportId }).then(function (bloodreport) {
        let url = bloodreport.docsdata
        if (url !== "" && url != undefined && url != null) {
            let splitUrl = url.split('/');
            bloodreport.docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
        }
        else {
            bloodreport.docsdata = ''
        }
        bloodreport.blood_appoDate = moment(bloodreport.blood_appoDate, "llll").format("L")
        res.send({
            status: true,
            message: "details!!",
            data: bloodreport
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding report"
        });
    });
});

router.put('/update-blood-report-details/:consultationId', function (req, res, next) {
    BloodReport.findOneAndUpdate({ consultationId: req.params.consultationId }, req.body).then(function (bloodreportdetails) {
        BloodReport.findOne({ consultationId: req.params.consultationId }).then(function (bloodreportdetails) {
            res.send({
                message: "Update successfully!!",
                data: bloodreportdetails
            });
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while updating blood report details"
        });
    });
});
router.delete('/delete-blood-report-details/:consultationId', function (req, res, next) {
    BloodReport.findOneAndDelete({ consultationId: req.params.consultationId }).then(function (bloodreportdetails) {
        res.send({
            message: "Blood report details Deleted successfully!!",
            data: bloodreportdetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting blood report details"
        });
    });
});

router.put('/update-blood', upload.single("docsdata"), async function (req, res, next) {
    try {
        console.log("update-blood ------->> called");
        console.log("update-blood ------->>", req.body);
        const filter = { bloodReportId: req.body.bloodReportId, patientId: req.body.patientId };
        const update = {
            blood_appoDate: req.body.blood_appoDate,
            blood_appoTime: req.body.blood_appoTime,
            blood_testName: req.body.blood_testName,
            blood_testDetails: req.body.blood_testDetails,
            blood_testResult: req.body.blood_testResult,
            blood_testCharge: req.body.blood_testCharge,
            blood_drsuggest: req.body.blood_drsuggest,
            blood_Hospital: req.body.blood_Hospital,
            blood_raison: req.body.blood_raison,
            // patientId: req.body.patientId,
            // drId: req.body.drId,
            drName: req.body.drName,
            drimg: req.body.drimg
        };
        if (req.file) {
            update.docsdata = req.file.path;
        }
        const options = { new: true };
        BloodReport.updateOne(filter, update, options).then(b => {
            res.send({
                status: true,
                message: "Blood report details updated successfully!!",
                data: b
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while updating Blood report Details"
            });
        });

    } catch (err) {
        res.status(500).send({
            status: false,
            message: err.message || "Internal Error"
        });
    }
});

module.exports = router;