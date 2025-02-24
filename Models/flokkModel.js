const mongoose = require("mongoose")

const flokkSchema = mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flokkName: { type: String, required: true },
    series: { type: String, required: true },
    buemerkeName: { type: String, required: true },
    buemerkeImage: { type: String },
    beiteArea: { type: mongoose.Schema.Types.ObjectId, ref: "BeiteArea" }
}, { timestamps: true })

flokkSchema.index({ flokkName: 'text', series: 'text', buemerkeName: 'text' });

module.exports = mongoose.model('Flokk', flokkSchema);
