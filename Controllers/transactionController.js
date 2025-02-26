const Reinsdyr = require("../Models/reinsdyrModel");
const Flokk = require("../Models/flokkModel");
const User = require("../Models/userModel");
const Transaksjon = require("../Models/transactionModel");

exports.getTransaksjoner = (req, res) => {
    res.render("transaksjoner");
}