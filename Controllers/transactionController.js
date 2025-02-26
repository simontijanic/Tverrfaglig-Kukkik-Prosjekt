const Transaction = require('../Models/transactionModel');
const Reindeer = require('../Models/reinsdyrModel');
const User = require('../Models/userModel');
const Flokk = require('../Models/flokkModel');

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/login");
    }
    const incomingTransactions = await Transaction.find({ toOwner: user._id }).populate('reindeer fromOwner');
    const outgoingTransactions = await Transaction.find({ fromOwner: user._id }).populate('reindeer toOwner');
    const flokkList = await Flokk.find({ owner: user._id });  // Hent flokkene som tilhører den innloggede brukeren

    res.render('transactions', {
      incomingTransactions,
      outgoingTransactions,
      flokkList,  // Send flokkene til visningen
      title: "Transaksjoner"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Feil ved henting av transaksjoner.");
  }
};

