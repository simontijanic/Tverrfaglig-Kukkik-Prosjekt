const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const GrazingArea = require("../Models/beiteAreaModel");
const serialUtil = require("../Utils/serial");

function generateRandomPhoneNumber() {
  return `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function generateRandomDate(pastYears = 5) {
  const end = new Date();
  const start = new Date(end.getFullYear() - pastYears, end.getMonth(), end.getDate());
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Beiteområder med tilhørende fylker
const grazingAreas = [
  { primaryArea: "Sør", counties: ["Trøndelag", "Innlandet"] },
  { primaryArea: "Ume", counties: ["Nordland"] },
  { primaryArea: "Pite", counties: ["Nordland"] },
  { primaryArea: "Lule", counties: ["Nordland"] },
  { primaryArea: "Nord", counties: ["Troms og Finnmark"] },
  { primaryArea: "Enare", counties: ["Troms og Finnmark"] },
  { primaryArea: "Skolt", counties: ["Troms og Finnmark"] },
  { primaryArea: "Akkala", counties: ["Troms og Finnmark"] },
  { primaryArea: "Kildin", counties: ["Troms og Finnmark"] },
  { primaryArea: "Ter", counties: ["Troms og Finnmark"] },
];

async function createUsers() {
  const hashedPassword1 = await bcrypt.hash("password123", 10);
  const hashedPassword2 = await bcrypt.hash("password123", 10);

  const user1 = await User.create({
    name: "John Doe",
    uuid: crypto.randomUUID(),
    email: "john.doe@example.com",
    password: hashedPassword1,
    contactLanguage: "norsk",
    phone: generateRandomPhoneNumber(),
  });

  const user2 = await User.create({
    name: "Jane Smith",
    uuid: crypto.randomUUID(),
    email: "jane.smith@example.com",
    password: hashedPassword2,
    contactLanguage: "engelsk",
    phone: generateRandomPhoneNumber(),
  });

  return [user1, user2];
}

// Seed the grazing areas (beiteområder)
async function seedGrazingAreas() {
  try {
    // Remove existing grazing areas
    await GrazingArea.deleteMany({});
    console.log("Eksisterende beiteområder fjernet");

    // Add new grazing areas
    await GrazingArea.insertMany(grazingAreas);
    console.log("Nye beiteområder lagt til");
  } catch (error) {
    console.error("Feil under seeding av beiteområder:", error);
  }
}

// Create flocks for users and associate them with grazing areas
async function createFlocks(users) {
  const beiteAreas = await GrazingArea.find({});

  // Ensure we have enough BeiteAreas to assign
  if (beiteAreas.length < 2) {
    console.log("Not enough BeiteAreas to assign to flocks.");
    return [];
  }

  const flokk1 = await Flokk.create({
    owner: users[0]._id,
    flokkName: "Flokk A",
    series: "A001",
    buemerkeName: "Brand A",
    buemerkeImage: "https://example.com/brand-a.jpg",
    beiteArea: beiteAreas[0]._id, // Link BeiteArea 1 to Flokk 1
  });

  const flokk2 = await Flokk.create({
    owner: users[1]._id,
    flokkName: "Flokk B",
    series: "B001",
    buemerkeName: "Brand B",
    buemerkeImage: "https://example.com/brand-b.jpg",
    beiteArea: beiteAreas[1]._id, // Link BeiteArea 2 to Flokk 2
  });

  // Update the associatedFlocks in the BeiteAreas
  await GrazingArea.findByIdAndUpdate(beiteAreas[0]._id, {
    $push: { associatedFlocks: flokk1._id },
  });

  await GrazingArea.findByIdAndUpdate(beiteAreas[1]._id, {
    $push: { associatedFlocks: flokk2._id },
  });

  return [flokk1, flokk2];
}

// Create reindeer for flocks
async function createReindeer(flocks) {
  const reindeerData = [];

  for (let i = 0; i < flocks.length; i++) {
    const currentReindeerCount = await Reinsdyr.countDocuments({ flokk: flocks[i]._id });

    for (let j = 0; j < 20; j++) {
      const serialNumber = serialUtil.generateReindeerSerial(flocks[i].series, currentReindeerCount + j);
      const reindeer = await Reinsdyr.create({
        serialNumber: serialNumber,
        name: `Reindeer ${crypto.randomUUID().split("-")[0]}`, // Using part of UUID for random name
        flokk: flocks[i]._id,
        birthDate: generateRandomDate(),
        transferStatus: "none",
      });
      reindeerData.push(reindeer);
    }
  }

  return reindeerData;
}

// Run the mock data creation process
async function createMockData() {
  try {
    await User.deleteMany({}); // Delete all previous users
    await Flokk.deleteMany({}); // Delete all previous flocks
    await Reinsdyr.deleteMany({}); // Delete all previous reindeer
    await GrazingArea.deleteMany({}); // Delete all previous grazing areas

    // Seed BeiteAreas (Grazing Areas)
    await seedGrazingAreas();

    const users = await createUsers();
    const flocks = await createFlocks(users);
    const reindeer = await createReindeer(flocks);

    console.log("Mock data created successfully!");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error creating mock data:", error);
    mongoose.disconnect();
  }
}

module.exports = createMockData;
