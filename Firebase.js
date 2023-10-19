
var FCM = require('fcm-node');
// var serverKey = 'AAAA55x3aM0:APA91bFlYHLfR6wWTkdKB6TwMzDZRP3GEbmdHYy4Z9ZCEzs5KFeRuFawq89pdIefO4340VZeAh2FpPiVmxgA9Lodb6n9ixCzftcR9dz0-FfM6TXpUmXTGcxn2BBfg2lDabwB7QcQj33Q';
var serverKey =
'AAAAjmGzSRQ:APA91bGrw6CTqq2j0DK73azEQ5Y_h2TePHwSd48tWPi4h2hF2dHK7WgU9zIareS-kAA4ovHH7jcn4gn5UHhO7nJXAX0cX4HRa4aV8DosmafpJUuB9suChVgP4mwaCq7XukrMFUdcPXHZ'
var fcm = new FCM(serverKey);

const sendSms = (token, title, body,) => {
    console.log("SEND SMS STARTED ----------------> ")
    var message = {
        to: token || 'c5JZI9FSmoHkKPCBgGvLYd:APA91bGYLwvIp109I20D3CE_Su2v7o7Oy_F1La0zFOEVj-QACFBd6SuC6yuvdBX_chLdFwlZSNQ4oHlzE_jHRYkwD3p-2GDNKNIB7y2yNBiy9dt8E7_e7rmCP09rSdet6FGrWlAsS2eC',
        notification: {
            title: title || 'Donka Health App',
            body: body ||'Message from Donka',
            // icon: 'https://cdn4.vectorstock.com/i/1000x1000/24/03/send-icon-vector-2802403.jpg',
            // click_action: 'https://google.com'
        },

    };
    
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!" + err);
            console.log("Respponse:! " + response);
        } else {
            console.log("Successfully sent with response: ", response);
        }

    });
}

module.exports = { sendSms }