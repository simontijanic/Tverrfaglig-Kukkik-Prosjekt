const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  reindeer: { type: mongoose.Schema.Types.ObjectId, ref: "Reindeer", required: true },
  fromOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Status: pending, newOwnerConfirmed, oldOwnerFinal, completed, declined
  status: { 
    type: String, 
    enum: ["pending", "newOwnerConfirmed", "oldOwnerFinal", "completed", "declined"], 
    default: "pending" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
