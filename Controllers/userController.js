const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const BeiteArea = require("../Models/beiteAreaModel");

exports.getIndex = (req, res) => {
  const messages = req.flash();
  res.render("index", { messages });
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
    const messages = req.flash();
    const flokkId = req.params.id;

    const flokk = await Flokk.findById(flokkId).populate("beiteArea").exec();

    if (!flokk) {
      req.flash("error", "Flokk ikke funnet");
      return res.redirect("/");
    }

    const reinsdyr = await Reinsdyr.find({ flokk: flokkId }).exec();

    const beiteAreaDetails = flokk.beiteArea
      ? await BeiteArea.findById(flokk.beiteArea).exec()
      : null;

    res.render("flokk", {
      title: `Flokk: ${flokk.flokkName}`,
      flokk,
      reinsdyr,
      beiteArea: beiteAreaDetails,
      messages,
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

    const flokkResults = await Flokk.find({
      $text: { $search: searchQuery },
    });

    const reindeerResults = await Reinsdyr.find({
      $text: { $search: searchQuery },
    }).populate("flokk");

    const beiteAreaResults = await BeiteArea.find({
      $text: { $search: searchQuery },
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
