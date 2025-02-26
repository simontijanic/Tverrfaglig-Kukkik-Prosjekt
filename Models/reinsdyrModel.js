const mongoose = require("mongoose");

const reinsdyrSchema = mongoose.Schema({
    serialNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    flokk: { type: mongoose.Schema.Types.ObjectId, ref: "Flokk", required: true },
    birthDate: { type: Date, required: true },
    transferStatus: { 
      type: String, 
      enum: ["none", "pending"], 
      default: "none" 
    },
    pendingTransfer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    },
  },
  { timestamps: true }
);

reinsdyrSchema.index({ name: 'text', serialNumber: 'text' });

module.exports = mongoose.model('Reindeer', reinsdyrSchema);
