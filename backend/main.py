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
    res = requests.get(f"{PATIENT_AGENT}/wallet/did/public")
    return res.json()

@app.get("/patient/connections")
def patient_connections():
    res = requests.get(f"{PATIENT_AGENT}/connections")
    return res.json()