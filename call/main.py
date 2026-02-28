from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse, Dial
import requests
import whisper
import os

app = Flask(__name__)

# ============ CONFIG ============
MANAGER_PHONE = "+919082558834"

# Load Whisper model once (very important)
model = whisper.load_model("base")  # small, medium, large also available

# ============ STEP 1: Incoming Call ============

@app.route("/incoming-call", methods=["POST"])
def incoming_call():
    print("Incoming call from:", request.form.get("From"))
    response = VoiceResponse()
    response.say("Hello. Connecting your call now.", voice="alice")

    callback_url = request.url_root.rstrip("/") + "/recording-callback"
    dial = Dial(
        MANAGER_PHONE,
        record="record-from-answer",
        recording_status_callback=callback_url
    )

    response.append(dial)
    return str(response), 200, {'Content-Type': 'text/xml'}

# ============ STEP 2: Recording Callback ============
@app.route("/recording-callback", methods=["POST"])
def recording_callback():
    recording_url = request.form.get("RecordingUrl")
    recording_url = recording_url + ".mp3"

    print("Recording URL:", recording_url)

    # Download recording
    audio_data = requests.get(recording_url).content

    file_path = "call_recording.mp3"
    with open(file_path, "wb") as f:
        f.write(audio_data)

    # ============ STEP 3: Speech to Text (FREE LOCAL WHISPER) ============
    transcript = speech_to_text(file_path)
    print("Transcript:", transcript)

    # ============ STEP 4: Simple Summary (Basic Python) ============
    summary = simple_summary(transcript)
    print("\n===== SUMMARY =====")
    print(summary)

    return "OK", 200

# ============ Speech To Text (Local Whisper) ============
def speech_to_text(audio_file):
    result = model.transcribe(audio_file)
    return result["text"]

# ============ Simple Summary Without GPT ============
def simple_summary(text):
    # basic rule-based summary (free)
    sentences = text.split(".")
    return ".".join(sentences[:3])  # first 3 sentences as summary


@app.route("/")
def home():
    return "Flask server is running 🚀"

    
# ============ Run ============
if __name__ == "__main__":
    app.run(port=5000)