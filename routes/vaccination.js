const express = require('express');
const router = express.Router();
const multer = require('multer');
const VaccinationReport = require('../model/vaccination');
const PatientDetails = require('../model/patient');
const config = require('./../config')
const moment = require('moment')
var docs = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "v_docsdata") {
                cb(null, "public/reports/vaccinationReport")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if (file.fieldname === "v_docsdata") {
                docs = "public/reports/vaccinationReport/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
        }
    })
})

router.post('/add-vaccination-details', upload.fields([
    { name: "v_docsdata", maxCount: 1 },
]), async (req, res, next) => {
    var vaccinationId;
    VaccinationReport.find().then(function (vaccinereport) {
        if (vaccinereport.length > 0) {
            vaccinationId = vaccinereport[0].vaccinationId
            for (let i = 1; i < vaccinereport.length; i++) {
                if (vaccinationId < vaccinereport[i].vaccinationId)
                    vaccinationId = vaccinereport[i].vaccinationId
            }
        }
        else
            vaccinationId = 0;
        let newId = parseInt(vaccinationId) + 1;
        vaccinereportDetails = {
            'vaccinationId': newId,
            'vaccination_refrenceId': "donvacc-" + newId,
            'v_appoDate': req.body.v_appoDate,
            'v_appoTime': req.body.v_appoTime,
            'vaccinationName': req.body.vaccinationName,
            'vaccinationDetails': req.body.vaccinationDetails,
            'vaccinationcharge': req.body.vaccinationcharge,
            'v_Hospital': req.body.v_Hospital,
            'patientId': req.body.patientId,
            'v_docsdata': docs,
            "expirydate":req.body.expirydate,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg,
            'v_raison':req.body.v_raison,
        }
        VaccinationReport.create(vaccinereportDetails).then(vaccine => {
            res.send({
                message: "Vaccination report details added successfully!!",
                data: vaccine
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating vaccination report Details"
            });
        });

    })
});
router.get('/get-all-vaccination-details', function (req, res, next) {
    VaccinationReport.find({}).sort({created_at: -1}).then(function (vaccinationdetails) {
        res.send({
            message: "All Vaccination report !!!",
            data: vaccinationdetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while getting all vacination report"
        });
    });
});
router.get('/get-vaccination-report-by-id/:patientId', async function (req, res, next) {
    VaccinationReport.find({ patientId: req.params.patientId }).sort({created_at: -1}).then(function (vaccinationreport) {
        res.send({
            status: true,
            message: "VaccinationReport report details!!",
            data: vaccinationreport,
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.get('/get-vaccination-report-by-id-app/:patientId', async function (req, res, next) {
    let patient = await PatientDetails.findOne({ patientId: req.params.patientId });
    VaccinationReport.find({ patientId: req.params.patientId }).sort({created_at: -1}).then(function (vaccinationreport) {
        if (patient.is_approved == 1) {
        if (vaccinationreport.length > 0) {
            for (let item of vaccinationreport) {
                let url = item.v_docsdata
                if (url != '' && url != undefined && url != null) {
                    var splitUrl = url.split('/');
                    item.v_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
                }
                else {
                    item.v_docsdata = ''
                }
                var url1 = item.drimg
                if (url1 != '' && url1 != undefined && url1 != null) {
                    var spliturl1 = url1.split('/');
                    item.drimg = config.projectUrl1 + spliturl1[1] + "/" + spliturl1[2] + "/" + spliturl1[3] + "/" + spliturl1[4]
                }
                else {
                    item.drimg = ''
                }

                item.v_appoDate = moment(item.v_appoDate, "llll").format("L")
                item.expirydate = moment(item.expirydate , "llll").format("L")
            }
            res.send({
                status: true,
                message: "Patient details!!",
                data: vaccinationreport
            });
        } else {
            res.send({
                status: false,
                message: "Report is not register with this patient id!!",
                data: vaccinationreport
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

router.get('/get-vaccination-report-appdata/:vaccinationId', async function (req, res, next) {
    VaccinationReport.findOne({ vaccinationId: req.params.vaccinationId }).then(function (vaccinationreport) {
        let url = vaccinationreport.v_docsdata
        if (url !== "" && url != undefined && url != null) {
            let splitUrl = url.split('/');
            vaccinationreport.v_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
        }
        else {
            vaccinationreport.v_docsdata = ''
        }
        vaccinationreport.v_appoDate = moment(vaccinationreport.v_appoDate, "llll").format("L")
        vaccinationreport.expirydate = moment(vaccinationreport.expirydate , "llll").format("L")
        res.send({
            status: true,
            message: "details!!",
            data: vaccinationreport
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.put('/update-vaccination-details/:vaccinationId', function (req, res, next) {
    VaccinationReport.findOneAndUpdate({ vaccinationId: req.params.vaccinationId }, req.body).then(function (vaccinationdetails) {
        VaccinationReport.findOne({ vaccinationId: req.params.vaccinationId }).then(function (vaccinationdetails) {
            res.send({
                message: "Update successfully!!",
                data: vaccinationdetails
            });
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while updating vaccination report details"
        });
    });
});
router.delete('/delete-vaccination-details/:vaccinationId', function (req, res, next) {
    VaccinationReport.findOneAndDelete({ vaccinationId: req.params.vaccinationId }).then(function (vaccinationdetails) {
        res.send({
            message: "Vaccination report details Deleted successfully!!",
            data: vaccinationdetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting vaccination report details"
        });
    });
});

router.put('/update-vaccination', upload.single('v_docsdata'), async (req, res) => {
    console.log('update-vaccination-details ------->> called');
    console.log('update-vaccination-details ------->>', req.body);
    const filter = { vaccinationId: req.body.vaccinationId };
    const update = {
        v_appoDate: req.body.v_appoDate,
        v_appoTime: req.body.v_appoTime,
        vaccinationName: req.body.vaccinationName,
        vaccinationDetails: req.body.vaccinationDetails,
        vaccinationcharge: req.body.vaccinationcharge,
        v_Hospital: req.body.v_Hospital,
        patientId: req.body.patientId,
        drId: req.body.drId,
        drName: req.body.drName,
        drimg: req.body.drimg,
        v_raison: req.body.v_raison,
        expirydate: req.body.expirydate,
    };
    if (req.file) {
        update.v_docsdata = req.file.path;
    }
    const options = { new: true };
    VaccinationReport.findOneAndUpdate(filter, update, options).then(vaccine => {
        if (!vaccine) {
            return res.status(404).send({
                message: 'Vaccination report not found with id ' + req.params.vaccinationId
            });
        }
        res.send({
            status: true,
            message: 'Vaccination report details updated successfully!!',
            data: vaccine
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || 'Some error occurred while updating vaccination report details'
        });
    });
});

module.exports = router;
