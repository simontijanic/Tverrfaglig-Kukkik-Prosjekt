const mongoose = require("mongoose")
const BeiteArea = require("../Models/beiteAreaModel")

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL)
        console.log("Connected to database")

    } catch (error) {
        console.log(error)
    }
}

module.exports = connectToDatabase;