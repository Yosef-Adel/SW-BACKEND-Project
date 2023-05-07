
var admin = require("firebase-admin");

var serviceAccount = require("../envie-a85e3-firebase-adminsdk-tn5bn-750d28216b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

function sendNotification(res,message, token){
    const notification_options = {
      priority: "high",
      timeToLive: 60 * 60 * 24
    };
    admin.messaging().sendToDevice(token, message, notification_options).then((response) => {
        console.log('Successfully sent message:', response);
        res.status(200).json({message: 'Notification sent successfully'});
    }
    ).catch((error) => {
        console.log('Error sending message:', error);
        res.status(400).json({message: 'Error sending message'});
    });
}

module.exports = {admin, sendNotification};