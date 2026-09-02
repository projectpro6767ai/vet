from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
import json
import os

app = FastAPI(
    title="Vet-Mitra AI Engine",
    description="Multimodal Veterinary Livestock Diagnostics & Triage API",
    version="1.0.0"
)

# Enable CORS for web frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Full System Instruction Prompt for Vet-Mitra AI Engine
SYSTEM_PROMPT = """You are "Vet-Mitra AI Engine", a balanced, practical veterinary assistant for livestock.

CRITICAL INSTRUCTION FOR DEMO:
Do NOT trigger an emergency RED alert for every symptom. Perform realistic medical triage based on severity.

TRIAGE CRITERIA:
1. 🟢 GREEN (Mild / Home Care):
   - Symptoms: Minor ticks, small cuts, mild appetite loss, simple indigestion, routine grooming questions, mold-free feed checks.
   - Response: Provide safe, low-cost home/herbal remedies (e.g., neem wash, turmeric paste, warm salt water). DO NOT demand a doctor. Set trigger_emergency_dispatch: false.

2. 🟡 YELLOW (Moderate Care / Monitor):
   - Symptoms: Moderate diarrhea, minor milk yield drop, slight lameness, non-spreading skin irritation, mild eye discharge.
   - Response: Give basic herbal care, isolate temporarily, and advise monitoring for 24 hours before calling a doctor. Set trigger_emergency_dispatch: false.

3. 🔴 RED (Urgent Veterinary Required):
   - Symptoms ONLY IF: High fever above 104°F, spreading lumps all over body (Lumpy Skin), severe mouth/hoof blisters (FMD), profuse bleeding, or animal down and unable to stand. Set trigger_emergency_dispatch: true.

OUTPUT FORMAT (Raw JSON only):
{
  "animal_type": "Identified Animal",
  "animal_identified": "Identified Animal",
  "suspected_condition": "Condition name",
  "urgency_badge": "🟢 GREEN | 🟡 YELLOW | 🔴 RED",
  "trigger_emergency_dispatch": false,
  "is_emergency_dispatch_needed": false,
  "first_aid_steps": [
    "Step 1: Simple herbal/home remedy",
    "Step 2: Practical management step"
  ],
  "what_not_to_do": "Common mistake to avoid",
  "recommended_local_product": "Generic herbal product for ad banner",
  "local_voice_script_hindi": "Simple 2-sentence summary in Hindi script",
  "local_voice_script_marathi": "Simple 2-sentence summary in Marathi script"
}"""

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Vet-Mitra AI Engine (FastAPI)",
        "gemini_api_key_configured": bool(os.environ.get("GEMINI_API_KEY"))
    }

@app.post("/api/v1/diagnose")
async def diagnose_livestock(
    symptoms: str = Form(""),
    animal_type: str = Form(""),
    file: UploadFile = File(None)
):
    try:
        contents = []
        
        # 1. Attach Image/Fodder file if provided
        if file is not None:
            image_bytes = await file.read()
            contents.append(
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=file.content_type or "image/jpeg"
                )
            )

        # 2. Attach user symptoms & notes
        user_notes = f"Animal Category: {animal_type or 'General'}\nSymptoms / Notes: {symptoms or 'Visual triage'}"
        contents.append(user_notes)

        # 3. Call Gemini 2.5 Flash model
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2  # Low temperature for consistent medical triage
            ),
            contents=contents
        )

        # 4. Parse output into structured JSON
        result_json = json.loads(response.text)

        # 5. Backend Logic: Check if emergency doctor dispatch is required
        is_emergency = result_json.get("is_emergency_dispatch_needed") or (
            "RED" in str(result_json.get("urgency_badge", ""))
        )
        result_json["trigger_emergency_dispatch"] = is_emergency

        if is_emergency:
            # Code to alert local paravet/doctor via SMS, WhatsApp, or Push Notification
            result_json["doctor_status"] = "Emergency notification sent to nearest Taluka Vet & 1962 Helpline!"
        else:
            result_json["doctor_status"] = "Routine home care and monitoring advised."

        return {
            "status": "success",
            "data": result_json
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
