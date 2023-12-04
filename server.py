# server.py
from flask import Flask, request, jsonify
from joblib import load

app = Flask(__name__)
model = load('lr_model.joblib')

print(model)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    features = data['features']  # Adjust as per your model input requirements
    prediction = model.predict(features.reshape(1, -1))  # Make predictions
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(port=5000)
