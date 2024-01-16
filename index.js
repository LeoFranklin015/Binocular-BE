const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");

// Initialize express app
const app = express();

// Apply middleware
app.use(cors()); // Enables CORS
app.use(bodyParser.json()); // Parses incoming requests with JSON payloads

// MongoDB connection
// const MONGO_URI =
//   process.env.MONGO_URL ||
//   "mongodb+srv://LeoFranklin:leoleoleo@stackoverflow-clone.zckevmk.mongodb.net/?retryWrites=true&w=majority";

const MONGO_URI = process.env.MONGO_URL || "";

let db;

MongoClient.connect(MONGO_URI).then((client) => {
  db = client.db("binocular"); // Now db can be used to write direct MongoDB queries
  console.log("MongoDB connected successfully");
});

let currentSupplyValue = 10;
// Define a simple route
app.get("/", (req, res) => {
  res.send("Welcome to the Node.js Backend Application!");
});

app.get("/user/:walletAddress", async (req, res) => {
  console.log("GET /user/:walletAddress");
  try {
    const { walletAddress } = req.params;
    const user = await db.collection("users").findOne({ walletAddress });

    // if user not found then create a new user profile with the wallet address
    if (!user) {
      await db.collection("users").insertOne({
        walletAddress: walletAddress,
      });

      res
        .status(200)
        .json({ user: { walletAddress: walletAddress }, alreadyExists: false });
      return;
    }

    res.status(200).json({ user: user, alreadyExists: true });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

app.get("/profile/:walletAddress", async (req, res) => {
  console.log("GET /profile/:walletAddress");
  try {
    const { walletAddress } = req.params;
    const user = await db.collection("users").findOne({ walletAddress });

    // if user not found then create a new user profile with the wallet address
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user: user });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// api endpoint to update a users profile data based on the walletAddress
app.put("/profile/:walletAddress", async (req, res) => {
  console.log("PUT /profile/:walletAddress");
  try {
    const { walletAddress } = req.params;

    const user = await db.collection("users").findOne({ walletAddress });

    // if user not found then create a new user profile with the wallet address
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatedUser = await db.collection("users").findOneAndUpdate(
      { walletAddress },
      {
        $set: {
          ...req.body,
        },
      },
      { returnOriginal: true }
    );

    res.status(200).json({ user: updatedUser });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

app.get("/restaurants", async (req, res) => {
  console.log("GET /restaurants");
  try {
    // Iterate over each user document and get the restaurants array
    const users = await db.collection("users").find().toArray();
    console.log(users);

    const restaurants = [];

    users.forEach((user) => {
      if (user.restaurants && Array.isArray(user.restaurants)) {
        // Check if 'restaurants' is defined and an array
        restaurants.push(...user.restaurants);
      }
    });

    res.status(200).json({ restaurants: restaurants });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

app.get("/supply", (req, res) => {
  res.json({ value: currentSupplyValue });
});

// Route to update the supply value by adding one
app.post("/updateSupply", (req, res) => {
  updateSupplyValue(currentSupplyValue + 1);
  res.json({ success: true });
});

// Function to update the supply value
function updateSupplyValue(newValue) {
  currentSupplyValue = newValue;
  console.log("Updated supply value:", currentSupplyValue);

  // Add any additional logic or notifications here
}

const PORT = process.env.PORT || 3070;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
