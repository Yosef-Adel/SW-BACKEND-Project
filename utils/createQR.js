//require the qrcode package
const QRCode = require('qrcode');

const createQR = async (url) => {
    try {
        // //generate the QR code
        // const qr = await QRCode.toDataURL(url);
        //make the qr code image name a variable 
        //generate a random string for the image name with the date of now
        let imageName = 'QrCode' + Date.now() + '.png';
        //generate the QR code
        const qr = await QRCode.toFile('./public/' + imageName, url);
        //return the QR code and the image name
        return imageName
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {createQR};