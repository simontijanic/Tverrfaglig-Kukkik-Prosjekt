const mongoose = require('mongoose');

const GrazingAreaSchema = new mongoose.Schema({
  primaryArea: { type: String, required: true },
  counties: [{ type: String, required: true }],
  associatedFlocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flokk" }]
}, { timestamps: true });

GrazingAreaSchema.index({ primaryArea: 'text', counties: 'text' });

module.exports = mongoose.model('BeiteArea', GrazingAreaSchema);
