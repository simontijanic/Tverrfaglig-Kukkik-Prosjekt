const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../Models/userModel");
const Flokk = require("../Models/flokkModel");
const Reinsdyr = require("../Models/reinsdyrModel");
const serialUtil = require("../Utils/serial");

function generateRandomPhoneNumber() {
  return `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function generateRandomDate(pastYears = 5) {
  const end = new Date();
  const start = new Date(end.getFullYear() - pastYears, end.getMonth(), end.getDate());
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

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

// Create flocks for users
async function createFlocks(users) {
  const flokk1 = await Flokk.create({
    owner: users[0]._id,
    flokkName: "Flokk A",
    series: "A001",
    buemerkeName: "Brand A",
    buemerkeImage: "https://example.com/brand-a.jpg",
  });

  const flokk2 = await Flokk.create({
    owner: users[1]._id,
    flokkName: "Flokk B",
    series: "B001",
    buemerkeName: "Brand B",
    buemerkeImage: "https://example.com/brand-b.jpg",
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
        name: `Reindeer ${crypto.randomUUID().split('-')[0]}`, // Using part of UUID for random name
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
