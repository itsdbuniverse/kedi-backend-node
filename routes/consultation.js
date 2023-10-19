const express = require('express');
const router = express.Router();
const multer = require('multer');
const ConsultationReport = require('../model/consultation');
const PatientDetails = require('../model/patient');
const User = require('../model/user');
const config = require('./../config')
const moment = require('moment')
var docs = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "c_docsdata") {
                cb(null, "public/reports/consultancyReport")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if (file.fieldname === "c_docsdata") {
                docs = "public/reports/consultancyReport/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
        }
    })
})
router.post('/add-consultation-report-details', upload.fields([
    { name: "c_docsdata", maxCount: 1 },
]), async (req, res, next) => {
    var consultationId;
    ConsultationReport.find().then(function (consultationreport) {
        if (consultationreport.length > 0) {
            consultationId = consultationreport[0].consultationId
            for (let i = 1; i < consultationreport.length; i++) {
                if (consultationId < consultationreport[i].consultationId)
                    consultationId = consultationreport[i].consultationId
            }
        }
        else
            consultationId = 0
        let newId = parseInt(consultationId) + 1;
        consultationDetails = {
            'consultationId': newId,
            'consultation_refrenceId': "doncon-" + newId,
            'c_appoDate': req.body.c_appoDate,
            'c_appoTime': req.body.c_appoTime,
            'consultationName': req.body.consultationName,
            'consultationResult': req.body.consultationResult,
            'consultationPrescription': req.body.consultationPrescription,
            'consultationNotes': req.body.consultationNotes,
            'consultationCharge': req.body.consultationCharge,
            'c_raison': req.body.c_raison,
            'c_Hospital': req.body.c_Hospital,
            'is_active': 1,
            'patientId': req.body.patientId,
            'c_docsdata': docs,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg
        }
        ConsultationReport.create(consultationDetails).then(consultation => {
            res.send({
                message: "Consultation report details added successfully!!",
                data: consultation
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating consultation report"
            });
        });
    })
});
router.get('/get-all-consultation-report-details', function (req, res, next) {
    ConsultationReport.find({}).sort({ created_at: -1 }).then(function (consultationreport) {
        res.send({
            message: "All consultation report details!!",
            data: consultationreport
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while getting all consultation report details"
        });
    });
});
router.get('/get-consultation-report-by-id/:patientId', async function (req, res, next) {
    ConsultationReport.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (consultation) {
        res.send({
            status: true,
            message: "Consultation report details!!",
            data: consultation,
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.get('/get-consultation-report-by-id-app/:patientId', async function (req, res, next) {
    let patient = await PatientDetails.findOne({ patientId: req.params.patientId });
    ConsultationReport.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (consultation) {
        if (patient.is_approved == 1) {
            if (consultation.length > 0) {
                for (let item of consultation) {
                    let url = item.c_docsdata
                    if (url != '' && url != undefined && url != null) {
                        var splitUrl = url.split('/');
                        item.c_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
                    }
                    else {
                        item.c_docsdata = ''
                    }
                    var url1 = item.drimg
                    if (url1 != '' && url1 != undefined && url1 != null) {
                        var spliturl1 = url1.split('/');
                        item.drimg = config.projectUrl1 + spliturl1[1] + "/" + spliturl1[2] + "/" + spliturl1[3] + "/" + spliturl1[4]
                    }
                    else {
                        item.drimg = ''
                    }
                    item.c_appoDate = moment(item.c_appoDate, "llll").format("L")
                }
                res.send({
                    status: true,
                    message: "Patient details!!",
                    data: consultation
                });
            } else {
                res.send({
                    status: false,
                    message: "Report is not register with this patient id!!",
                    data: consultation
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

router.get('/get-consultation-report-by-appdata/:consultationId', async function (req, res, next) {

    ConsultationReport.findOne({ consultationId: req.params.consultationId }).then(function (consultation) {
        let url = consultation.c_docsdata
        if (url !== "" && url != undefined && url != null) {
            let splitUrl = url.split('/');
            consultation.c_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
        }
        else {
            consultation.c_docsdata = ''
        }
        consultation.c_appoDate = moment(consultation.c_appoDate, "llll").format("L")
        res.send({
            status: true,
            message: "details!!",
            data: consultation
        });

    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.put('/update-consultation-report-details/:consultationId', function (req, res, next) {
    ConsultationReport.findOneAndUpdate({ consultationId: req.params.consultationId }, req.body).then(function (consultationreport) {
        ConsultationReport.findOne({ consultationId: req.params.consultationId }).then(function (consultationreport) {
            res.send({
                message: "Update successfully!!",
                data: consultationreport
            });
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while updating blood report details"
        });
    });
});
router.delete('/delete-consultation-report-details/:consultationId', function (req, res, next) {
    ConsultationReport.findOneAndDelete({ consultationId: req.params.consultationId }).then(function (consultationreport) {
        res.send({
            message: "Consultation report details Deleted successfully!!",
            data: consultationreport
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting consultation report details"
        });
    });
});

router.put('/update-consultation/', upload.single("c_docsdata"), async function (req, res, next) {
    console.log("update-consultation ------->> called");
    console.log("update-consultation ------->>", req.body);
    const filter = { consultationId: req.body.consultationId };
    const update = {
        c_appoDate: req.body.c_appoDate,
        c_appoTime: req.body.c_appoTime,
        consultationName: req.body.consultationName,
        consultationResult: req.body.consultationResult,
        consultationPrescription: req.body.consultationPrescription,
        consultationNotes: req.body.consultationNotes,
        consultationCharge: req.body.consultationCharge,
        c_raison: req.body.c_raison,
        c_Hospital: req.body.c_Hospital,
        // patientId: req.body.patientId,
        // drId: req.body.drId,
        drName: req.body.drName,
        drimg: req.body.drimg
    };
    if (req.file) {
        update.c_docsdata = req.file.path;
    }
    const options = { new: true };
    ConsultationReport.findOneAndUpdate(filter, update, options).then(consultation => {
        if (!consultation) {
            return res.status(404).send({
                message: "Consultation report not found with id " + req.params.id
            });
        }
        res.send({
            status: true,
            message: "Consultation report details updated successfully!!",
            data: consultation
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while updating consultation report details"
        });
    });
});

module.exports = router;
