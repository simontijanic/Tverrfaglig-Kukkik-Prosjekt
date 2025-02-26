const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [3, 'Username must be at least 3 characters long.'],
    maxlength: [50, 'Username must not exceed 50 characters.'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores.']
  },
  uuid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'] 
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long.'],
    maxlength: [128, 'Password must not exceed 128 characters.'],
    match: [/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one letter, one number, and one special character.']
  },
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
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
