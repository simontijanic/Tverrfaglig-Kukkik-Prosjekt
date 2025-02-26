const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const BeiteArea = require("../Models/beiteAreaModel");

const { handleError } = require("../Utils/errorHandler"); 

/**
 * GET /
 * Render the index page with a list of associated flocks for the logged in user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @return {Response} - The rendered HTML page.
 */
exports.getIndex = async (req, res) => {
  try {
    // Get the list of associated flocks for the logged in user
    let flokker = [];
    if (req.session.user) {
      flokker = await Flokk.find({ owner: req.session.user.id });
    }
    // Render the index page with the list of flocks
    res.render("index", { flokker });
  } catch (err) {
    // Handle any errors that may occur
    return handleError(res, "Feil ved   laste inn side.");
  }
};

exports.getFAQ = async (req, res) => {
  res.render("faq");
};

/**
 * GET /map
 * Retrieve all grazing areas (beiteomr der) and render the map page with a list of associated flocks.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
exports.getMap = async (req, res) => {
  try {
    // Retrieve all grazing areas, and populate their associated flocks.
    const beiteAreas = await BeiteArea.find().populate("associatedFlocks");
    // Render the map page with the list of grazing areas and associated flocks.
    res.render("map", { beiteAreas });
  } catch (err) {
    // Handle any errors that occur, and return an error message.
    return handleError(res, "Feil ved  laste inn side.");
  }
};
exports.getDatabaseInfo = (req, res) => {
  res.render("database-info");
};

/**
 * GET /flokk/:id
 * Retrieve and render a specific herd (flokk) and its associated reindeer (reinsdyr) with pagination.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.params.id - The ID of the herd (flokk) to retrieve.
 * @param {string} req.query.page - The page number for pagination (optional).
 * @param {Object} res - The HTTP response object.
 */
exports.getFlokk = async (req, res) => {
  try {
    const flokkId = req.params.id;
    const page = parseInt(req.query.page) || 1; // The current page number, default to 1
    const perPage = 10; // Number of reindeer to display per page

    // Fetch the flokk by ID and populate related fields
    const flokk = await Flokk.findById(flokkId).populate("beiteArea").populate("owner").exec();
    if (!flokk) {
      return res.redirect("/");
    }

    // Count the total number of reindeer in the flokk
    const totalReinsdyr = await Reinsdyr.countDocuments({ flokk: flokkId });

    // Fetch reindeer for the current page
    const reinsdyr = await Reinsdyr.find({ flokk: flokkId })
      .skip((page - 1) * perPage) // Skip past reindeer on previous pages
      .limit(perPage) 
      .exec();

    // Fetch details of the associated beite area, if available
    const beiteAreaDetails = flokk.beiteArea ? await BeiteArea.findById(flokk.beiteArea).exec() : null;

    // Render the flokk page with the retrieved data
    res.render("flokk", {
      title: `Flokk: ${flokk.flokkName}`,
      flokk,
      reinsdyr,
      beiteArea: beiteAreaDetails,
      currentPage: page,
      totalPages: Math.ceil(totalReinsdyr / perPage),
    });
  } catch (err) {
    return handleError(res, "Feil vedå laste inn side og reinsdyr.");
  }
};


/**
 * GET /search
 * Perform a search query across flocks, reindeer, and grazing areas based on the search string provided in the query parameters.
 *
 * @param {Object} req - The request object
 * @param {string} req.query.q - The search string
 * @param {Object} res - The response object
 * @return {JSON} - JSON response with search results or error message
 */
exports.getSearch = async (req, res) => {
  try {
    const searchQuery = req.query.q;

    // Check if the search query is provided
    if (!searchQuery) {
      return res.json({ message: "Søkestreng er nødvendig", results: [] });
    }

    // Create a case-insensitive regular expression based on the search query
    const regexQuery = new RegExp(searchQuery, 'i');

    // Search for flocks matching the search query in flokkName or buemerkeName
    const flokkResults = await Flokk.find({
      $or: [
        { flokkName: { $regex: regexQuery } },
        { buemerkeName: { $regex: regexQuery } }
      ]
    });

    // Search for reindeer matching the search query in name or serialNumber
    const reindeerResults = await Reinsdyr.find({
      $or: [
        { name: { $regex: regexQuery } },
        { serialNumber: { $regex: regexQuery } }
      ]
    }).populate("flokk");

    // Search for grazing areas matching the search query in primaryArea or counties
    const beiteAreaResults = await BeiteArea.find({
      $or: [
        { primaryArea: { $regex: regexQuery } },
        { counties: { $in: [regexQuery] } }
      ]
    });

    // Respond with the search results
    res.json({
      results: {
        flokk: flokkResults,
        reindeer: reindeerResults,
        beiteArea: beiteAreaResults,
      },
    });
  } catch (error) {
    // Handle any errors that occur during the search
    return handleError(res, "Feil ved søk.");
  }
};
