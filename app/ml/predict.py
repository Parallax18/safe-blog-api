import os
import sys
import joblib
import pickle
import json
from sklearn.feature_extraction.text import TfidfVectorizer

# Set the working directory to the script's directory
script_dir = os.path.dirname(os.path.realpath(__file__))
os.chdir(script_dir)

def load_model():
    # Load the machine learning model and vectorizer
    model = joblib.load('./lr_model.joblib')
    vectorizer = pickle.load(open('./vectorizer.pickle', 'rb'))
    return model, vectorizer

def preprocess_input(input_text, vectorizer):
    # Preprocess input text using the vectorizer
    X = vectorizer.transform([input_text])
    return X

def make_prediction(model, X):
    # Make predictions using the loaded model
    prediction = model.predict(X)
    return prediction.tolist()

if __name__ == "__main__":
    try:
        input_text = sys.argv[1]

        # Load model and vectorizer
        model, vectorizer = load_model()

        # Preprocess input
        X = preprocess_input(input_text, vectorizer)

        # Make prediction
        prediction_result = make_prediction(model, X)

        # Print the result as JSON to be captured by Node.js
        print(json.dumps({"result": prediction_result}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
