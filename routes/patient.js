const config = require("./../config")
const express = require('express');
const router = express.Router();
const PatientDetails = require('../model/patient');
const bloodreports = require('../model/blood');
const multer = require('multer');
const db = require('./../app')
const email = require('./email');
const QRCode = require('qrcode')
const moment = require('moment');
const { sendSms } = require("../Firebase");
const User = require("../model/user");
const Notification = require("../model/notification");
const Pharmacistlist = require("../model/pharmacist");
var profileimg = ''
var documentimg = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "profile") {
                cb(null, "public/reports/patient/Profile")
            }
            else if (file.fieldname == "docimg") {
                cb(null, "public/reports/patient/document")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            if (file.fieldname === "profile") {
                profileimg = "public/reports/patient/Profile/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
            if (file.fieldname === "docimg") {
                documentimg = "public/reports/patient/document/" + name + "-" + Date.now() + "." + ext
                cb(null, name + "-" + Date.now() + "." + ext)
            }
            // cb(null, name + "-" + Date.now() + "." + ext)
        }
    })
})
router.post("/login", async (req, res, next) => {
    const validationCode = await generateValidationCode();
    let search = {}
    if (req.body.patientEmail)
        search.patientEmail = req.body.patientEmail
    else if (parseInt(req.body.patientMobile))
        search.patientMobile = parseInt(req.body.patientMobile);
    const patient = await PatientDetails.findOne(search);
    if (patient) {
        // if (patient.is_approved == 1) {
        if (patient.is_active == 1) {
            if (req.body.patientEmail != undefined) {
                var otp = validationCode
                const message = {
                    from: 'demo.codemeg@gmail.com',
                    to: patient.patientEmail,
                    subject: "Your OTP for login to Kedi",
                    html: `Hello,<br><br> Verification code for Donka login is <b>${otp}</b><br><br>Best Regards,<br>Donka<br>`

                }
                email.sendMail(message, function (err, info) {
                    if (err) {
                        console.log("is_email_send error", err);
                    } else
                        console.log("email sent");
                });
            }
            else if (parseInt(req.body.patientMobile) != undefined) {
                console.log("mobile+++--------------")
                var otp = validationCode
                const message = {
                    from: 'demo.codemeg@gmail.com',
                    to: patient.patientEmail,
                    subject: "Your OTP for login to Donka",
                    html: `Hello,<br><br> Verification code for Donka login is <b>${otp}</b> <br><br>Best Regards,<br>Donka<br>`

                }
                email.sendMail(message, function (err, info) {
                    if (err) {
                        console.log("is_email_send error", err);
                    } else
                        console.log("email sent");
                });
            }
            let patientDetail = {
                'otp': otp,
                'notifyToken': req.body.token
            }
            PatientDetails.findOneAndUpdate(search, patientDetail).then(function (patient) {
                PatientDetails.findOne(search).then(function (patient) {
                    res.send({
                        status: true,
                        message: "Email send",
                        otp: otp,
                        data: patient
                    });
                })
            }).catch(err => {
                res.status(500).send({
                    status: false,
                    message: err.message || "Some error occurred while sending email"
                });
            })
        }
        else {
            res.status(401).json({ error: "Your account is deactivated. Please contact with admin" });
        }
    }
    else {
        res.status(401).json({ error: "Patient does not exist" });
    }
});
router.post("/verify-otp", async (req, res, next) => {
    let search = {}
    if (req.body.patientEmail)
        search.patientEmail = req.body.patientEmail.toLowerCase();
    else if (req.body.patientMobile)
        search.patientMobile = parseInt(req.body.patientMobile);

    const patient = await PatientDetails.findOne(search);
    await db.collection("patients").find(search).toArray((err, result) => {
        if (result) {
            if (result[0].otp == parseInt(req.body.otp)) {
                res.send({
                    status: true,
                    message: "correct otp",
                    data: result[0]
                });
            }
            else {
                res.send({
                    status: false,
                    message: "Wrong otp",
                });
            }
        }
        else {
            res("user not matched!");
        }
    });
})
router.post('/add-patient-details', upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "docimg", maxCount: 1 },
]), async (req, res, next) => {
    console.log("req.body.pharma_id", req.body.pharma_id);
    console.log("req.body.addedByPharma", req.body.addedByPharma);
    const validationCode = await generateValidationCode();
    let field = '';
    if (req.body.patientEmail !== '')
        field = req.body.patientEmail
    else if (req.body.patientMobile !== '')
        field = req.body.patientMobile

    let stringdata = JSON.stringify(field)

    await QRCode.toDataURL(stringdata, function (err, code) {
        console.log("req.body --------------->>>>>>>---------->>" , req.body);
        if (err)
            res.send({
                status: false,
                message: "qrcode not created"
            });
        else {
            // req.body.qrcode = code

            console.log('add-patient-details--->>', validationCode);
            var patientId;
            var orderId;
            PatientDetails.find().then(function (patientreport) {
                if (patientreport.length > 0) {
                    patientId = patientreport[0].patientId
                    for (let i = 1; i < patientreport.length; i++) {
                        if (patientId < patientreport[i].patientId)
                            patientId = patientreport[i].patientId
                    }
                }
                else
                    patientId = 0
                let newId = parseInt(patientId) + 1;

                console.log("code------>>", req.body.qrcode);
                let patientDetails = {
                    'patientId': newId,
                    'patient_refrenceId': "donpat-" + newId,
                    'patientName': req.body.patientName,
                    'patientGender': req.body.patientGender,
                    'patientMobile': req.body.patientMobile,
                    'patientEmail': req.body.patientEmail,
                    'patientDOB': req.body.patientDOB,
                    'patientMedicationTaken': req.body.patientMedicationTaken,
                    'patientAddress': req.body.patientAddress,
                    'is_active': 1,
                    'is_approved': 0,
                    'patientPid': req.body.patientPid,
                    'patientPiddoc': req.body.patientPiddoc,
                    'hospital_id': req.body.hospital_id,
                    'hospital_name': req.body.hospital_name,
                    'doctor_id': req.body.doctor_id,
                    'doctor_name': req.body.doctor_name,
                    'profile': profileimg,
                    'docimg': documentimg,
                    'otp': validationCode,
                    'notifyToken': req.body.token,
                    'qrcode': code,
                    "pharma_id": req.body.pharma_id,
                    "addedByPharma": req.body.addedByPharma || false
                }
                if (req.body.pharma_id && req.body.addedByPharma) {
                    patientDetails.pharma_id = req.body.pharma_id,
                        patientDetails.addedByPharma = req.body.addedByPharma
                }
                console.log("patientDetails--->>", patientDetails);
                PatientDetails.create(patientDetails).then(patientdetl => {
                    sendByPatient(patientdetl.patientName);
                    var otp = validationCode
                    const message = {
                        from: 'demo.codemeg@gmail.com',
                        to: req.body.patientEmail,
                        subject: "Your request for Registration to Kedi",
                        html: `Hello,<br><br> your request find successfully <br><br>Best Regards,<br>Kedi<br>`
                    }

                    console.log('email sent bt patient --->>', otp);
                    email.sendMail(message, function (err, info) {
                        if (err) {
                            console.log("is_email_send error", err);
                        } else

                            console.log('email sent successfully --->>', otp);
                        console.log("email sent");
                    });
                    res.send({
                        status: true,
                        message: "Patient details added successfully!!",
                        data: patientdetl
                    });
                }).catch(err => {
                    let msg = err.message;
                    if (msg.search('duplicate key') != -1) {
                        message = "This email or mobile is already registered with us"
                        res.status(500).send({
                            status: false,
                            message: message
                        });
                    }
                    else {
                        res.status(500).send({
                            status: false,
                            message: err.message || "Some error occurred while creating Patient Details"
                        });
                    }
                });
            })
        }
    });
});
router.post('/get-all-isactive-patient', async function (req, res, next) {
    let findjson = {}
    if (req.body.role != 1) {
        findjson.is_active = 1;
    }
    await PatientDetails.find(findjson).then(function (patients) {
        res.send({
            status: true,
            message: "All Patient Details!!",
            getallpatients: patients
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all patient details"
        });
    });
});
router.get("/getallpatient", async (req, res, next) => {
    let findJson = {};
    let patientName = '';
    if (typeof req.query.patientName !== 'undefined') {
        patientName = req.query.patientName.trim();
        findJson.patientName = { $regex: patientName, $options: 'i' };
        findJson.is_approved = 1
    }

    if (findJson.length == 0) {
        const patients = await db.collection('patients').find().toArray()
        if (patients.length > 0) {
            res.send({
                status: true,
                message: "All patient details!!",
                data: patients
            });
        } else {
            res.send({
                status: false,
                message: "patient not found!!",
                data: patients
            });
        }
    } else {
        const patients = await db.collection('patients').find(findJson).toArray()
        if (patients.length > 0) {
            res.send({
                status: true,
                message: "All patient details!!",
                data: patients
            });
        } else {
            res.send({
                status: false,
                message: "patient not found!!",
                data: patients
            });
        }
    }
})
router.get('/get-all-patients-searchlist', function (req, res, next) {
    PatientDetails.find({ "is_approved": 1, "is_active": 1 }).then(function (patientdetails) {
        res.send({
            status: true,
            message: "All patient details!!",
            data: patientdetails
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all patients"
        });
    });
});
router.post('/get-all-patient-details', async function (req, res, next) {
    let findjson = { is_approved: 1 }
    if (req.body.role != 1) {
        findjson.is_active = 1;
    }
    await PatientDetails.find(findjson).then(function (patient) {
        res.send({
            status: true,
            message: "All patients!",
            data: patient
        });
    }).catch(next);
});
router.post('/get-approved-patient', async function (req, res, next) {
    let findjson = { is_active: 1 }
    if (req.body.role == 1) {
        findjson.is_approved = 1;
    }
    await PatientDetails.find(findjson).then(function (getp) {
        res.send({
            status: true,
            message: "All patients!",
            data: getp
        });
    }).catch(next);
});
router.get('/get-all-patient/:doctor_id', function (req, res, next) {

    if (req.query.role === 3 || req.query.role === '3') {
        console.log("if while role is 3 ------->>");
        let array = [];
        let limit = 10;
        let offset = 0;
        PatientDetails.find({ addedByPharma: { "$exists": true }, is_approved: 1, is_active: 1, pharma_id: req.params.doctor_id }).sort({ createdAt: -1 }).limit(limit).skip(offset).then(async function (patient) {
            
            for (let elm of patient) {
                const user = await User.findOne({ userId: parseInt(elm.doctor_id) })
                elm.doctor_name = await user.userName
                array.push(elm)
            }
            res.send({
                status: true,
                message: "All patient report details!!",
                patient: array
            });
        }).catch(err => {
            console.log(err);
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while getting all patient"
            });
        });

    } else {
        console.log("if while role is 2 for doctor ------->>");
        let limit = 10;
        let offset = 0;
        PatientDetails.find({ is_approved: 1, is_active: 1, doctor_id: req.params.doctor_id }).sort({ createdAt: -1 }).limit(limit).skip(offset).then(function (patient) {
            res.send({
                status: true,
                message: "All patient report details!!",
                patient: patient
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while getting all patient"
            });
        });

    }
});
router.get('/patient-app-by-id/:patientId', function (req, res, next) {
    PatientDetails.findOne({ patientId: req.params.patientId }).then(function (patient) {
        if (patient) {
            var url = patient.profile
            if (url != '' && url != undefined && url != null) {
                var splitUrl = url.split('/');
                patient.profile = config.projectUrl1 + splitUrl[1] + "/" + splitUrl[2] + "/" + splitUrl[3] + "/" + splitUrl[4]
            }
            else {
                patient.profile = ''
            }

            var url1 = patient.docimg
            if (url1 != '' && url1 != undefined && url1 != null) {
                var splitUrl1 = url1.split('/')
                patient.docimg = config.projectUrl1 + splitUrl1[1] + "/" + splitUrl1[2] + "/" + splitUrl1[3] + "/" + splitUrl1[4];
            }
            else {
                patient.docimg = ''
            }
            patient.patientDOB = moment(patient.patientDOB).format("L")
            res.send({
                status: true,
                message: "Patient details!!",
                patient: patient,
            });
        }
        else {
            res.send({
                status: false,
                message: "Patient does not exist!!",
            });
        }
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding Patient"
        });
    });
});
router.get('/patient-by-id/:patientId', function (req, res, next) {
    PatientDetails.findOne({ patientId: req.params.patientId }).then(function (patient) {
        res.send({
            status: true,
            message: "Patient details!!",
            patient: patient
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding Patient"
        });
    });
});
router.post('/get-all-isactive-patient', async function (req, res, next) {
    let findjson = {}
    if (req.body.role != 1) {
        findjson.is_active = 1;
    }
    await PatientDetails.find(findjson).then(function (patients) {
        res.send({
            status: true,
            message: "All Patient Details!!",
            getallpatients: patients
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all patient details"
        });
    });
});
router.put('/update-patient-byid-profileimg/:patientId', upload.fields([
    { name: "profile", maxCount: 1 },
]), async function (req, res, next) {
    pdet = {
        'profile': profileimg,
    }
    if (req.file) {
        pdet.profile = req.file.path
    };
    PatientDetails.findOneAndUpdate({ patientId: req.params.patientId }, pdet).then(function (p) {
        PatientDetails.findOne({ patientId: req.params.patientId }).then(function (pat) {
            res.send({
                status: true,
                message: "patient Updated successfully!!",
                data: pat
            });
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while Updating patient profile"
        });
    });
});
router.put('/update-patient-byid-docimg/:patientId', upload.fields([
    { name: "docimg", maxCount: 1 },
]), async function (req, res, next) {
    pdoc = {
        'docimg': documentimg,
    }
    if (req.file) {
        pdoc.docimg = req.file.path
    };
    PatientDetails.findOneAndUpdate({ patientId: req.params.patientId }, pdoc).then(function (user) {
        PatientDetails.findOne({ patientId: req.params.patientId }).then(function (p) {
            res.send({
                status: true,
                message: "User Updated successfully!!",
                data: p
            });
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while Updating User"
        });
    });
});
router.put('/add-remove-patient/:patientId', async function (req, res, next) {
    let patient = await PatientDetails.findOne({ patientId: req.params.patientId })
    let field = '';
    if (patient.patientEmail !== '')
        field = patient.patientEmail
    else if (patient.patientMobile !== '')
        field = patient.patientMobile

    let stringdata = JSON.stringify(field)
    await QRCode.toDataURL(stringdata, function (err, code) {
        if (err)
            res.send({
                status: false,
                message: "QR CODE not created"
            });
        else {
            req.body.qrcode = code
            PatientDetails.findOneAndUpdate({ patientId: req.params.patientId }, req.body).then(function (patient) {
                if (req.body.is_approved == 1) {
                    sendFromAdmin(patient.patientName, patient.patientId, patient.notifyToken)
                }
                if (req.body.is_active == 1) {
                    sendFromAdmin(patient.patientName, patient.patientId, patient.notifyToken, 'active')
                } else if (req.body.is_active == 0) {
                    sendFromAdmin(patient.patientName, patient.patientId, patient.notifyToken, 'unactive')
                }
                res.send({
                    status: true,
                    message: "Patient Updated successfully!!",
                    patient: patient
                });
            }).catch(err => {
                res.status(500).send({
                    status: false,
                    message: err.message || "Some error occurred while Updating patient"
                });
            });
        }
    });
});
router.get('/get-all-unapproved-patient', function (req, res, next) {
    PatientDetails.find({ "is_approved": 0 }).then(function (p) {
        res.send({
            status: true,
            message: "All patient details!!",
            data: p
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all patient"
        });
    });
});       
router.put('/update-patient-byid/:patientId', async function (req, res, next) {
    console.log("req.body=========>>>" , req.body);
    if (req.body.patientEmail || req.body.patientMobile) {
        let field = '';
        if (req.body.patientEmail !== '')
            field = req.body.patientEmail
        else if (req.body.patientMobile !== '')
            field = req.body.patientMobile

        let stringdata = JSON.stringify(field)
        await QRCode.toDataURL(stringdata, function (err, code) {
            if (err)
                res.send({
                    status: false,
                    message: "qrcode not created"
                });
            if (code) {
                PatientDetails.findOneAndUpdate({ patientId: req.params.patientId }, {...req.body , qrcode : code}).then(function (patient) {
                    PatientDetails.findOne({ patientId: req.params.patientId }).then(function (patient) {
                        if (req.body.is_approved == 1) {
                            sendFromAdmin(patient.patientName, patient.patientId, patient.notifyToken)
                        }
                        res.send({
                            status: true,
                            message: "Patient Updated successfully!!",
                            patient: patient
                        });
                        
                    });
                }).catch(err => {
                    res.status(500).send({
                        status: false,
                        message: err.message || "Some error occurred while Updating patient"
                    });
                });
                PatientDetails.findOne({patientId: req.params.patientId})
                .then((patient)=>{
                    if(req.body.hospital_id !== patient.hospital_id && req.body.doctor_id == patient.doctor_id){
                        console.log(`----->>> ${req.body.hospital_id} !== ${patient.hospital_id} && ${req.body.doctor_id} == ${patient.doctor_id}`);
                        PatientDetails.updateMany(
                            { patientId: req.params.patientId }, // Condition to match
                            { $set: { doctor_id:"", doctor_name:"Select hospital name first"} } // Fields to unset (delete)
                        )
                            .then(function (result) {
                                console.log(result);
                            })
                            .catch(function (err) {
                            });
                    }
                });
            }
        })
    } else {
        PatientDetails.findOneAndUpdate({ patientId: req.params.patientId }, req.body).then(function (patient) {
            PatientDetails.findOne({ patientId: req.params.patientId }).then(function (patient) {
                if (req.body.is_approved == 1) {
                    sendFromAdmin(patient.patientName, patient.patientId, patient.notifyToken)
                }
                res.send({
                    status: true,
                    message: "Patient Updated successfully!!",
                    patient: patient
                });
            });
        }).catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while Updating patient"
            });
        });
    }
});
router.put('/update-patient-details/:id', function (req, res, next) {
    PatientDetails.findOneAndUpdate({ _id: req.params.id }, req.body).then(function (patientdetails) {
        PatientDetails.findOne({ _id: req.params.id }).then(function (patientdetails) {
            res.send({
                status: true,
                message: "Patient details Update successfully!!",
                data: patientdetails
            });
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while updating patient details"
        });
    });
});
router.delete('/delete-patient-details/:patientId', function (req, res, next) {
    PatientDetails.findOneAndDelete({ patientId: req.params.patientId }).then(function (patientdetails) {
        res.send({
            status: true,
            message: "Patient details Deleted successfully!!",
            data: patientdetails
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while deleting Patient details"
        });
    });
});
router.get('/get-patient-unapprove', async function (req, res, next) {
    await PatientDetails.find({ 'is_approved': 0 }).then(function (getpat) {
        res.send({
            status: true,
            message: "All patients!",
            user: getpat
        });
    }).catch(next);
});
module.exports = router;

function generateValidationCode() {
    return (Math.floor(Math.random() * (99999 - 10000 + 1) + 10000));
}

function generatePassword(pass) {
    const salt = bcrypt.genSalt(10);
    const password = bcrypt.hash(pass, salt);
    return password;
}

const sendByPatient = (name) => {
    User.find({ role: 1 }).then((admins) => {
        let tokens = []
        if (admins.length > 0) {
            for (let elm of admins) {
                tokens.push(elm.notifyToken)
            }
            Notification.create({
                admin: true,
                notificationTitle: 'User onboard',
                notificationMsg: `${name} wants to onboard on the portal as a patient`,
            }).then((notify) => {
                for (let token of tokens) {
                    sendSms(token, notify.notificationTitle, notify.notificationMsg)
                }
            })

        } else {
            console.log("Admin not Found in table")
        }
    })
}

const sendFromAdmin = (name, id, token, type) => {
    if (!type) {
        Notification.create({
            patientId: id,
            userId: null,
            notificationTitle: `Welcome Onboard`,
            notificationMsg: `Congratulations ${name.toUpperCase()} your profile has been approved by admin.`,
        }).then((notify) => {
            sendSms(token, notify.notificationTitle, notify.notificationMsg);
        })
    }
    else if (type == 'active') {
        Notification.create({
            patientId: id,
            userId: null,
            notificationTitle: `Welcome Back Onboard`,
            notificationMsg: ` Congratulations ${name.toUpperCase()} your profile has been Activeted by admin.`,
        }).then((notify) => {
            sendSms(token, notify.notificationTitle, notify.notificationMsg);
        })
    }
    else if (type == 'unactive') {
        Notification.create({
            patientId: id,
            userId: null,
            notificationTitle: `Welcome Back Onboard`,
            notificationMsg: ` Regret to say ${name.toUpperCase()} that your profile has been Deactiveted by admin.`,
        }).then((notify) => {
            sendSms(token, notify.notificationTitle, notify.notificationMsg);
        })
    }
}