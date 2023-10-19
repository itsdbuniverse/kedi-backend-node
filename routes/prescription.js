const express = require('express');
const multer = require('multer');
const router = express.Router();
const Prescription = require('../model/prescription');
const PatientDetails = require('../model/patient');
const User = require('../model/user');
const moment = require('moment')
const config = require('./../config')
var docs = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "p_docsdata") {
                cb(null, "public/reports/prescriptionReport")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if (file.fieldname === "p_docsdata") {
                docs = "public/reports/prescriptionReport/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
        }
    })
})

router.get('/get-prescription-report-by-id/:patientId', async function (req, res, next) {
    Prescription.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (prescription) {
        res.send({
            status: true,
            message: "Prescription report details!!",
            data: prescription,
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.get('/get-prescription-report-by-id-app/:patientId', async function (req, res, next) {
    let patient = await PatientDetails.findOne({ patientId: req.params.patientId });
    Prescription.find({ patientId: req.params.patientId }).sort({ created_at: -1 }).then(function (prescription) {
        if (patient.is_approved == 1) {
        if (prescription.length > 0) {
            for (let item of prescription) {
                let url = item.p_docsdata
                if (url != '' && url != undefined && url != null) {
                    var splitUrl = url.split('/');
                    item.p_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
                }
                else {
                    item.p_docsdata = ''
                }
                var url1 = item.drimg
                if (url1 != '' && url1 != undefined && url1 != null) {
                    var spliturl1 = url1.split('/');
                    item.drimg = config.projectUrl1 + spliturl1[1] + "/" + spliturl1[2] + "/" + spliturl1[3] + "/" + spliturl1[4]
                }
                else {
                    item.drimg = ''
                }
                item.p_appoDate = moment(item.p_appoDate, "llll").format("L");
                item.p_nextcheckup = moment(item.p_nextcheckup, "llll").format("L");
            }
            res.send({
                status: true,
                message: "Patient details!!",
                data: prescription
            });
        } else {
            res.send({
                status: false,
                message: "Report is not register with this patient id!!",
                data: prescription
            });
        }
    }else {
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

router.get('/get-prescription-report-appdata/:prescriptionId', async function (req, res, next) {
    Prescription.findOne({ prescriptionId: req.params.prescriptionId }).then(function (prescription) {
        let url = prescription.p_docsdata
        if (url !== "" && url != undefined && url != null) {
            let splitUrl = url.split('/');
            prescription.p_docsdata = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3]
        }
        else {
            prescription.p_docsdata = ''
        }
        prescription.p_appoDate = moment(prescription.p_appoDate , "llll").format("L")
        prescription.p_nextcheckup = moment(prescription.p_nextcheckup ,  "llll").format("L");
        res.send({
            status: true,
            message: "details!!",
            data: prescription
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding details"
        });
    });
});
router.post('/add-prescription-report-details', upload.fields([
    { name: "p_docsdata", maxCount: 1 },
]), async function (req, res, next) {
    var prescriptionId;
    Prescription.find().then(function (p) {
        if (p.length > 0) {
            prescriptionId = p[0].prescriptionId
            for (let i = 1; i < p.length; i++) {
                if (prescriptionId < p[i].prescriptionId)
                    prescriptionId = p[i].prescriptionId
            }
        }
        else
            prescriptionId = 0;
        let newId = parseInt(prescriptionId) + 1;
        let PrescriptionDetails = {
            'prescriptionId': newId,
            'prescription_refrenceId': "donpre-" + newId,
            'p_appoDate': req.body.p_appoDate,
            'p_appoTime': req.body.p_appoTime,
            'p_docsdata': docs,
            'patientId': req.body.patientId,
            'pharmacyname': req.body.pharmacyname,
            'p_raison': req.body.p_raison,
            // 'medicinename':JSON.stringify(req.body.medicinename),
            'medicinename': req.body.medicinename,
            'dosage': req.body.dosage,
            'p_diseases': req.body.p_diseases,
            'p_nextcheckup': req.body.p_nextcheckup,
            'prescription': req.body.prescription
        }
        Prescription.create(PrescriptionDetails).then(b => {
            res.send({
                status: true,
                message: "Prescription details added successfully!!",
                data: b
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while creating Prescription Details"
            });
        });

    })
});
router.get('/get-all-prescription-report-details', function (req, res, next) {
    Prescription.find({}).sort({ created_at: -1 }).then(function (Prescriptiondetails) {
        res.send({
            message: "All prescription report details!!",
            data: Prescriptiondetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while getting all blood report details"
        });
    });
});
router.put('/update-prescription-report-details/:prescriptionId', function (req, res, next) {
    Prescription.findOneAndUpdate({ prescriptionId: req.params.prescriptionId }, req.body).then(function (Prescriptiondetails) {
        Prescription.findOne({ prescriptionId: req.params.prescriptionId }).then(function (Prescriptiondetails) {
            res.send({
                message: "Update successfully!!",
                data: Prescriptiondetails
            });
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while updating report details"
        });
    });
});
router.delete('/delete-prescription-report-details/:prescriptionId', function (req, res, next) {
    Prescription.findOneAndDelete({ prescriptionId: req.params.prescriptionId }).then(function (Prescriptiondetails) {
        res.send({
            message: "report details Deleted successfully!!",
            data: Prescriptiondetails
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting report details"
        });
    });
});


router.put('/update-prescription/', upload.single('p_docsdata'), async (req, res) => {
    console.log('update-prescription-details ------->> called');
    console.log('update-prescription-details ------->>', req.body);
    const filter = { prescriptionId: req.body.prescriptionId };
    const update = {
        p_appoDate: req.body.p_appoDate,
        p_appoTime: req.body.p_appoTime,
        patientId: req.body.patientId,
        pharmacyname: req.body.pharmacyname,
        medicinename: req.body.medicinename.split(",") /*.map(str => str.split(',')).flat()*/,
        p_raison: req.body.p_raison,
        // p_docsdata: pres_filename,
        drId: req.body.drId,
        drName: req.body.drName,
        drimg: req.body.drimg,
        p_diseases: req.body.p_diseases.split(",") /*.map(str => str.split(',')).flat() */,
        p_nextcheckup: req.body.p_nextcheckup,
        prescription: req.body.prescription
    };
    if (req.file) {
        update.p_docsdata = req.file.path;
    }
    const options = { new: true };
    Prescription.findOneAndUpdate(filter, update, options).then(prescription => {
        console.log(prescription);
        if (!prescription) {
            return res.status(404).send({
                message: 'Prescription not found with id ' + req.params.prescriptionId
            });
        }
        res.send({
            status: true,
            message: 'Prescription details updated successfully!!',
            data: prescription
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || 'Some error occurred while updating prescription details'
        });
    });
});

module.exports = router;

