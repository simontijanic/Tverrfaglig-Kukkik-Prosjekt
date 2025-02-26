const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transaksjonSchema = new Schema(
    {
        reinsdyrId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reindeer",
            required: true,
        },
        fraEierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fraFlokkId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Flokk",
            required: true,
        },
        tilEierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tilFlokkId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Flokk",
            default: null,
        },
        status: {
            type: String,
            enum: ["Venter", "GodkjentAvMottaker", "AvslåttAvMottaker", "GodkjentAvAvsender", "AvslåttAvAvsender", "Fullført", "Avbrutt"],
            default: "Venter",
        },
        meldingFraAvsender: {
            type: String,
            default: "",
        },
        meldingFraMottaker: {
            type: String,
            default: "",
        }
    },
    {
        timestamps: true,
    }
);

const Transaksjon = mongoose.model("Transaksjon", transaksjonSchema);
module.exports = Transaksjon;