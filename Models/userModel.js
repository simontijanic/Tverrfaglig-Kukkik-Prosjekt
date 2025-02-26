const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactLanguage: { 
      type: String, 
      enum: ['nordsamisk', 'lulesamisk', 'sørsamisk', "norsk", "engelsk"], 
      required: true 
    },
    phone: { 
      type: String, 
      required: true, 
      validate: [/^(\+47\s?)?\d{8}$/, 'Ugyldig telefonnummer. Må være 8 sifre, med eller uten +47.']
    }  
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)