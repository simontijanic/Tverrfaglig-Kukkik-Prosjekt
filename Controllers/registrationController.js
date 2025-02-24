const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const BeiteArea = require("../Models/beiteAreaModel");

const bcrypt = require("bcryptjs");

exports.getLogin = (req, res) => {
  const messages = req.flash();
  res.render("login", {messages});
};
exports.getRegister = (req, res) => {
  const messages = req.flash();
  res.render("register", { messages });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Vennligst fyll ut alle feltene');
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Bruker ikke funnet');
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Passord eller epost er feil');
      return res.redirect("/login");
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    req.flash('success', 'Du har logget inn!');
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Serverfeil ved innlogging.");
  }
};
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, contactLanguage, phone } = req.body;
    if (!name || !email || !password || !contactLanguage || !phone) {
      req.flash('error', 'Vennligst fyll ut alle feltene');
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Brukeren finnes allerede');
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const uuid = crypto.randomUUID();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contactLanguage,
      phone,
      uuid,
    });

    await newUser.save();

    req.flash('success', 'Du har logget inn!');

    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Serverfeil ved registrering.");
  }
};

exports.getReinsdyrRegister = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const flokker = await Flokk.find({ owner: userId });
    const messages = req.flash();

    res.render("reindeer-registration", {
      title: "Registrer Reinsdyr",
      flokker,
      messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Serverfeil under lasting av registreringsskjema.");
  }
};
exports.postReinsdyrRegister = async (req, res) => {
  try {
    const { serialNumber, name, flokk, birthDate } = req.body;

    if (!serialNumber || !name || !flokk || !birthDate) {
      req.flash('error', 'Fyll inn alle feltene');
      return res.redirect("reindeer-registration");
    }
    const currentUserId = req.session.user.id;

    const userFlokk = await Flokk.findOne({ _id: flokk, owner: currentUserId });
    if (!userFlokk) {
      req.flash('error', 'Fant ikke flokk');
      return res.redirect("reindeer-registration");
    }

    const newReindeer = new Reinsdyr({
      serialNumber,
      name,
      flokk: userFlokk._id,
      birthDate,
    });

    await newReindeer.save();

    req.flash('success', 'Du registrert et reinsdyr!');

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Serverfeil under registrering av reinsdyr.");
  }
};

exports.getFlokk = async (req, res) => {
  const messages = req.flash();
  const beiteAreas = await BeiteArea.find();
  res.render("create-flokk", {
    title: "Opprett Flokk",
    messages,
    beiteAreas,
  });
};

exports.postFlokkRegister = async (req, res) => {
  try {
    const { flokkName, series, buemerkeName, buemerkeImage, beiteArea } =
      req.body;

    if (
      !flokkName ||
      !series ||
      !buemerkeName ||
      !buemerkeImage ||
      !beiteArea
    ) {
      req.flash('error', 'Fyll inn alle feltene');
      return res.redirect("/flokk/create");
    }
    const userId = req.session.user.id;

    const newFlokk = new Flokk({
      owner: userId,
      flokkName,
      series,
      buemerkeName,
      buemerkeImage,
      beiteArea,
    });

    await newFlokk.save();

    if (beiteArea) {
      await BeiteArea.findByIdAndUpdate(beiteArea, {
        $push: { associatedFlocks: newFlokk._id },
      });
    }

    req.flash('success', 'Du har registrert en ny flokk!');

    return res.redirect("/reindeer-registration");
  } catch (error) {
    console.error(error);
    res.status(500).send("Feil ved opprettelse av flokk.");
  }
};
