const dotenv=require("dotenv");
const mongoose= require('mongoose');
const app = require('./app');

const db=process.env.NGO_URL_HOSTED;
let port = process.env.PORT || 3000;

mongoose.set('strictQuery', true);
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result)=> app.listen(port, () => console.log(`Server running on port ${port}`)))
.catch((err)=>console.log('DB connection error',err));

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (error) => {
    console.log('Server error', error);
}); 



