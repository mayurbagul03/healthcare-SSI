from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="Healthcare SSI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCTOR_AGENT     = "http://localhost:8001"
UNIVERSITY_AGENT = "http://localhost:8003"
PATIENT_AGENT    = "http://localhost:8005"

@app.get("/")
def health_check():
    return {"status": "Backend is running!"}

@app.get("/doctor/did")
def get_doctor_did():
    res = requests.get(f"{DOCTOR_AGENT}/wallet/did/public")
    return res.json()

@app.post("/doctor/create-invitation")
def doctor_create_invitation():
    res = requests.post(f"{DOCTOR_AGENT}/connections/create-invitation",
                        json={"alias": "Doctor-to-University"})
    return res.json()

@app.get("/doctor/connections")
def doctor_connections():
    res = requests.get(f"{DOCTOR_AGENT}/connections")
    return res.json()

@app.get("/university/did")
def get_university_did():
    res = requests.get(f"{UNIVERSITY_AGENT}/wallet/did/public")
    return res.json()

@app.get("/university/connections")
def university_connections():
    res = requests.get(f"{UNIVERSITY_AGENT}/connections")
    return res.json()

@app.get("/patient/did")
def get_patient_did():
    try:
        r = requests.get(f"{PATIENT_AGENT}/wallet/did/public", timeout=5)
        return r.json()
    except Exception as e:
        return {"error": f"Patient agent not available: {str(e)}"}

@app.get("/patient/connections")
def get_patient_connections():
    try:
        r = requests.get(f"{PATIENT_AGENT}/connections", timeout=5)
        return r.json()
    except Exception as e:
        return {"error": f"Patient agent not available: {str(e)}"}

@app.post("/university/receive-invitation")
def university_receive_invitation(invitation: dict):
    res = requests.post(
        f"{UNIVERSITY_AGENT}/connections/receive-invitation",
        json=invitation
    )
    return res.json()

@app.post("/university/accept-invitation/{connection_id}")
def university_accept_invitation(connection_id: str):
    res = requests.post(
        f"{UNIVERSITY_AGENT}/connections/{connection_id}/accept-invitation"
    )
    return res.json()

@app.post("/doctor/accept-request/{connection_id}")
def doctor_accept_request(connection_id: str):
    res = requests.post(
        f"{DOCTOR_AGENT}/connections/{connection_id}/accept-request"
    )
    return res.json()