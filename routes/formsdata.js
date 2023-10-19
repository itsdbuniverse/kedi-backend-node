const express = require('express');
const multer = require('multer');
const router = express.Router();
const BloodReport = require('../model/blood');
const Notification = require('../model/notification');
const Patient = require('../model/patient');
const ConsultationReport = require('../model/consultation');
const RadiologyReport = require('../model/radiology');
const UrineStoole = require('../model/urinestoole');
const VaccinationReport = require('../model/vaccination');
const Prescription = require('../model/prescription');
const { sendSms } = require('../Firebase')
var blood_filename = '';
var con_filename = '';
var pres_filename = '';
var radio_filename = '';
var urine_filename = '';
var vaccination_filename = '';
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if(file.fieldname === "docsdata"){
                cb(null, "public/reports/bloodReport")
            }
            else if(file.fieldname == "c_docsdata"){
                cb(null, "public/reports/consultancyReport")
            }
            else if(file.fieldname == "p_docsdata"){
                cb(null, "public/reports/prescriptionReport")
            }
            else if(file.fieldname == "r_docsdata"){
                cb(null, "public/reports/radioscanReport")
            }
            else if(file.fieldname == "u_docsdata"){
                cb(null, "public/reports/urinestooleReport")
            }
            else if(file.fieldname == "v_docsdata"){
                cb(null, "public/reports/vaccinationReport")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if(file.fieldname === "docsdata"){
                blood_filename = "public/reports/bloodReport/"+"bloodReport" + "-" +  name + "-" + Date.now() + "." + ext;
                cb(null, "bloodReport" + "-" +  name + "-" + Date.now() + "." + ext)
            }
            if(file.fieldname === "c_docsdata"){
                con_filename = "public/reports/consultancyReport/" + "consultancyReport"+ "-"+ name + "-" + Date.now() + "." + ext
                cb(null,"consultancyReport"+ "-"+ name + "-" + Date.now() + "." + ext)
            }
            if(file.fieldname === "p_docsdata"){
                pres_filename = "public/reports/prescriptionReport/" + "prescriptionReport"+ "-"+ name + "-" + Date.now() + "." + ext
                cb(null,"prescriptionReport"+ "-"+ name + "-" + Date.now() + "." + ext)
            }
            if(file.fieldname === "r_docsdata"){
                radio_filename = "public/reports/radioscanReport/" + "radioReport"+ "-"+ name + "-" + Date.now() + "." + ext
                cb(null,"radioReport"+ "-"+ name + "-" + Date.now() + "." + ext)
            }
            if(file.fieldname === "u_docsdata"){
                urine_filename = "public/reports/urinestooleReport/" + "urinReport"+ "-"+ name + "-" + Date.now() + "." + ext
                cb(null,"urinReport"+ "-"+ name + "-" + Date.now() + "." + ext)
            }
            if(file.fieldname === "v_docsdata"){
                vaccination_filename = "public/reports/vaccinationReport/" + "vaccinationReport"+ "-"+ name + "-" + Date.now() + "." + ext
                cb(null,"vaccinationReport"+ "-"+ name + "-" + Date.now() + "." + ext)
            }
        }
    })
})
router.post('/add-forms-data123' , upload.fields([
    { name: "docsdata", maxCount: 1 },
    { name: "c_docsdata", maxCount: 1 },
    { name: "v_docsdata", maxCount: 1 },
    { name: "u_docsdata", maxCount: 1 },
    { name: "p_docsdata", maxCount: 1 },
    { name: "r_docsdata", maxCount: 1 }
  ]), async function (req, res, next) {
    let blooddata = await blood(req, res);
    let consultationdata = await consultation(req, res);
    let radiologydata = await radiology(req, res)
    let urindata = await urin(req, res)
    let prescriptiondata = await prescription(req, res);
    let vaccinationdata = await vaccination(req, res)

    console.log( 'req.body ----->>', req.body.patientId)
    Patient.findOne({patientId: req.body.patientId})
    .then((patient)=>{
        console.log('patient?.notifyToken',patient?.notifyToken)
        Notification.create({
            patientId: patient?.patientId,
            notificationTitle: `New medication`,
            notificationMsg: ` Congratulations ${patient?.patientName.toUpperCase()} new Medication has been Added`,
        }).then((notify) => {
            sendSms(patient?.notifyToken , notify.notificationTitle, notify.notificationMsg);
        })
    })
});
module.exports = router;

async function blood(req, res, next) {
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
        let bloodreportDetails = {
            'bloodReportId': bloodReportId + 1,
            'blood_appoDate': req.body.blood_appoDate,
            'blood_appoTime': req.body.blood_appoTime,
            'blood_testName': req.body.blood_testName,
            'blood_testDetails': req.body.blood_testDetails,
            'blood_testResult': req.body.blood_testResult,
            'blood_testCharge': req.body.blood_testCharge,
            'blood_drsuggest': req.body.blood_drsuggest,
            'blood_Hospital': req.body.blood_Hospital,
            'blood_raison':req.body.blood_raison,
            'patientId': req.body.patientId,
            'docsdata': blood_filename,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg
        }
        if (req.file) {
            bloodreportDetails.docsdata = req.file.path
        };
        BloodReport.create(bloodreportDetails).then(b => {
            res.send({
                status: true,
                message: "Blood report details added successfully!!",
                data: b
            });
        }).catch(err => {
            return ({})
        });
    })
}
async function consultation(req, res, next) {
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
        consultationDetails = {
            'consultationId': consultationId + 1,
            'c_appoDate': req.body.c_appoDate,
            'c_appoTime': req.body.c_appoTime,
            'consultationName': req.body.consultationName,
            'consultationResult': req.body.consultationResult,
            'consultationPrescription': req.body.consultationPrescription,
            'consultationNotes': req.body.consultationNotes,
            'consultationCharge': req.body.consultationCharge,
            'c_Hospital': req.body.c_Hospital,
            'c_raison':req.body.c_raison,
            'is_active': 1,
            'patientId': req.body.patientId,
            'c_docsdata': con_filename,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg
        }
        if (req.file) {
            consultationDetails.c_docsdata = req.file.path
        };
        ConsultationReport.create(consultationDetails).then(c => {
            res.send({
                message: "Consultation report details added successfully!!",
                data: c
            });
        }).catch(err => {
            return ({})
        });
    })
}
async function prescription(req, res, next) {
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
        let PrescriptionDetails = {
            'prescriptionId': prescriptionId + 1,
            'p_appoDate': req.body.p_appoDate,
            'p_appoTime': req.body.p_appoTime,
            'patientId': req.body.patientId,
            'pharmacyname':req.body.pharmacyname,
            'medicinename':req.body.p_medicinename.split(","),
            'p_raison':req.body.p_raison,
            'p_docsdata': pres_filename,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg,
            'p_diseases':req.body.p_diseases.split(","),
            'p_nextcheckup':req.body.p_nextcheckup,
            'prescription':req.body.prescription
        }
        if (req.file) {
            PrescriptionDetails.document = req.file.path
        };
        Prescription.create(PrescriptionDetails).then(p => {
            res.send({
                status: true,
                message: "Prescription details added successfully!!",
                data: p
            });
        }).catch(err => {
            return ({})
        });

    })
};
async function radiology(req, res, next) {
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
        radiologyDetails = {
            'radiologyId': radiologyId + 1,
            'r_appoDate': req.body.r_appoDate,
            'r_appoTime': req.body.r_appoTime,
            'r_testName': req.body.r_testName,
            'r_testDetails': req.body.r_testDetails,
            'r_testResult': req.body.r_testResult,
            'r_testCharge': req.body.r_testCharge,
            'r_Hospital': req.body.r_Hospital,
            'r_raison':req.body.r_raison,
            'patientId': req.body.patientId,
            'is_active': 1,
            'r_docsdata': radio_filename,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg,
            'r_notes':req.body.r_notes
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
            return ({})
        });

    })
}
async function urin(req, res, next) {
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
        urinereportDetails = {
            'uninetestId': uninetestId + 1,
            'u_appoDate': req.body.u_appoDate,
            'u_appoTime': req.body.u_appoTime,
            'u_testName': req.body.u_testName,
            'u_testDetails': req.body.u_testDetails,
            'u_testResult': req.body.u_testResult,
            'u_testCharge': req.body.u_testCharge,
            'u_drsuggest': req.body.u_drsuggest,
            'u_Hospital': req.body.u_Hospital,
            'u_raison':req.body.u_raison,
            'patientId': req.body.patientId,
            'u_docsdata': urine_filename,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg
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
            return ({});
        });

    })
}
async function vaccination(req, res, next) {
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
        vaccinereportDetails = {
            'vaccinationId': vaccinationId + 1,
            'v_appoDate': req.body.v_appoDate,
            'expirydate':req.body.expirydate,
            'v_appoTime': req.body.v_appoTime,
            'vaccinationName': req.body.vaccinationName,
            'vaccinationDetails': req.body.vaccinationDetails,
            'vaccinationcharge': req.body.vaccinationcharge,
            'v_Hospital': req.body.v_Hospital,
            'v_raison':req.body.v_raison,
            'patientId': req.body.patientId,
            'v_docsdata': vaccination_filename,
            'drId': req.body.drId,
            'drName': req.body.drName,
            'drimg': req.body.drimg
        }
        if (req.file) {
            vaccinereportDetails.document = req.file.path
        };
        VaccinationReport.create(vaccinereportDetails).then(vaccine => {
            res.send({
                message: "Vaccination report details added successfully!!",
                data: vaccine
            });
        }).catch(err => {
            return ({})
        });

    })
}
