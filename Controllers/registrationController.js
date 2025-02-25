const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const BeiteArea = require("../Models/beiteAreaModel");

const bcrypt = require("bcryptjs");

const serialUtil = require("../Utils/serial");

exports.getLogin = (req, res) => {
  const messages = req.flash();
  res.render("login", { messages });
};
exports.getRegister = (req, res) => {
  const messages = req.flash();
  res.render("register", { messages });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash("error", "Vennligst fyll ut alle feltene");
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Bruker ikke funnet");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Passord eller epost er feil");
      return res.redirect("/login");
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      uuid: user.uuid,
    };

    req.flash("success", "Du har logget inn!");
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
      req.flash("error", "Vennligst fyll ut alle feltene");
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Brukeren finnes allerede");
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

    req.flash("success", "Du har registret deg inn! Vennligst logg inn.");

    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Serverfeil ved registrering.");
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      req.flash("error", "Feil under utlogging. Vennligst prøv igjen.");
      return res.redirect("/");
    }

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
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
    const { name, flokk, birthDate } = req.body;

    if (!name || !flokk || !birthDate) {
      req.flash("error", "Fyll inn alle feltene");
      return res.redirect("reindeer-registration");
    }
    const currentUserId = req.session.user.id;

    const userFlokk = await Flokk.findOne({ _id: flokk, owner: currentUserId });
    if (!userFlokk) {
      req.flash("error", "Fant ikke flokk");
      return res.redirect("reindeer-registration");
    }

    const currentReindeerCount = await Reinsdyr.countDocuments({
      flokk: userFlokk._id,
    });
    const serialNumber = serialUtil.generateReindeerSerial(
      userFlokk.series,
      currentReindeerCount
    );

    const newReindeer = new Reinsdyr({
      serialNumber,
      name,
      flokk: userFlokk._id,
      birthDate,
    });

    await newReindeer.save();

    req.flash("success", "Du registrert et reinsdyr!");

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Serverfeil under registrering av reinsdyr.");
  }
};
exports.postDeleteReinsdyr = async (req, res) => {
  try {
    const reindeerId = req.params.id;
    const userId = req.session.user.id;

    const reindeer = await Reinsdyr.findById(reindeerId).populate("flokk");

    if (!reindeer) {
      req.flash("error", "Reinsdyret ble ikke funnet.");
      return res.redirect("/reindeer-registration");
    }

    if (String(reindeer.flokk.owner) !== String(userId)) {
      req.flash(
        "error",
        "Du har ikke tillatelse til å slette dette reinsdyret."
      );
      return res.redirect("/reindeer-registration");
    }

    await Reinsdyr.findByIdAndDelete(reindeerId);

    req.flash("success", "Reinsdyret ble slettet!");
    return res.redirect("/reindeer-registration");
  } catch (error) {
    console.error(error);
    req.flash("error", "Noe gikk galt under sletting.");
    return res.redirect("/reindeer-registration");
  }
};

exports.getFlokkCreation = async (req, res) => {
  try {
    const beiteAreas = await BeiteArea.find();

    return res.render("create-flokk", {
      title: "Opprett Flokk",
      beiteAreas,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/reindeer-registration");
  }
};

exports.postFlokkRegister = async (req, res) => {
  try {
    const { flokkName, buemerkeName, buemerkeImage, beiteArea } = req.body;

    if (!flokkName || !buemerkeName || !buemerkeImage || !beiteArea) {
      req.flash("error", "Fyll inn alle feltene");
      return res.redirect("/flokk/create");
    }
    const userId = req.session.user.id;

    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "Fant ikke brukerdata");
      return res.redirect("/flokk/create");
    }

    const ownerCode = user.uuid.substring(0, 4).toUpperCase();
    const currentHerdCount = await Flokk.countDocuments({ owner: userId });
    const herdSeries = serialUtil.generateHerdSeries(
      ownerCode,
      currentHerdCount
    );

    const newFlokk = new Flokk({
      owner: userId,
      flokkName,
      series: herdSeries,
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

    req.flash("success", "Du har registrert en ny flokk!");

    return res.redirect("/reindeer-registration");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Feil ved opprettelse av flokk.");
  }
};
