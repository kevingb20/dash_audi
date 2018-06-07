var express = require('express')
  , path = require('path');

var app = express();
//FIREBASE
var admin = require("firebase-admin");
var serviceAccount = require("concierge-audi-firebase-adminsdk-0563f-cecf9a0184");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://concierge-audi.firebaseio.com"
});
//FIN FIREBASE

//Para recibir post desde otro archivo
var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));// esto sirve para que al poner / en un SRC ya sepa que es public

app.get('/', function(req, res) {
    res.render('login');
});

app.get('/dash', function (requiere, res) {
  res.render('dash');
})
app.get('/passwordRecovery', function (requiere, res) {
  res.render('passwordRecovery');
})
const http = require('http');

app.listen(8080);
console.log('8080 is the magic port');


//Eliminar

app.post('/delete',  (req, res) => {
  console.log(req.body.uid);

  admin.auth().deleteUser(req.body.uid)
    .then(function() {
      console.log("Successfully deleted user");
      res.end();
    })
    .catch(function(error) {
      console.log("Error deleting user:", error);
    });
    res.end();
});


/*
// This registration token comes from the client FCM SDKs.
var registrationToken = 'cEXdVZfv2MA:APA91bGoqMYBF0SB9CpXygSrHA2lSNCiEPzhAsfTK7DblzrjkYS1vVzcne_KaclYCGTttOHny7zOSuhLj6Wj9eoilMuMtP-rKfKqyMacZ7rdtnJexcVM00HQyVpyaq0IRfzArOOLSV9F';

// See documentation on defining a message payload.
var message = {
  data: {
    score: '850',
    time: '2:45'
  },
  token: registrationToken
};

app.post('/enviarMensaje',  (req, res) => {
  console.log(req.body.mensaje);
  // Send a message to the device corresponding to the provided
  // registration token.
  admin.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      res.end();
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
    res.end();
});
*/
