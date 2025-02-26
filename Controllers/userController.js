const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const BeiteArea = require("../Models/beiteAreaModel");

exports.getIndex = async (req, res) => {
  try {
    let flokker = [];
    if (req.session.user) {
      flokker = await Flokk.find({ owner: req.session.user.id });
    }
    res.render("index", { messages: [], flokker });
  } catch (err) {
    console.error(err);
    res.status(500).send("Serverfeil ved lasting av forside.");
  }
};

exports.getFAQ = (req, res) => {
  res.render("faq");
};
exports.getMap = async (req, res) => {
  try {
    const beiteAreas = await BeiteArea.find().populate("associatedFlocks");
    res.render("map", { beiteAreas });
  } catch (err) {
    console.error(err);
  }
};
exports.getDatabaseInfo = (req, res) => {
  res.render("database-info");
};

exports.getFlokk = async (req, res) => {
  try {
    const flokkId = req.params.id;
    const page = parseInt(req.query.page) || 1; // sidenummeret fea page
    const perPage = 10;

    const flokk = await Flokk.findById(flokkId).populate("beiteArea").populate("owner").exec();
    if (!flokk) {
      return res.redirect("/");
    }

    const totalReinsdyr = await Reinsdyr.countDocuments({ flokk: flokkId });

    const reinsdyr = await Reinsdyr.find({ flokk: flokkId })
      .skip((page - 1) * perPage) // jjj over reinsdyr fra tidligere sider
      .limit(perPage) 
      .exec();

    const beiteAreaDetails = flokk.beiteArea ? await BeiteArea.findById(flokk.beiteArea).exec() : null;

    res.render("flokk", {
      title: `Flokk: ${flokk.flokkName}`,
      flokk,
      reinsdyr,
      beiteArea: beiteAreaDetails,
      currentPage: page,
      totalPages: Math.ceil(totalReinsdyr / perPage),
      messages: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Serverfeil ved lasting av flokk");
  }
};


exports.getSearch = async (req, res) => {
  try {
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.json({ message: "Søkestreng er nødvendig", results: [] });
    }

    const regexQuery = new RegExp(searchQuery, 'i');

    const flokkResults = await Flokk.find({
      $or: [
        { flokkName: { $regex: regexQuery } },
        { buemerkeName: { $regex: regexQuery } }
      ]
    });

    const reindeerResults = await Reinsdyr.find({
      $or: [
        { name: { $regex: regexQuery } },
        { serialNumber: { $regex: regexQuery } }
      ]
    }).populate("flokk");

    const beiteAreaResults = await BeiteArea.find({
      $or: [
        { primaryArea: { $regex: regexQuery } },
        { counties: { $in: [regexQuery] } }
      ]
    });

    res.json({
      results: {
        flokk: flokkResults,
        reindeer: reindeerResults,
        beiteArea: beiteAreaResults,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Feil ved søk." });
  }
};
