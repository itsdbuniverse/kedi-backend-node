const express = require('express')
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const cors = require('cors');
const { sendSms } = require('./Firebase');
const app = express();

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 
// app.use(cors());
app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH' , 'OPTION'], 
    origin: '*'
}));
// connect to mongodb
const conUrl='mongodb://127.0.0.1:27017/donka'
mongoose.connect(conUrl)
.then(() => console.log( 'Database Connected' ))
.catch(err => console.log('Database Error', err ));
const db=mongoose.connection
console.log("connection done with mongodb....")
module.exports=db
// mongoose.Promise = global.Promise;

app.use(express.static('public'));

app.use(express.json());


// initialize routes
app.use('/user',require('./routes/user'));
app.use('/patient',require('./routes/patient'));
app.use('/',require('./routes/notification'));
app.use('/blood',require('./routes/blood'));
app.use('/urinestoole',require('./routes/urinestoole'));
app.use('/consultation',require('./routes/consultation'));
app.use('/radiology',require('./routes/radiology'));
app.use('/vaccination',require('./routes/vaccination'));
app.use('/hospitallist',require('./routes/hospitallist'));
app.use('/laboratorylist',require('./routes/laboratory'));
app.use('/pharmacy',require('./routes/pharmacist'));
app.use('/prescription',require('./routes/prescription'));
app.use('/formsdata',require('./routes/formsdata'));
app.use('/uploads',express.static('uploads'))
// Vaccination
// error handling middleware
app.use(function(err,req,res,next){
    //console.log(err);
    res.status(422).send({error: err.message});
});

app.listen(5000, () => {
    // sendSms();
    console.log(`Server Started at http://localhost:${5000}/`)
})
