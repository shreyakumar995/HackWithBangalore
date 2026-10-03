import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


@app.post("/analyze")
def analyze():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON."}), 400

    job_text = data.get("job_text")
    if not isinstance(job_text, str) or not job_text.strip():
        return jsonify({"error": "job_text is required and must be a non-empty string."}), 400

    return jsonify(
        {
            "status": "placeholder",
            "message": "Scoring logic is not implemented yet.",
            "job_text_length": len(job_text.strip()),
            "score": None,
            "verdict": None,
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
