const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const BeiteArea = require("../Models/beiteAreaModel");

const bcrypt = require("bcryptjs");

const serialUtil = require("../Utils/serial");
const { handleError } = require("../Utils/errorHandler"); 

exports.getLogin = (req, res) => {
  res.render("login", {messages: req.flash()});
};
exports.getRegister = (req, res) => {
  res.render("register"), {messages: req.flash()};
};

/**
 * Handles user login by verifying credentials and creating a session.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
exports.postLogin = async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check for missing email or password
    if (!email || !password) {
      req.flash("error", "Du mangler å fylle ut alle feltene")
      return res.redirect("/login");
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // If user is not found, redirect to login
    if (!user) {
      req.flash("error", "Bruker ble ikke funnet!")
      return res.redirect("/login");
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords do not match, redirect to login
    if (!isMatch) {
      req.flash("error", "Epost eller passord er feil!")
      return res.redirect("/login");
    }

    // Create a user session
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      uuid: user.uuid,
    };

    // Redirect to the home page
    return res.redirect("/");
  } catch (err) {
    // Log the error and send a server error response
    return handleError(res, "Serverfeil ved innlogging.");
  }
};
/**
 * Handles the registration of a new user.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
exports.postRegister = async (req, res) => {
  try {
    // Get the user data from the request body
    const { name, email, password, contactLanguage, phone } = req.body;

    // Check for missing fields
    if (!name || !email || !password || !contactLanguage || !phone) {
      req.flash("error", "Du mangler å fylle ut alle feltene")
      return res.redirect("/register");
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Bruker sin epost finnes allerede")
      return res.redirect("/register");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a UUID for the user
    const uuid = crypto.randomUUID();

    // Create the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contactLanguage,
      phone,
      uuid,
    });

    // Save the new user to the database
    await newUser.save();

    // Redirect the user to the login page
    return res.redirect("/login");
  } catch (err) {
    // Handle any errors
    return handleError(res, err);
  }
};

/**
 * Destroys the user session and clears the cookie.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
exports.postLogout = (req, res) => {
  // Destroy the user session
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      // Redirect to home page
      return res.redirect("/");
    }

    // Clear the cookie
    res.clearCookie("connect.sid");
    // Redirect to login page
    res.redirect("/login");
  });
};

/**
 * Renders the page for registering a new reindeer.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
exports.getReinsdyrRegister = async (req, res) => {
  try {
    const userId = req.session.user.id; // Get the ID of the current user
    const flokker = await Flokk.find({ owner: userId }); // Get all herds owned by the current user

    res.render("reindeer-registration", {
      title: "Registrer Reinsdyr",
      flokker, // Pass the herds to the template
      messages: req.flash(),
    });
  } catch (error) {
    return handleError(res, "Serverfeil under lasting av registreringsskjema.");
  }
};
/**
 * Registers a new reindeer under the authenticated user's herd.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
exports.postReinsdyrRegister = async (req, res) => {
  try {
    const { name, flokk, birthDate } = req.body;

    // Check if all required fields are provided
    if (!name || !flokk || !birthDate) {
      req.flash("error", "Du mangler å fylle ut alle feltene")
      return res.redirect("reindeer-registration");
    }

    const currentUserId = req.session.user.id;

    // Verify that the current user owns the specified herd
    const userFlokk = await Flokk.findOne({ _id: flokk, owner: currentUserId });
    if (!userFlokk) {
      req.flash("error", "Du har ikke tilgang til denne herden")
      return res.redirect("reindeer-registration");
    }

    // Count existing reindeers in the herd to generate a unique serial number
    const currentReindeerCount = await Reinsdyr.countDocuments({
      flokk: userFlokk._id,
    });
    const serialNumber = serialUtil.generateReindeerSerial(
      userFlokk.series,
      currentReindeerCount
    );

    // Create a new reindeer document
    const newReindeer = new Reinsdyr({
      serialNumber,
      name,
      flokk: userFlokk._id,
      birthDate,
    });

    // Save the new reindeer to the database
    await newReindeer.save();

    // Redirect to the home page upon successful registration
    return res.redirect("/");
  } catch (error) {
    return handleError(res, "Serverfeil under registrering av reinsdyr.");
  }
};
/**
 * POST /reindeer/delete/:id
 * Deletes a reindeer if the current user is the owner of the reindeer's herd.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {string} req.params.id - The ID of the reindeer to delete
 * @param {Object} req.session.user - The session user object
 * @param {string} req.session.user.id - The ID of the current user
 */
exports.postDeleteReinsdyr = async (req, res) => {
  try {
    const reindeerId = req.params.id;
    const userId = req.session.user.id;

    // Find the reindeer by ID and populate the herd (flokk) information
    const reindeer = await Reinsdyr.findById(reindeerId).populate("flokk");

    // Redirect if reindeer does not exist
    if (!reindeer) {
      return res.redirect("/reindeer-registration");
    }

    // Check if the current user is the owner of the herd
    if (String(reindeer.flokk.owner) !== String(userId)) {
      return res.redirect("/reindeer-registration");
    }

    // Delete the reindeer
    await Reinsdyr.findByIdAndDelete(reindeerId);

    return res.redirect("/reindeer-registration");
  } catch (error) {
    return handleError(res, "Feil ved sletting av reinsdyr.");
  }
};

/**
 * GET /flokk/create
 * Returns the page for creating a new herd.
 *
 * @return {Response} - The rendered page
 */
exports.getFlokkCreation = async (req, res) => {
  try {
    // Get all the grazing areas
    const beiteAreas = await BeiteArea.find();

    // Render the page with the grazing areas
    return res.render("create-flokk", {
      title: "Opprett Flokk",
      beiteAreas,
      messages: req.flash(),
    });
  } catch (err) {
    return handleError(res, "Feil ved lasting av beiteområder.");
  }
};

/**
 * POST /flokk/create
 * Create a new herd
 *
 * @param {Object} req.body - The request body
 * @param {string} req.body.flokkName - The name of the herd
 * @param {string} req.body.buemerkeName - The name of the earmark
 * @param {string} req.body.buemerkeImage - The image of the earmark
 * @param {string} req.body.beiteArea - The grazing area of the herd
 * @return {Response} - Redirects to the reindeer registration page
 */
exports.postFlokkRegister = async (req, res) => {
  try {
    const { flokkName, buemerkeName, buemerkeImage, beiteArea } = req.body;

    if (!flokkName || !buemerkeName || !buemerkeImage || !beiteArea) {
      req.flash("error", "Du mangler å fylle ut alle feltene");
      return res.redirect("/flokk/create");
    }

    // Get the user ID from the session
    const userId = req.session.user.id;

    // Get the user from the database
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      req.flash("error", "Bruker finnes ikke");
      return res.redirect("/flokk/create");
    }

    // Generate the herd series based on the user's UUID
    const ownerCode = user.uuid.substring(0, 4).toUpperCase();
    const currentHerdCount = await Flokk.countDocuments({ owner: userId });
    const herdSeries = serialUtil.generateHerdSeries(
      ownerCode,
      currentHerdCount
    );

    // Create a new herd
    const newFlokk = new Flokk({
      owner: userId,
      flokkName,
      series: herdSeries,
      buemerkeName,
      buemerkeImage,
      beiteArea,
    });

    // Save the herd to the database
    await newFlokk.save();

    // Add the herd to the grazing area
    if (beiteArea) {
      await BeiteArea.findByIdAndUpdate(beiteArea, {
        $push: { associatedFlocks: newFlokk._id },
      });
    }

    // Redirect to the reindeer registration page
    return res.redirect("/reindeer-registration");
  } catch (error) {
    console.error(error);
    return handleError(res, "Feil ved opprettelse av flokk.");
  }
};
