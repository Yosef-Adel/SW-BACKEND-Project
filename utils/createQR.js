//require the qrcode package
const QRCode = require('qrcode');

const createQR = async (data) => {
    try {
        //generate the QR code
        const qr = await QRCode.toDataURL(data);
        return qr;
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {createQR};