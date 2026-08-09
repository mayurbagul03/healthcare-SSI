# Healthcare SSI

A self-sovereign identity demo for verifying doctors' credentials, built on Hyperledger Aries (ACA-Py) and an Indy ledger.

The idea is simple. A patient walks into a clinic and has no real way to check whether the doctor's degree and license are genuine. Today you'd call the university, or trust a plastic certificate on the wall. Here, the university issues the doctor a verifiable credential once, the doctor keeps it in their own wallet, and any patient can verify it cryptographically in a few seconds. No central database, no phone calls.

Three roles, the usual SSI trust triangle:

- **University** is the issuer. It publishes the schema and credential definition to the ledger and issues the credential.
- **Doctor** is the holder. The credential lives in their wallet and they choose when to present it.
- **Patient** is the verifier. They ask for proof and check the signature against the ledger.

## How it fits together

```
React app (localhost:3000)
   Doctor tab  |  University tab  |  Patient tab
                    |
                    |  plain REST
                    v
FastAPI gateway (localhost:5000)
                    |
      +-------------+-------------+
      |             |             |
   Doctor       University      Patient
   ACA-Py        ACA-Py         ACA-Py
   :8001         :8003          :8005
      |             |             |
      +-------------+-------------+
                    |
           Hyperledger Indy ledger
```

The browser never talks to an agent directly. Everything goes through the FastAPI layer, which also does one small but important thing: it rewrites `host.docker.internal` to `localhost` inside invitation payloads. Without that the agents hand out URLs that only make sense inside Docker, and the connection handshake dies before it starts.

## What's in here

```
backend/main.py             the whole gateway, one file
frontend/doctor-app/        Create React App workspace
  src/App.js                all three portals live here
```

That's it. The agents and the ledger are not part of this repo, which brings us to the setup.

## Before you start

You'll need Python 3.9+, Node 16+, Docker, a running Indy ledger, and three ACA-Py agents.

The ledger is usually [von-network](https://github.com/bcgov/von-network) for local work. The three agents need to be labelled Doctor, University and Patient, each with a public DID written to the ledger, and their admin APIs listening on 8001, 8003 and 8005 respectively. The gateway assumes those admin APIs are open (no auth header), so either run them that way or extend the gateway to pass a token.

None of that infrastructure ships with this repo. If you clone this and run `npm start` expecting something to happen, nothing will.

Quick check that your agents are alive:

```bash
curl http://localhost:8001/status
curl http://localhost:8003/status
curl http://localhost:8005/status
```

## Running it

Backend first:

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn requests
uvicorn main:app --reload --port 5000
```

Don't drop the `--port 5000`. Uvicorn defaults to 8000, the frontend is hardcoded to 5000, and the failure mode is a UI that loads fine and then just sits there with empty fields forever. Hit `http://localhost:5000` and you should get `{"status": "Backend is running!"}`. Swagger docs are at `/docs` if you want to poke at the endpoints directly.

Then the frontend:

```bash
cd frontend/doctor-app
npm install
npm start
```

Open `http://localhost:3000` and switch between the three portals with the tabs at the top.

One more thing before anything will verify. Near the top of `src/App.js`:

```js
const CRED_DEF_ID = "WSmY7gWo1JnJ5BruV9bXCp:3:CL:14:default";
```

That ID points at a credential definition on a ledger that isn't yours. Once the University portal has published its own schema and cred def, swap this value out. The University screen already fetches the real list from `/university/cred-defs` on load, so wiring it up properly is a small change if you'd rather not hardcode it.

## The credential

Schema is called `medical_credential`, version 1.0, with six attributes:

`name`, `degree`, `institution`, `graduation_year`, `license_number`, `doctor_did`

Issued without revocation support, so once a credential is out there it stays valid. Fine for a demo, not fine for real licensing.

## Walking through a full run

1. Doctor portal, go to Connect & Share, hit **Create & Copy Invitation**. It lands on your clipboard.
2. University portal, paste it in, connect, confirm.
3. University publishes the schema and credential definition. One-time setup per ledger.
4. Still in University, fill in the doctor's details and issue the credential.
5. Back to Doctor, My Credentials. The offer shows up, accept it, and it's stored in the wallet.
6. Doctor creates a second invitation, this time for the patient.
7. Patient connects, then clicks **Verify Doctor's Credentials**.
8. The doctor gets a proof request. They open their portal and share their credentials.
9. Patient verifies, and gets a green tick with the revealed attributes, or a red cross.

Step 8 trips people up during demos because it needs a human on the doctor's side. The patient screen waits about four seconds and then tells you the doctor hasn't responded yet, which is accurate but looks like a bug if you're expecting magic.

## Endpoints

Everything below is on the gateway at port 5000.

**Doctor**

```
GET   /doctor/did
POST  /doctor/create-invitation
GET   /doctor/connections
POST  /doctor/accept-request/{connection_id}
POST  /doctor/accept-all-pending
GET   /doctor/credentials
GET   /doctor/credential-offers
POST  /doctor/accept-credential/{cred_exchange_id}
GET   /doctor/proof-requests
POST  /doctor/send-presentation/{pres_ex_id}
```

`send-presentation` is the interesting one. It pulls the credentials that match the proof request, maps them onto the requested referents automatically, and sends the presentation. The doctor doesn't pick which credential to use, which is a simplification you'd want to undo in anything real.

**University**

```
GET   /university/did
GET   /university/connections
POST  /university/receive-invitation
POST  /university/accept-invitation/{connection_id}
POST  /university/accept-all-pending
POST  /university/publish-schema
POST  /university/create-cred-def
GET   /university/schemas
GET   /university/cred-defs
POST  /university/issue-credential
```

**Patient**

```
GET   /patient/did
GET   /patient/connections
POST  /patient/receive-invitation
POST  /patient/accept-invitation/{connection_id}
POST  /patient/request-presentation
GET   /patient/proof-records
POST  /patient/verify-presentation/{pres_ex_id}
```

**Everything else**

```
GET   /                      health check
GET   /status/connections    connection states across all three agents
```

That last one is genuinely useful when a handshake gets stuck. It shows you which agent is sitting in `request` while the other thinks it's `active`.

## Stack

FastAPI and Requests on the backend. React 19 on Create React App for the frontend, with inline styles and no component library, so there's nothing to install beyond the defaults. ACA-Py and Indy underneath, using the v1.0 issue-credential and present-proof protocols.

## When things break

**Everything loads but all the fields are empty.** The gateway can't reach an agent. Check the three `/status` endpoints, then check you actually started uvicorn on 5000.

**"Invalid invitation".** Paste the full JSON, unedited. The Doctor portal copies it for you, so don't retype it.

**"No matching credentials found in Doctor wallet".** Almost always the hardcoded `CRED_DEF_ID`. The proof request restricts on it, so if it doesn't match what the University issued from, the doctor's wallet looks empty even though the credential is right there.

**CORS errors.** The gateway allows all origins out of the box. If you tightened that, put `http://localhost:3000` back.

## Things I know are wrong with it

This is a demo, and it makes demo compromises:

- CORS is wide open and there's no auth on the gateway at all
- Agent URLs and the credential definition ID are hardcoded instead of coming from config
- Errors come back as HTTP 200 with an `{"error": "..."}` body, which is lazy
- No revocation, so an issued credential can never be pulled back
- Polling with fixed sleeps instead of ACA-Py webhooks
- One shared agent per role rather than per-user wallets
- The forms ship prefilled with demo data

If I picked this back up, moving the config into `.env` and swapping the polling for webhooks would be the first two jobs. Revocation would be the interesting one, since a medical license that can't be revoked rather defeats the purpose.

## License

No license file yet. Add one if you want anyone else to use this.
