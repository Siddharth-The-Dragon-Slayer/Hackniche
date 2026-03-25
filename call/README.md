# Call Backend - Voice Call Handler

This Python Flask backend handles incoming voice calls using Twilio and transcribes them using OpenAI Whisper.

## Features
- Receives incoming calls via Twilio
- Records conversations
- Transcribes audio to text using Whisper (local, free)
- Generates simple summaries
- Uses ngrok for public URL tunneling

## Setup Instructions

### 1. Install Python Dependencies

```cmd
pip install -r requirements.txt
```

### 2. Configure Twilio (Optional - only if you want call features)

You'll need a Twilio account for phone call handling:
1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get your phone number
3. Update `MANAGER_PHONE` in `main.py` with your number

### 3. Run the Flask Server

```cmd
python main.py
```

The server will start on `http://localhost:5000`

### 4. Expose with ngrok (for Twilio webhooks)

In a separate terminal:

```cmd
ngrok.exe http 5000
```

Copy the ngrok URL and configure it in your Twilio console as the webhook URL.

## Endpoints

- `GET /` - Health check
- `POST /incoming-call` - Twilio webhook for incoming calls
- `POST /recording-callback` - Receives call recordings

## Notes

- Whisper model downloads automatically on first run (~140MB for base model)
- The backend is optional - the main Next.js app works independently
- Only needed if you want voice call handling features
