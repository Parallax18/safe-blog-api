const { spawn } = require("child_process");

// API endpoint to make predictions
exports.predict = async (req, res) => {
  try {
    const { text } = req.body;

    // Call the Python script for prediction
    const predictScript = spawn("/usr/bin/python3", [
      "app/ml/predict.py",
      text,
    ]);

    predictScript.stdout.on("data", (data) => {
      const predictionResult = JSON.parse(data.toString());
      res.json({ prediction: predictionResult });
      //   flag comment and user here
    });

    predictScript.stderr.on("data", (data) => {
      console.error(`Error in Python script: ${data}`);
    });

    predictScript.on("close", (code) => {
      console.log(`Prediction process exited with code ${code}`);
    });

    // Capture errors in the child process
    predictScript.on("error", (err) => {
      console.error(`Error in child process: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
