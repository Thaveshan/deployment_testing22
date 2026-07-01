const mongoose = require("mongoose");
const { profileDb } = require("../config/db");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  dob: {
    type: Date,
    required: true
  }
});

module.exports = profileDb.model("User", userSchema);