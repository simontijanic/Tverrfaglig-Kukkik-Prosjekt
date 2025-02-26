const mongoose = require("mongoose")
const BeiteArea = require("../Models/beiteAreaModel")

const mockdata = require("../Utils/mockdata")

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL)
        console.log("Connected to database")
        //mockdata();
    } catch (error) {
        console.log(error)
        
    }
}

module.exports = connectToDatabase;