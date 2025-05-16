const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://farmaa-mongodb:27017/farmaaDB')
        console.log('connecting to database is done.');
    }catch(error){
        console.log('Error connecting to database!!', error);
        process.exit(1)
    }
}

module.exports = connectDB