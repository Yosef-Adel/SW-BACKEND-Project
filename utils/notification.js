var admin = require("firebase-admin");

var serviceAccount = require("../envie-a85e3-firebase-adminsdk-tn5bn-750d28216b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

function sendNotification(message, token){
    const notification_options = {
      priority: "high",
      timeToLive: 60 * 60 * 24
    };
    console.log('sending message:', message);
    const payload = {
      'notification': {
        'title': message.title,
        'body': message.body
      }, 
    };
    admin.messaging().sendToDevice(token, payload, notification_options).then((response) => {
      console.log('Successfully sent message:', response);   
    }).catch((error) => {
      console.log('Error sending message:', error);
    });
}

module.exports = {admin, sendNotification};