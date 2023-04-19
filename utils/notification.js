var admin = require("firebase-admin");

var serviceAccount = require("./julla-tutorial.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sample-project-e1a84.firebaseio.com"
})

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