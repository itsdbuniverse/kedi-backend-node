const express = require('express');
const router = express.Router();
const email = require('./email');
const bcrypt = require("bcrypt");
const User = require('../model/user');
const multer = require('multer');
const db = require('./../app');
const { route } = require('./patient');
const { sendSms } = require('../Firebase');
const Notification = require('../model/notification');
const PatientDetails = require('../model/patient');
var profileimg = ''
var documentimg = ''
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "profile") {
                cb(null, "public/reports/user/Profile")
            }
            else if (file.fieldname == "docimg") {
                cb(null, "public/reports/user/document")
            }
        },
        filename: function (req, file, cb) {
            let extensionArr = file.originalname.split(".");
            let name = extensionArr[0];
            let ext = extensionArr[extensionArr.length - 1];
            // cb(null, name + "-" +Date.now()+ "." + ext)
            if (file.fieldname === "profile") {
                profileimg = "public/reports/user/Profile/" + name + "-" + Date.now() + "." + ext;
                cb(null, name + "-" + Date.now() + "." + ext)
            }
            if (file.fieldname === "docimg") {
                documentimg = "public/reports/user/document/" + name + "-" + Date.now() + "." + ext
                cb(null, name + "-" + Date.now() + "." + ext)
            }
        }
    })
})

router.post("/login", async (req, res, next) => {
    console.log("user++++++++++++++++++++++++++")
    const user = await User.findOne({ userEmail: req.body.userEmail });
    console.log("user++++++++++++++++++++++++++", user)
    if (user) {
        if (user.is_approved == 1) {
            console.log("isapproved")
            if (user.is_active == 1) {
                console.log("isactive")
                const validPassword = await bcrypt.compare(req.body.userPassword, user.userPassword);
                if (validPassword) {
                    res.status(200).json({ status: true, message: "Valid password", user: user, role: user.role ,token:user.notifyToken});
                } else {
                    res.status(400).json({ error: "Invalid Password" });
                }
            }
            else {
                console.log("deactive")
                res.status(401).json({ error: "Your account is deactivated. Please contact with admin!!" });
            }
        }
        else {
            res.status(401).json({ error: "Account has not been approved yet!!" });
        }
    }
    else {
        res.status(401).json({ status: false, error: "User does not exist" });
    }
});

// router.post("/login", async (req, res, next) => {
//     const user = await User.findOne({ userEmail: req.body.userEmail });
//     console.log("user++++++++++++++++++++++++++", user.is_active)
//     if (user) {
//         const validPassword = await bcrypt.compare(req.body.userPassword, user.userPassword);
//         if (validPassword) {
//             res.status(200).json({ status: true, message: "Valid password", user: user, role: user.role });
//         } else {
//             res.status(400).json({ error: "Invalid Password" });
//         }
//     } else {
//         res.status(401).json({ status: false, error: "User does not exist" });
//     }
// });

router.post('/add-user', upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "docimg", maxCount: 1 },
]), async (req, res, next) => {
    let passw = req.body.userPassword;
    const salt = await bcrypt.genSalt(10);
    const password1 = await bcrypt.hash(passw, salt);
    var userId;
    User.find().then(function (user) {
        if (user.length > 0) {
            userId = user[0].userId
            for (let i = 1; i < user.length; i++) {
                if (userId < user[i].userId)
                    userId = user[i].userId
            }
        }
        else
            userId = 0
        let newId = parseInt(userId) + 1;
        userDetails = {
            'userId': newId,
            'user_refrenceId': "donpro-" + newId,
            'userType': req.body.userType,
            // 'userTypevalue': req.body.userTypevalue,
            // 'userTypevalueid': req.body.userTypevalueid,
            'userName': req.body.userName,
            'userGender': req.body.userGender,
            'userDOB': req.body.userDOB,
            'userMobile': req.body.userMobile,
            'userAddress': req.body.userAddress,
            'userPiddoc': req.body.userPiddoc,
            'userPid': req.body.userPid,
            'userEmail': req.body.userEmail,
            'userPassword': password1,
            'role': req.body.role,
            'is_active': 1,
            'is_approved': 0,
            'profile': profileimg,
            'docimg': documentimg,
            'notifyToken':null
        }
        if (req.body.hospital_id !== undefined) {
            userDetails.hospital_id = req.body.hospital_id
            userDetails.hospital_name = req.body.hospital_name
        }
        if (req.body.phrma_id !== undefined) {
            userDetails.phrma_id = req.body.phrma_id
            userDetails.phrma_name = req.body.phrma_name
        }
        if (req.body.lab_id !== undefined) {
            userDetails.lab_id = req.body.lab_id
            userDetails.lab_name = req.body.lab_name
        }
        if (req.file) {
            userDetails.profile = req.file.path
        };
        console.log("userDetails", userDetails)
        // if(req.body.role == 2 || req.body.role == 3 || req.body.role == 4){
        User.create(userDetails).then(user => {
            if(req.body.role != 1){
                sendByDoctor(user.userName)
            }
            res.send({
                status: true,
                message: "User added successfully!!",
                data: user
            });
        }).catch(err => {
            let msg = err.message;
            if (msg.search('duplicate key') != -1) {
                message = "This email or mobile is already registered with us"
                res.status(500).send({
                    status: false,
                    message: message
                    // err.message || "Some error occurred while creating Patient Details"
                });
            }
            else {
                res.status(500).send({
                    status: false,
                    message: err.message || "Some error occurred while creating Patient Details"
                });
            }
        });
        // }
        // else if(req.body.role == 5){

        // }

    })
});

router.put('/update-user-byid-profileimg/:userId', upload.fields([
    { name: "profile", maxCount: 1 },
]), async function (req, res, next) {
    userDetails = {
        'profile': profileimg,
    }
    if (req.file) {
        userDetails.profile = req.file.path
    };
    console.log("userdetails of profile", userDetails)
    User.findOneAndUpdate({ userId: req.params.userId }, userDetails).then(function (user) {
        User.findOne({ userId: req.params.userId }).then(function (user) {
            res.send({
                status: true,
                message: "User Updated successfully!!",
                user: user
            });
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while Updating User"
        });
    });
});
router.put('/update-user-byid-docimg/:userId', upload.fields([
    { name: "docimg", maxCount: 1 },
]), async function (req, res, next) {
    userDetails = {
        'docimg': documentimg,
    }
    if (req.file) {
        userDetails.docimg = req.file.path
    };
    console.log("userdetails of docimg", userDetails)
    User.findOneAndUpdate({ userId: req.params.userId }, userDetails).then(function (user) {
        User.findOne({ userId: req.params.userId }).then(function (user) {
            res.send({
                status: true,
                message: "User Updated successfully!!",
                user: user
            });
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while Updating User"
        });
    });
});

router.post("/forget-password", async (req, res, next) => {
    const user = await User.findOne({ userEmail: req.body.userEmail });
    const validationCode = await generateValidationCode();

    console.log("user", user)
    if (user) {
        console.log("user find");
        var otp = validationCode
        console.log("otp", otp)
        const message = {
            from: 'demo.codemeg@gmail.com',
            to: req.body.userEmail.toLowerCase(),
            subject: "Your OTP for login to Donka",
            html: "Hello,<br><br> Verification code for Donka login is <br><br>Best Regards,<br>Donka<br>"
                + otp

        }
        console.log("Message", message)
        email.sendMail(message, function (err, info) {
            if (err) {
                console.log("is_email_send error", err);
            } else
                console.log("email sent");
        });
        User.findOneAndUpdate({ 'otp': otp }).then(function (u) {
            User.findOne({ 'userEmail': req.body.userEmail }).then(function (u) {
                res.send({
                    status: true,
                    message: "Email send",
                    otp: otp,
                    user: u
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
        res.status(401).json({ error: "User does not exist" });
    }
});

router.post('/resend-otp', async (req, res, next) => {
    const validationCode = await generateValidationCode();
    var otp = validationCode;
    const message = {
        from: 'demo.codemeg@gmail.com',
        to: req.body.userEmail,
        subject: "Your OTP for login to Donka",
        html: "Hello,<br><br> Verification code for Donka login is <br><br>Best Regards,<br>Donka<br>" + otp
    }
    console.log("Message", message)
    email.sendMail(message, function (err, info) {
        if (err) {
            console.log("is_email_send error", err);
        } else
            console.log("email sent");
    });
    res.send({
        status: true,
        message: "OTP send successfully!!",
        otp: otp
    });
});
router.put('/reset-password/:userEmail', async function (req, res, next) {
    console.log("req.body", req.body)
    let passw = req.body.userPassword;
    console.log("passw", passw)
    const salt = await bcrypt.genSalt(10);
    const password1 = await bcrypt.hash(passw, salt);
    userdetails = {
        'userPassword': password1,
    }
    User.findOneAndUpdate({ userEmail: req.params.userEmail }, userdetails).then(function (user) {
        User.findOne({ userEmail: req.params.userEmail }).then(function (user) {
            res.send({
                status: true,
                message: "Password Updated Successfully!!",
                user: user
            });
        })

    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while Updating password"
        });
    });
});

router.get('/user-by-id/:userId', function (req, res, next) {
    User.findOne({ userId: req.params.userId }).then(function (user) {
        res.send({
            status: true,
            message: "User details!!",
            user: user
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding User"
        });
    });
});
router.get('/doctor-by-hospitalid/:hospital_id', function (req, res, next) {
    User.find({ hospital_id: req.params.hospital_id, role: 2, is_approved: 1, is_active: 1 }).then(function (user) {
        if (user == null) {
            res.send({
                status: false,
                message: "User not found!!",
            });
        }
        else {
            res.send({
                status: true,
                message: "User details!!",
                user: user
            });
        }

    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding User"
        });
    });
});
router.get('/get-all-user-details', function (req, res, next) {
    User.find({ "is_approved": 1, "role": { $in: [2, 3, 4] } }).then(function (userdetails) {
        res.send({
            status: true,
            message: "All user details!!",
            data: userdetails
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all users"
        });
    });
});
router.get('/get-all-unapproved-user', function (req, res, next) {
    User.find({ "is_approved": 0, "role": { $in: [2, 3, 4] } }).then(function (userdetails) {
        res.send({
            status: true,
            message: "All user details!!",
            data: userdetails
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all users"
        });
    });
});

router.get('/get-all-doctor', function (req, res, next) {
    User.find({ "is_approved": 1, "is_active": 1, "userType": "Doctor" }).then(function (userdetails) {
        res.send({
            status: true,
            message: "All doctor details!!",
            data: userdetails
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while getting all doctor"
        });
    });
});
router.post('/get-approved-user', async function (req, res, next) {
    let findjson = { "role": { $in: [2, 3, 4] }, is_active: 1 }
    if (req.body.role == 1) {
        findjson.is_approved = 1;
    }
    await User.find(findjson).then(function (getusers) {
        res.send({
            status: true,
            message: "All Users!",
            user: getusers
        });
    }).catch(next);
});

router.post('/user-by-type', async function (req, res, next) {
    let findjson = { is_approved: 1, is_active: 1, "role": { $in: [2, 3, 4] } }
    if (req.body.userType == 'Doctor') {
        findjson.userType = 'Doctor'
    }
    else if (req.body.userType == 'Pharmacist') {
        findjson.userType = 'Pharmacist'
    }
    else if (req.body.userType == 'Laboratory technician') {
        findjson.userType = 'Laboratory technician'
    }
    else if (req.body.userType == "") {
        findjson;
    }
    await User.find(findjson).then(function (user) {
        res.send({
            status: true,
            message: "User details!!",
            user: user
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while finding User"
        });
    });
});

router.put('/update-user-byid/:userId', function (req, res, next) {
    console.log("req.body======>>", req.body);
    User.findOneAndUpdate({ userId: req.params.userId }, req.body).then(function (user) {
        User.findOne({ userId: req.params.userId }).then(function (user) {
            if (req.body.is_approved == 1) {
                sendFromAdmin(user.userName, user.userId, user.notifyToken)
            } if (req.body.is_active == 1) {
                sendFromAdmin(user.userName, user.userId, user.notifyToken, 'active')
            } else if (req.body.is_active == 0) {
                sendFromAdmin(user.userName, user.userId, user.notifyToken, 'unactive')
            }

            if (req.body.hospital_id) {
                PatientDetails.updateMany(
                    { doctor_id: req.params.userId }, // Condition to match
                    { $set: { hospital_id: req.body.hospital_id, hospital_name: req.body.hospital_name } } // Fields to unset (delete)
                )
                    .then(function (result) {
                        console.log(result);
                    })
                    .catch(function (err) {
                    });
            }
            if(req.body.userName){
                PatientDetails.updateMany(
                    { doctor_id: req.params.userId ,    }, // Condition to match
                    { $set: { doctor_name: req.body.userName } } // Fields to unset (delete)
                )
                    .then(function (result) {
                        console.log(result);
                    })
                    .catch(function (err) {
                    });
            }
            if (req.body.is_active == 0) {
                PatientDetails.updateMany(
                    { doctor_id: req.params.userId }, // Condition to match
                    { $set: { doctor_id: "", doctor_name: "Select The hospital Name first" } } // Fields to unset (delete)
                )
                    .then(function (result) {
                        console.log(result);
                    })
                    .catch(function (err) {
                    });
            }
            res.send({
                status: true,
                message: "User Updated successfully!!",
                user: user
            });
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while Updating User"
        });
    });
});

router.delete('/delete-user/:userId', function (req, res, next) {
    User.findOneAndDelete({ userId: req.params.userId }).then(function (user) {
        res.send({
            status: true,
            message: "User Deleted successfully!!",
            user: user
        });
    }).catch(err => {
        res.status(500).send({
            status: false,
            message: err.message || "Some error occurred while Deleting user"
        });
    });
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

const sendByDoctor = (name) => {
    User.find({ role: 1 }).then((admins) => {
        let tokens = []
        if (admins.length > 0) {
            for (let elm of admins) {
                tokens.push(elm.notifyToken)
            }
            Notification.create({
                admin: true,
                notificationTitle: 'User onboard',
                notificationMsg: `${name} wants to onboard on the portal as a Doctor`,
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
            patientId: null,
            userId: id,
            notificationTitle: `Welcome Onboard`,
            notificationMsg: ` Congratulations ${name.toUpperCase()} your profile has been approved by admin.`,
        }).then((notify) => {
            sendSms(token, notify.notificationTitle, notify.notificationMsg);
        })
    }
    else if (type == 'active') {
        Notification.create({
            patientId: null,
            userId: id,
            notificationTitle: `Welcome Back Onboard`,
            notificationMsg: ` Congratulations ${name.toUpperCase()} your profile has been Activeted by admin.`,
        }).then((notify) => {
            sendSms(token, notify.notificationTitle, notify.notificationMsg);
        })
    }
    else if (type == 'unactive') {
        Notification.create({
            patientId: null,
            userId: id,
            notificationTitle: `Welcome Back Onboard`,
            notificationMsg: ` Regret to say ${name.toUpperCase()} that your profile has been Deactiveted by admin.`,
        }).then((notify) => {
            sendSms(token, notify.notificationTitle, notify.notificationMsg);
        })
    }
}