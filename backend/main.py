from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import json

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
    try:
        res = requests.get(f"{DOCTOR_AGENT}/wallet/did/public", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/doctor/create-invitation")
def doctor_create_invitation():
    try:
        res = requests.post(f"{DOCTOR_AGENT}/connections/create-invitation",
            params={"auto_accept": "true"}, json={"alias": "Doctor-Invitation"}, timeout=5)
        data = res.json()
        inv_str = json.dumps(data).replace("host.docker.internal", "localhost")
        return json.loads(inv_str)
    except Exception as e:
        return {"error": str(e)}

@app.get("/doctor/connections")
def doctor_connections():
    try:
        res = requests.get(f"{DOCTOR_AGENT}/connections", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/doctor/accept-request/{connection_id}")
def doctor_accept_request(connection_id: str):
    try:
        res = requests.post(f"{DOCTOR_AGENT}/connections/{connection_id}/accept-request", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/doctor/accept-all-pending")
def doctor_accept_all_pending():
    try:
        res = requests.get(f"{DOCTOR_AGENT}/connections", timeout=5)
        conns = res.json().get("results", [])
        accepted = []
        for c in conns:
            if c["state"] == "request":
                r = requests.post(f"{DOCTOR_AGENT}/connections/{c['connection_id']}/accept-request", timeout=5)
                accepted.append({"id": c["connection_id"][:8], "result": r.json().get("state")})
        return {"accepted": accepted, "count": len(accepted)}
    except Exception as e:
        return {"error": str(e)}

@app.get("/doctor/credentials")
def doctor_credentials():
    try:
        res = requests.get(f"{DOCTOR_AGENT}/credentials", timeout=10)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/doctor/credential-offers")
def doctor_credential_offers():
    try:
        res = requests.get(f"{DOCTOR_AGENT}/issue-credential/records", timeout=10)
        return {"credentials": res.json().get("results", [])}
    except Exception as e:
        return {"error": str(e)}

@app.post("/doctor/accept-credential/{cred_exchange_id}")
def doctor_accept_credential(cred_exchange_id: str):
    try:
        res = requests.post(f"{DOCTOR_AGENT}/issue-credential/records/{cred_exchange_id}/send-request", timeout=30)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/doctor/proof-requests")
def doctor_proof_requests():
    try:
        res = requests.get(f"{DOCTOR_AGENT}/present-proof/records", timeout=10)
        records = res.json().get("results", [])
        pending = [r for r in records if r.get("state") == "request_received"]
        return {"proof_requests": pending, "all": records}
    except Exception as e:
        return {"error": str(e)}

@app.post("/doctor/send-presentation/{pres_ex_id}")
def doctor_send_presentation(pres_ex_id: str):
    try:
        creds = requests.get(f"{DOCTOR_AGENT}/present-proof/records/{pres_ex_id}/credentials", timeout=10).json()
        if not creds:
            return {"error": "No matching credentials found in Doctor wallet"}
        referents = {}
        for item in creds:
            for ref in item.get("presentation_referents", []):
                referents[ref] = {"cred_id": item["cred_info"]["referent"], "revealed": True}
        res = requests.post(f"{DOCTOR_AGENT}/present-proof/records/{pres_ex_id}/send-presentation",
            json={"requested_attributes": referents, "requested_predicates": {}, "self_attested_attributes": {}}, timeout=30)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/university/did")
def get_university_did():
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/wallet/did/public", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/university/connections")
def university_connections():
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/connections", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/receive-invitation")
def university_receive_invitation(invitation: dict):
    try:
        inv_str = json.dumps(invitation).replace("host.docker.internal", "localhost")
        res = requests.post(f"{UNIVERSITY_AGENT}/connections/receive-invitation",
            params={"auto_accept": "true"}, json=json.loads(inv_str), timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/accept-invitation/{connection_id}")
def university_accept_invitation(connection_id: str):
    try:
        res = requests.post(f"{UNIVERSITY_AGENT}/connections/{connection_id}/accept-invitation", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/accept-all-pending")
def university_accept_all_pending():
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/connections", timeout=5)
        conns = res.json().get("results", [])
        accepted = []
        for c in conns:
            if c["state"] == "request":
                r = requests.post(f"{UNIVERSITY_AGENT}/connections/{c['connection_id']}/accept-request", timeout=5)
                accepted.append({"id": c["connection_id"][:8], "result": r.json().get("state")})
        return {"accepted": accepted, "count": len(accepted)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/publish-schema")
def publish_schema(req: dict):
    try:
        res = requests.post(f"{UNIVERSITY_AGENT}/schemas", json={
            "schema_name": req.get("schema_name", "medical_credential"),
            "schema_version": req.get("schema_version", "1.0"),
            "attributes": req.get("attributes", ["name","degree","institution","graduation_year","license_number","doctor_did"])
        }, timeout=30)
        data = res.json()
        return {"schema_id": data.get("schema_id"), "schema": data}
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/create-cred-def")
def create_cred_def(schema_id: str):
    try:
        res = requests.post(f"{UNIVERSITY_AGENT}/credential-definitions", json={
            "schema_id": schema_id, "support_revocation": False, "tag": "default"
        }, timeout=60)
        data = res.json()
        return {"credential_definition_id": data.get("credential_definition_id"), "data": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/university/schemas")
def get_schemas():
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/schemas/created", timeout=10)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/university/cred-defs")
def get_cred_defs():
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/credential-definitions/created", timeout=10)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/issue-credential")
def issue_credential(req: dict):
    try:
        payload = {
            "connection_id": req["connection_id"],
            "cred_def_id": req["cred_def_id"],
            "credential_preview": {
                "@type": "issue-credential/1.0/credential-preview",
                "attributes": [
                    {"name": "name",            "value": req.get("name", "")},
                    {"name": "degree",          "value": req.get("degree", "")},
                    {"name": "institution",     "value": req.get("institution", "")},
                    {"name": "graduation_year", "value": req.get("graduation_year", "")},
                    {"name": "license_number",  "value": req.get("license_number", "")},
                    {"name": "doctor_did",      "value": req.get("doctor_did", "")},
                ]
            },
            "auto_issue": True,
            "comment": "Medical credential issued by University"
        }
        res = requests.post(f"{UNIVERSITY_AGENT}/issue-credential/send-offer", json=payload, timeout=30)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/patient/did")
def get_patient_did():
    try:
        res = requests.get(f"{PATIENT_AGENT}/wallet/did/public", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/patient/connections")
def get_patient_connections():
    try:
        res = requests.get(f"{PATIENT_AGENT}/connections", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/patient/receive-invitation")
def patient_receive_invitation(invitation: dict):
    try:
        inv_str = json.dumps(invitation).replace("host.docker.internal", "localhost")
        res = requests.post(f"{PATIENT_AGENT}/connections/receive-invitation",
            params={"auto_accept": "true"}, json=json.loads(inv_str), timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/patient/accept-invitation/{connection_id}")
def patient_accept_invitation(connection_id: str):
    try:
        res = requests.post(f"{PATIENT_AGENT}/connections/{connection_id}/accept-invitation", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/patient/request-presentation")
def patient_request_presentation(req: dict):
    try:
        payload = {
            "connection_id": req["connection_id"],
            "proof_request": {
                "name": "Medical Credential Verification",
                "version": "1.0",
                "requested_attributes": {
                    "doctor_name":        {"name": "name",           "restrictions": [{"cred_def_id": req["cred_def_id"]}]},
                    "doctor_degree":      {"name": "degree",         "restrictions": [{"cred_def_id": req["cred_def_id"]}]},
                    "doctor_institution": {"name": "institution",    "restrictions": [{"cred_def_id": req["cred_def_id"]}]},
                    "doctor_license":     {"name": "license_number", "restrictions": [{"cred_def_id": req["cred_def_id"]}]},
                    "doctor_did_claim":   {"name": "doctor_did",     "restrictions": [{"cred_def_id": req["cred_def_id"]}]},
                },
                "requested_predicates": {}
            },
            "comment": "Patient requesting proof of medical credentials"
        }
        res = requests.post(f"{PATIENT_AGENT}/present-proof/send-request", json=payload, timeout=30)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/patient/proof-records")
def patient_proof_records():
    try:
        res = requests.get(f"{PATIENT_AGENT}/present-proof/records", timeout=10)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/patient/verify-presentation/{pres_ex_id}")
def patient_verify_presentation(pres_ex_id: str):
    try:
        res = requests.post(f"{PATIENT_AGENT}/present-proof/records/{pres_ex_id}/verify-presentation", timeout=30)
        data = res.json()
        verified = data.get("verified", "false")
        return {"verified": verified, "verified_bool": verified == "true",
                "presentation_exchange_id": pres_ex_id, "data": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/status/connections")
def all_connections_status():
    result = {}
    for name, url in [("doctor", DOCTOR_AGENT), ("university", UNIVERSITY_AGENT), ("patient", PATIENT_AGENT)]:
        try:
            res = requests.get(f"{url}/connections", timeout=5)
            conns = res.json().get("results", [])
            result[name] = [{"id": c["connection_id"][:8], "state": c["state"], "with": c.get("their_label", "?")} for c in conns]
        except Exception as e:
            result[name] = {"error": str(e)}
    return result