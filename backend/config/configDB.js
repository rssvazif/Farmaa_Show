const mongoose = require('mongoose')

const connectDB = async ()=>{
    try{
        await mongoose.connect('mongodb://localhost:27017/farmaaDB')
        console.log('connecting to database is done.');
    }catch(error){
        console.log('Error connecting to database!!', error);
        process.exit(1)
    }
}

module.exports = connectDB