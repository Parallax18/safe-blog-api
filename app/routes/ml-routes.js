// api/routes.js

const express = require("express");
const mlController = require("../controllers/Ml.js");

const router = express.Router();

// Define API routes
router.post("/predict", mlController.predict);

module.exports = router;
