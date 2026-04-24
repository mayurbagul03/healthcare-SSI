import { useState, useEffect } from "react";

const API = "http://localhost:5000";
const CRED_DEF_ID = "WSmY7gWo1JnJ5BruV9bXCp:3:CL:14:default";

// ─── Global Styles ────────────────────────────────────────────
const G = {
  bg: "#f0f4f8",
  card: "#ffffff",
  primary: "#2563eb",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
};

// ─── Shared UI Components ─────────────────────────────────────
function Header({ role, color, icon, did }) {
  return (
    <div
      style={{
        background: color,
        padding: "20px 24px",
        color: "#fff",
        marginBottom: 0,
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 40 }}>{icon}</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: "bold" }}>
            {role}
          </h1>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>
            ID: {did ? did.slice(0, 20) + "..." : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepBar({ steps, current }) {
  return (
    <div
      style={{
        display: "flex",
        background: "#fff",
        borderBottom: `1px solid ${G.border}`,
        padding: "0 24px",
        overflowX: "auto",
      }}
    >
      {steps.map((s, i) => (
        <button
          key={i}
          onClick={() => s.onClick && s.onClick()}
          style={{
            padding: "14px 20px",
            border: "none",
            background: "transparent",
            borderBottom:
              current === i ? "3px solid #2563eb" : "3px solid transparent",
            color: current === i ? "#2563eb" : G.muted,
            fontWeight: current === i ? "bold" : "normal",
            cursor: s.onClick ? "pointer" : "default",
            fontSize: 13,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: "bold",
              background: s.done
                ? G.success
                : current === i
                  ? "#2563eb"
                  : G.border,
              color: s.done || current === i ? "#fff" : G.muted,
            }}
          >
            {s.done ? "✓" : i + 1}
          </span>
          {s.label}
        </button>
      ))}
    </div>
  );
}

function Panel({ children }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
      {children}
    </div>
  );
}

function Card({ title, subtitle, children, color = G.primary }) {
  return (
    <div
      style={{
        background: G.card,
        borderRadius: 12,
        border: `1px solid ${G.border}`,
        marginBottom: 16,
        overflow: "hidden",
        boxShadow: "0 1px 4px #0001",
      }}
    >
      {title && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${G.border}`,
            background: "#f8fafc",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: "bold",
              color: G.text,
              fontSize: 15,
            }}
          >
            {title}
          </p>
          {subtitle && (
            <p style={{ margin: "2px 0 0 0", color: G.muted, fontSize: 12 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Btn({
  onClick,
  children,
  color = G.primary,
  disabled = false,
  outline = false,
  small = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: small ? "auto" : "100%",
        padding: small ? "8px 16px" : "13px 20px",
        borderRadius: 8,
        fontSize: small ? 13 : 15,
        fontWeight: "bold",
        cursor: disabled ? "not-allowed" : "pointer",
        border: `2px solid ${disabled ? G.border : color}`,
        background: disabled ? "#f1f5f9" : outline ? "#fff" : color,
        color: disabled ? G.muted : outline ? color : "#fff",
        marginBottom: 8,
        transition: "all 0.15s",
        boxShadow: disabled || outline ? "none" : "0 2px 8px " + color + "33",
      }}
    >
      {children}
    </button>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${G.border}`,
      }}
    >
      {icon && <span style={{ fontSize: 20, marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: G.muted,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "2px 0 0 0",
            fontSize: 14,
            color: G.text,
            fontWeight: "500",
            wordBreak: "break-all",
          }}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ state }) {
  const map = {
    active: { bg: "#dcfce7", color: "#16a34a", label: "● Connected" },
    response: { bg: "#fef9c3", color: "#ca8a04", label: "● Pending" },
    request: { bg: "#fff7ed", color: "#c2410c", label: "● Waiting" },
    invitation: { bg: "#fee2e2", color: "#dc2626", label: "● Not connected" },
  };
  const s = map[state] || { bg: "#f1f5f9", color: G.muted, label: state };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: "bold",
      }}
    >
      {s.label}
    </span>
  );
}

function Alert({ type = "info", children }) {
  const map = {
    info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", icon: "ℹ️" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", icon: "✅" },
    error: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", icon: "❌" },
    warning: { bg: "#fffbeb", border: "#fde68a", color: "#92400e", icon: "⚠️" },
  };
  const s = map[type];
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 12,
        display: "flex",
        gap: 10,
      }}
    >
      <span>{s.icon}</span>
      <p style={{ margin: 0, color: s.color, fontSize: 13, lineHeight: 1.5 }}>
        {children}
      </p>
    </div>
  );
}

function Loading({ text = "Loading..." }) {
  return (
    <div style={{ textAlign: "center", padding: 40, color: G.muted }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
      <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
    </div>
  );
}

// ─── API Helper ───────────────────────────────────────────────
async function call(method, path, body) {
  try {
    const r = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return await r.json();
  } catch (e) {
    return { error: e.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// 🏥 DOCTOR SCREEN
// ═══════════════════════════════════════════════════════════════
function DoctorScreen() {
  const [step, setStep] = useState(0);
  const [did, setDid] = useState(null);
  const [connections, setConnections] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [credOffers, setCredOffers] = useState([]);
  const [proofRequests, setProofRequests] = useState([]);
  const [invText, setInvText] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const COLOR = "#2563eb";

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [d, c, cr, of] = await Promise.all([
        call("GET", "/doctor/did"),
        call("GET", "/doctor/connections"),
        call("GET", "/doctor/credentials"),
        call("GET", "/doctor/credential-offers"),
      ]);
      if (d?.result) setDid(d.result);
      if (c?.results) setConnections(c.results);
      if (cr?.results) setCredentials(cr.results);
      if (of?.credentials) setCredOffers(of.credentials);
      setLoading(false);
    })();
  }, []);

  const createInvitation = async () => {
    setBusy(true);
    const d = await call("POST", "/doctor/create-invitation");
    if (d?.invitation) {
      navigator.clipboard.writeText(JSON.stringify(d.invitation));
      showAlert(
        "success",
        "✅ Invitation copied! Share it with University or Patient.",
      );
    } else showAlert("error", "Failed to create invitation. Please try again.");
    setBusy(false);
  };

  const acceptAll = async () => {
    setBusy(true);
    const d = await call("POST", "/doctor/accept-all-pending");
    showAlert("success", `Accepted ${d?.count || 0} connection(s)`);
    const c = await call("GET", "/doctor/connections");
    if (c?.results) setConnections(c.results);
    setBusy(false);
  };

  const acceptCredOffer = async (id) => {
    setBusy(true);
    showAlert("info", "Accepting credential...");
    await call("POST", `/doctor/accept-credential/${id}`);
    await new Promise((r) => setTimeout(r, 2000));
    const [cr, of] = await Promise.all([
      call("GET", "/doctor/credentials"),
      call("GET", "/doctor/credential-offers"),
    ]);
    if (cr?.results) setCredentials(cr.results);
    if (of?.credentials) setCredOffers(of.credentials);
    showAlert("success", "✅ Credential stored in your wallet!");
    setBusy(false);
  };

  const loadProofs = async () => {
    setBusy(true);
    const d = await call("GET", "/doctor/proof-requests");
    if (d?.proof_requests) setProofRequests(d.proof_requests);
    if (!d?.proof_requests?.length)
      showAlert("info", "No pending proof requests from patients.");
    setBusy(false);
  };

  const sendPresentation = async (id) => {
    setBusy(true);
    showAlert("info", "Sending your credentials to patient...");
    const d = await call("POST", `/doctor/send-presentation/${id}`);
    if (!d?.error) {
      showAlert("success", "✅ Credentials shared with patient successfully!");
      const pr = await call("GET", "/doctor/proof-requests");
      if (pr?.proof_requests) setProofRequests(pr.proof_requests);
    } else showAlert("error", "Failed to send. Please try again.");
    setBusy(false);
  };

  const activeConns = connections.filter((c) => c.state === "active");
  const pendingConns = connections.filter((c) => c.state === "request");
  const newOffers = credOffers.filter((o) => o.state === "offer_received");

  if (loading)
    return (
      <div>
        <Header role="Doctor Portal" color={COLOR} icon="🏥" did={did?.did} />
        <Loading text="Loading your profile..." />
      </div>
    );

  return (
    <div>
      <Header role="Doctor Portal" color={COLOR} icon="🏥" did={did?.did} />
      <StepBar
        current={step}
        steps={[
          { label: "My Profile", done: !!did, onClick: () => setStep(0) },
          {
            label: "My Credentials",
            done: credentials.length > 0,
            onClick: () => setStep(1),
          },
          {
            label: "Connect & Share",
            done: activeConns.length > 0,
            onClick: () => setStep(2),
          },
        ]}
      />
      <Panel>
        {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

        {/* STEP 0 — Profile */}
        {step === 0 && (
          <>
            <Card
              title="My Identity"
              subtitle="Your blockchain-registered identity"
            >
              <InfoRow icon="🪪" label="Blockchain ID (DID)" value={did?.did} />
              <InfoRow
                icon="🔑"
                label="Verification Key"
                value={did?.verkey?.slice(0, 30) + "..."}
              />
              <InfoRow
                icon="✅"
                label="Status"
                value="Registered on Blockchain"
              />
            </Card>
            <Btn onClick={() => setStep(1)} color={COLOR}>
              View My Credentials →
            </Btn>
          </>
        )}

        {/* STEP 1 — Credentials */}
        {step === 1 && (
          <>
            {newOffers.length > 0 && (
              <Alert type="warning">
                You have {newOffers.length} new credential offer(s) from
                University waiting!
              </Alert>
            )}
            {newOffers.map((o) => (
              <Card
                key={o.credential_exchange_id}
                title="📨 New Credential from University"
                subtitle="University has issued you a medical credential"
              >
                <Alert type="info">
                  University has verified your qualifications and sent you a
                  credential. Click below to accept it.
                </Alert>
                <Btn
                  onClick={() => acceptCredOffer(o.credential_exchange_id)}
                  color={G.success}
                  disabled={busy}
                >
                  ✅ Accept & Store in My Wallet
                </Btn>
              </Card>
            ))}
            {credentials.length === 0 && newOffers.length === 0 ? (
              <Card title="No Credentials Yet">
                <Alert type="info">
                  You don't have any credentials yet. Connect with University to
                  get your medical credential issued.
                </Alert>
                <Btn onClick={() => setStep(2)} color={COLOR}>
                  Connect with University →
                </Btn>
              </Card>
            ) : (
              credentials.map((c, i) => (
                <Card
                  key={i}
                  title="🏆 My Medical Credential"
                  subtitle="Issued and verified by University"
                >
                  <InfoRow icon="👤" label="Name" value={c.attrs?.name} />
                  <InfoRow icon="🎓" label="Degree" value={c.attrs?.degree} />
                  <InfoRow
                    icon="🏫"
                    label="Institution"
                    value={c.attrs?.institution}
                  />
                  <InfoRow
                    icon="📅"
                    label="Graduation Year"
                    value={c.attrs?.graduation_year}
                  />
                  <InfoRow
                    icon="📋"
                    label="License Number"
                    value={c.attrs?.license_number}
                  />
                  <div style={{ marginTop: 10 }}>
                    <Alert type="success">
                      This credential is cryptographically signed and cannot be
                      tampered with.
                    </Alert>
                  </div>
                </Card>
              ))
            )}
            <Btn onClick={() => setStep(2)} color={COLOR}>
              Manage Connections →
            </Btn>
          </>
        )}

        {/* STEP 2 — Connections */}
        {step === 2 && (
          <>
            <Card
              title="📡 Create Connection"
              subtitle="Share your invitation with University or Patient"
            >
              <p style={{ color: G.muted, fontSize: 13, margin: "0 0 12px 0" }}>
                Click below to create an invitation link. Copy and share it with
                whoever you want to connect with.
              </p>
              <Btn onClick={createInvitation} color={COLOR} disabled={busy}>
                📋 Create & Copy Invitation Link
              </Btn>
              {pendingConns.length > 0 && (
                <>
                  <Alert type="warning">
                    {pendingConns.length} pending connection request(s) waiting
                    for your approval.
                  </Alert>
                  <Btn onClick={acceptAll} color={G.success} disabled={busy}>
                    ✅ Accept All Connection Requests
                  </Btn>
                </>
              )}
            </Card>

            <Card
              title="🔗 Active Connections"
              subtitle={`${activeConns.length} active connection(s) — sorted by newest first`}
            >
              {activeConns.length === 0 ? (
                <Alert type="info">
                  No active connections yet. Create an invitation to connect.
                </Alert>
              ) : (
                [...activeConns]
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                  )
                  .map((c, i) => {
                    const date = new Date(c.created_at);
                    const dateStr = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const timeStr = date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const isNewest = i === 0;
                    return (
                      <div
                        key={c.connection_id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 10px",
                          borderRadius: 8,
                          marginBottom: 6,
                          background: isNewest ? "#eff6ff" : "#f8fafc",
                          border: `1px solid ${isNewest ? "#bfdbfe" : G.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span style={{ fontSize: 22 }}>
                            {c.their_label === "University" ? "🏛️" : "🧑‍⚕️"}
                          </span>
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: "bold",
                                  color: G.text,
                                  fontSize: 14,
                                }}
                              >
                                {c.their_label || "Unknown"}
                              </p>
                              {isNewest && (
                                <span
                                  style={{
                                    background: "#2563eb",
                                    color: "#fff",
                                    borderRadius: 10,
                                    padding: "1px 8px",
                                    fontSize: 10,
                                    fontWeight: "bold",
                                  }}
                                >
                                  LATEST
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                margin: 0,
                                color: G.muted,
                                fontSize: 11,
                              }}
                            >
                              Created: {dateStr} at {timeStr} · ID:{" "}
                              {c.connection_id?.slice(0, 10)}...
                            </p>
                          </div>
                        </div>
                        <StatusBadge state={c.state} />
                      </div>
                    );
                  })
              )}
            </Card>

            <Card
              title="📤 Patient Verification Requests"
              subtitle="Patients asking to verify your credentials"
            >
              <Btn onClick={loadProofs} color="#7c3aed" disabled={busy} outline>
                🔄 Check for New Requests
              </Btn>
              {proofRequests.length === 0 ? (
                <p
                  style={{ color: G.muted, fontSize: 13, margin: "8px 0 0 0" }}
                >
                  No pending requests.
                </p>
              ) : (
                [...proofRequests]
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                  )
                  .map((p, i) => {
                    const date = new Date(p.created_at);
                    const dateStr = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const timeStr = date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const isLatest = i === 0;
                    return (
                      <div
                        key={p.presentation_exchange_id}
                        style={{
                          background: isLatest ? "#faf5ff" : "#f8fafc",
                          borderRadius: 8,
                          padding: 14,
                          margin: "8px 0",
                          border: `1px solid ${isLatest ? "#c4b5fd" : G.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "bold",
                              color: "#6d28d9",
                              fontSize: 14,
                            }}
                          >
                            Patient wants to verify your credentials
                          </p>
                          {isLatest && (
                            <span
                              style={{
                                background: "#7c3aed",
                                color: "#fff",
                                borderRadius: 10,
                                padding: "1px 8px",
                                fontSize: 10,
                                fontWeight: "bold",
                              }}
                            >
                              LATEST
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: "0 0 4px 0",
                            color: G.muted,
                            fontSize: 12,
                          }}
                        >
                          📅 Requested on: {dateStr} at {timeStr}
                        </p>
                        <p
                          style={{
                            margin: "0 0 10px 0",
                            color: G.muted,
                            fontSize: 12,
                          }}
                        >
                          🔑 Request ID:{" "}
                          {p.presentation_exchange_id?.slice(0, 16)}...
                        </p>
                        <Btn
                          onClick={() =>
                            sendPresentation(p.presentation_exchange_id)
                          }
                          color="#7c3aed"
                          disabled={busy}
                          small
                        >
                          📤 Share My Credentials
                        </Btn>
                      </div>
                    );
                  })
              )}
            </Card>
          </>
        )}
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🏛️ UNIVERSITY SCREEN
// ═══════════════════════════════════════════════════════════════
function UniversityScreen() {
  const [step, setStep] = useState(0);
  const [did, setDid] = useState(null);
  const [connections, setConnections] = useState([]);
  const [selectedConn, setSelectedConn] = useState("");
  const [invText, setInvText] = useState("");
  const [receivedConn, setReceivedConn] = useState(null);
  const [credDef, setCredDef] = useState(CRED_DEF_ID);
  const [schema, setSchema] = useState("");
  const [credForm, setCredForm] = useState({
    name: "Dr. Jane Smith",
    degree: "Doctor of Medicine (MD)",
    institution: "Harvard Medical School",
    graduation_year: "2018",
    license_number: "MED-2024-001",
    doctor_did: "SZ9WR5oo2AFrC3XWs5m6Z9",
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const COLOR = "#7c3aed";

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [d, c, s, cd] = await Promise.all([
        call("GET", "/university/did"),
        call("GET", "/university/connections"),
        call("GET", "/university/schemas"),
        call("GET", "/university/cred-defs"),
      ]);
      if (d?.result) setDid(d.result);
      if (c?.results) {
        setConnections(c.results);
        const active = c.results.find((x) => x.state === "active");
        if (active) setSelectedConn(active.connection_id);
      }
      if (s?.schema_ids?.length) setSchema(s.schema_ids[0]);
      if (cd?.credential_definition_ids?.length)
        setCredDef(cd.credential_definition_ids[0]);
      setLoading(false);
    })();
  }, []);

  const receiveInv = async () => {
    if (!invText.trim()) {
      showAlert("error", "Please paste the invitation first.");
      return;
    }
    try {
      setBusy(true);
      const parsed = JSON.parse(invText);
      const d = await call("POST", "/university/receive-invitation", parsed);
      if (d?.error) {
        showAlert("error", "Could not receive invitation.");
        setBusy(false);
        return;
      }
      setReceivedConn(d);
      showAlert("success", "Invitation received! Click Accept to confirm.");
      setBusy(false);
    } catch {
      showAlert("error", "Invalid invitation. Please copy it again.");
      setBusy(false);
    }
  };

  const acceptConn = async () => {
    if (!receivedConn?.connection_id) return;
    setBusy(true);
    await call(
      "POST",
      `/university/accept-invitation/${receivedConn.connection_id}`,
    );
    await new Promise((r) => setTimeout(r, 2000));
    const c = await call("GET", "/university/connections");
    if (c?.results) {
      setConnections(c.results);
      const active = c.results.find((x) => x.state === "active");
      if (active) {
        setSelectedConn(active.connection_id);
        setStep(2);
      }
    }
    showAlert("success", "✅ Connected to Doctor!");
    setReceivedConn(null);
    setInvText("");
    setBusy(false);
  };

  const issueCredential = async () => {
    if (!selectedConn) {
      showAlert("error", "Please connect to a Doctor first.");
      return;
    }
    setBusy(true);
    showAlert("info", "Issuing credential to Doctor...");
    const d = await call("POST", "/university/issue-credential", {
      connection_id: selectedConn,
      schema_id: schema,
      cred_def_id: credDef,
      ...credForm,
    });
    if (d?.state || d?.credential_exchange_id)
      showAlert(
        "success",
        "✅ Credential issued! Doctor will receive it shortly.",
      );
    else showAlert("error", "Failed to issue. Please try again.");
    setBusy(false);
  };

  const activeConns = connections.filter((c) => c.state === "active");

  if (loading)
    return (
      <div>
        <Header
          role="University Portal"
          color={COLOR}
          icon="🏛️"
          did={did?.did}
        />
        <Loading text="Loading university profile..." />
      </div>
    );

  return (
    <div>
      <Header role="University Portal" color={COLOR} icon="🏛️" did={did?.did} />
      <StepBar
        current={step}
        steps={[
          { label: "My Profile", done: !!did, onClick: () => setStep(0) },
          {
            label: "Connect to Doctor",
            done: activeConns.length > 0,
            onClick: () => setStep(1),
          },
          { label: "Issue Credential", done: false, onClick: () => setStep(2) },
        ]}
      />
      <Panel>
        {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

        {/* STEP 0 — Profile */}
        {step === 0 && (
          <>
            <Card
              title="University Identity"
              subtitle="Your blockchain-registered identity as a trusted issuer"
            >
              <InfoRow
                icon="🏛️"
                label="Institution"
                value="University (Trusted Credential Issuer)"
              />
              <InfoRow icon="🪪" label="Blockchain ID (DID)" value={did?.did} />
              <InfoRow
                icon="✅"
                label="Status"
                value="Registered on Blockchain — Trusted Issuer"
              />
            </Card>
            <Btn onClick={() => setStep(1)} color={COLOR}>
              Connect to Doctor →
            </Btn>
          </>
        )}

        {/* STEP 1 — Connect */}
        {step === 1 && (
          <>
            <Card
              title="Connect with Doctor"
              subtitle="Paste the Doctor's invitation to establish a secure connection"
            >
              <p style={{ color: G.muted, fontSize: 13, margin: "0 0 12px 0" }}>
                Ask the Doctor to create and share their invitation link, then
                paste it below.
              </p>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: G.text,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Doctor's Invitation:
              </label>
              <textarea
                value={invText}
                onChange={(e) => setInvText(e.target.value)}
                placeholder="Paste invitation here..."
                style={{
                  width: "100%",
                  height: 80,
                  borderRadius: 8,
                  border: `1px solid ${G.border}`,
                  padding: 10,
                  fontSize: 12,
                  boxSizing: "border-box",
                  resize: "none",
                  fontFamily: "monospace",
                  color: G.text,
                }}
              />
              {!receivedConn ? (
                <Btn
                  onClick={receiveInv}
                  color={COLOR}
                  disabled={busy || !invText.trim()}
                >
                  Connect to Doctor →
                </Btn>
              ) : (
                <Btn onClick={acceptConn} color={G.success} disabled={busy}>
                  ✅ Confirm Connection
                </Btn>
              )}
            </Card>
            {activeConns.length > 0 && (
              <Card title="✅ Active Connections">
                {activeConns.map((c) => (
                  <div
                    key={c.connection_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🏥</span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{ margin: 0, fontWeight: "bold", color: G.text }}
                      >
                        {c.their_label || "Doctor"}
                      </p>
                    </div>
                    <StatusBadge state={c.state} />
                    <button
                      onClick={() => {
                        setSelectedConn(c.connection_id);
                        setStep(2);
                      }}
                      style={{
                        background: COLOR,
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      Issue Credential →
                    </button>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}

        {/* STEP 2 — Issue */}
        {step === 2 && (
          <>
            {!selectedConn && (
              <Alert type="warning">
                No active connection. Please connect to a Doctor first.
              </Alert>
            )}
            <Card
              title="📋 Doctor's Credential Details"
              subtitle="Review and issue the medical credential"
            >
              <p style={{ color: G.muted, fontSize: 13, margin: "0 0 16px 0" }}>
                Fill in the doctor's verified details below, then click Issue
                Credential.
              </p>
              {[
                { key: "name", label: "Full Name", icon: "👤" },
                { key: "degree", label: "Medical Degree", icon: "🎓" },
                { key: "institution", label: "Institution", icon: "🏫" },
                {
                  key: "graduation_year",
                  label: "Graduation Year",
                  icon: "📅",
                },
                { key: "license_number", label: "License Number", icon: "📋" },
                {
                  key: "doctor_did",
                  label: "Doctor's Blockchain ID",
                  icon: "🪪",
                },
              ].map(({ key, label, icon }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: G.muted,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {icon} {label}
                  </label>
                  <input
                    value={credForm[key]}
                    onChange={(e) =>
                      setCredForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: `1px solid ${G.border}`,
                      padding: "10px 12px",
                      fontSize: 13,
                      boxSizing: "border-box",
                      color: G.text,
                    }}
                  />
                </div>
              ))}
              <Btn
                onClick={issueCredential}
                color={COLOR}
                disabled={!selectedConn || busy}
              >
                🏆 Issue Credential to Doctor
              </Btn>
            </Card>
          </>
        )}
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🧑‍⚕️ PATIENT SCREEN
// ═══════════════════════════════════════════════════════════════
function PatientScreen() {
  const [step, setStep] = useState(0);
  const [did, setDid] = useState(null);
  const [connections, setConnections] = useState([]);
  const [selectedConn, setSelectedConn] = useState("");
  const [invText, setInvText] = useState("");
  const [receivedConn, setReceivedConn] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const COLOR = "#0891b2";

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [d, c] = await Promise.all([
        call("GET", "/patient/did"),
        call("GET", "/patient/connections"),
      ]);
      if (d?.result) setDid(d.result);
      if (c?.results) {
        setConnections(c.results);
        const active = c.results.find((x) => x.state === "active");
        if (active) {
          setSelectedConn(active.connection_id);
          setStep(2);
        }
      }
      setLoading(false);
    })();
  }, []);

  const receiveInv = async () => {
    if (!invText.trim()) {
      showAlert("error", "Please paste the invitation first.");
      return;
    }
    try {
      setBusy(true);
      const parsed = JSON.parse(invText);
      const d = await call("POST", "/patient/receive-invitation", parsed);
      if (d?.error) {
        showAlert(
          "error",
          "Could not connect. Ask doctor for a new invitation.",
        );
        setBusy(false);
        return;
      }
      setReceivedConn(d);
      showAlert("success", "Invitation received! Click Confirm to connect.");
      setBusy(false);
    } catch {
      showAlert(
        "error",
        "Invalid invitation code. Please copy it again from your doctor.",
      );
      setBusy(false);
    }
  };

  const acceptConn = async () => {
    setBusy(true);
    showAlert("info", "Connecting...");
    await call(
      "POST",
      `/patient/accept-invitation/${receivedConn.connection_id}`,
    );
    await new Promise((r) => setTimeout(r, 3000));
    const c = await call("GET", "/patient/connections");
    if (c?.results) {
      setConnections(c.results);
      const active = c.results.find((x) => x.state === "active");
      if (active) {
        setSelectedConn(active.connection_id);
        setStep(2);
        showAlert("success", "✅ Connected to your doctor!");
      }
    }
    setReceivedConn(null);
    setInvText("");
    setBusy(false);
  };

  const verifyDoctor = async () => {
    if (!selectedConn) {
      showAlert("error", "Please connect to a doctor first.");
      return;
    }
    setBusy(true);
    showAlert("info", "Requesting verification from your doctor...");

    // Send proof request
    const req = await call("POST", "/patient/request-presentation", {
      connection_id: selectedConn,
      cred_def_id: CRED_DEF_ID,
    });
    if (req?.error) {
      showAlert("error", "Could not send request. Please try again.");
      setBusy(false);
      return;
    }

    // Wait for doctor to respond
    showAlert("info", "Waiting for doctor to respond...");
    await new Promise((r) => setTimeout(r, 4000));

    // Check proof records
    const records = await call("GET", "/patient/proof-records");
    const received = records?.results?.find(
      (r) => r.state === "presentation_received",
    );

    if (!received) {
      showAlert(
        "warning",
        "Doctor hasn't responded yet. Please wait a moment and try verifying again.",
      );
      setBusy(false);
      return;
    }

    // Verify
    showAlert("info", "Checking with blockchain...");
    const result = await call(
      "POST",
      `/patient/verify-presentation/${received.presentation_exchange_id}`,
    );
    if (result) {
      setVerifyResult(result);
      if (result.data?.presentation?.requested_proof?.revealed_attrs) {
        const attrs = result.data.presentation.requested_proof.revealed_attrs;
        setDoctorDetails({
          name: attrs.doctor_name?.raw,
          degree: attrs.doctor_degree?.raw,
          institution: attrs.doctor_institution?.raw,
          license: attrs.doctor_license?.raw,
        });
      }
      setStep(3);
    }
    setBusy(false);
  };

  const activeConns = connections.filter((c) => c.state === "active");

  if (loading)
    return (
      <div>
        <Header role="Patient Portal" color={COLOR} icon="🧑‍⚕️" did={did?.did} />
        <Loading text="Loading your profile..." />
      </div>
    );

  return (
    <div>
      <Header role="Patient Portal" color={COLOR} icon="🧑‍⚕️" did={did?.did} />
      <StepBar
        current={step}
        steps={[
          { label: "Welcome", done: step > 0, onClick: () => setStep(0) },
          {
            label: "Connect to Doctor",
            done: activeConns.length > 0,
            onClick: () => setStep(1),
          },
          {
            label: "Verify Doctor",
            done: !!verifyResult,
            onClick: () => activeConns.length > 0 && setStep(2),
          },
          {
            label: "Result",
            done: !!verifyResult,
            onClick: () => verifyResult && setStep(3),
          },
        ]}
      />
      <Panel>
        {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

        {/* STEP 0 — Welcome */}
        {step === 0 && (
          <>
            <Card
              title="Welcome to Patient Portal"
              subtitle="Verify your doctor's medical credentials instantly"
            >
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🔐</div>
                <p
                  style={{
                    color: G.text,
                    fontSize: 15,
                    lineHeight: 1.7,
                    margin: "0 0 16px 0",
                  }}
                >
                  This portal lets you verify that your doctor has{" "}
                  <strong>genuine, valid medical credentials</strong> using
                  blockchain technology.
                </p>
                <p
                  style={{
                    color: G.muted,
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: "0 0 20px 0",
                  }}
                >
                  ✅ Instant verification &nbsp;·&nbsp; 🔒 Blockchain secured
                  &nbsp;·&nbsp; 🚫 Cannot be faked
                </p>
              </div>
              <Alert type="success">
                Your privacy is protected. No personal data is stored on the
                blockchain.
              </Alert>
            </Card>
            <Btn
              onClick={() => setStep(activeConns.length > 0 ? 2 : 1)}
              color={COLOR}
            >
              {activeConns.length > 0 ? "Verify My Doctor →" : "Get Started →"}
            </Btn>
          </>
        )}

        {/* STEP 1 — Connect */}
        {step === 1 && (
          <>
            <Card
              title="Connect to Your Doctor"
              subtitle="Ask your doctor to share their invitation link"
            >
              <Alert type="info">
                Ask your doctor to click "Create & Copy Invitation" and share
                the code with you.
              </Alert>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: G.text,
                  display: "block",
                  margin: "12px 0 6px 0",
                }}
              >
                Paste Doctor's Invitation Code:
              </label>
              <textarea
                value={invText}
                onChange={(e) => setInvText(e.target.value)}
                placeholder="Paste the invitation code here..."
                style={{
                  width: "100%",
                  height: 90,
                  borderRadius: 8,
                  border: `1px solid ${G.border}`,
                  padding: 10,
                  fontSize: 12,
                  boxSizing: "border-box",
                  resize: "none",
                  fontFamily: "monospace",
                  color: G.text,
                }}
              />
              {!receivedConn ? (
                <Btn
                  onClick={receiveInv}
                  color={COLOR}
                  disabled={busy || !invText.trim()}
                >
                  Connect to Doctor →
                </Btn>
              ) : (
                <Btn onClick={acceptConn} color={G.success} disabled={busy}>
                  ✅ Confirm Connection
                </Btn>
              )}
            </Card>
            {activeConns.length > 0 && (
              <Card title="Already Connected">
                {activeConns.map((c) => (
                  <div
                    key={c.connection_id}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 24 }}>🏥</span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{ margin: 0, fontWeight: "bold", color: G.text }}
                      >
                        {c.their_label || "Your Doctor"}
                      </p>
                      <p style={{ margin: 0, color: G.muted, fontSize: 12 }}>
                        Secure connection established
                      </p>
                    </div>
                    <StatusBadge state={c.state} />
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <Btn onClick={() => setStep(2)} color={COLOR}>
                    Verify This Doctor →
                  </Btn>
                </div>
              </Card>
            )}
          </>
        )}

        {/* STEP 2 — Verify */}
        {step === 2 && (
          <>
            <Card
              title="Verify Your Doctor"
              subtitle="One click to verify credentials on blockchain"
            >
              {activeConns.slice(0, 1).map((c) => (
                <div
                  key={c.connection_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0 20px 0",
                  }}
                >
                  <span style={{ fontSize: 36 }}>🏥</span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "bold",
                        color: G.text,
                        fontSize: 16,
                      }}
                    >
                      {c.their_label || "Your Doctor"}
                    </p>
                    <p style={{ margin: 0, color: G.muted, fontSize: 12 }}>
                      Secure connection active
                    </p>
                  </div>
                </div>
              ))}
              <Alert type="info">
                When you click verify, your doctor will receive a request and
                share their credentials. The blockchain will then confirm if
                they are genuine.
              </Alert>
              <Btn
                onClick={verifyDoctor}
                color={COLOR}
                disabled={busy || !selectedConn}
              >
                {busy
                  ? "⏳ Verifying... Please wait..."
                  : "🔍 Verify Doctor's Credentials"}
              </Btn>
              <Btn onClick={() => setStep(1)} color={G.muted} outline>
                ← Connect Different Doctor
              </Btn>
            </Card>
          </>
        )}

        {/* STEP 3 — Result */}
        {step === 3 && verifyResult && (
          <>
            {verifyResult.verified_bool ? (
              <Card>
                <div style={{ textAlign: "center", padding: "10px 0 20px 0" }}>
                  <div style={{ fontSize: 72 }}>✅</div>
                  <h2
                    style={{
                      color: G.success,
                      fontSize: 24,
                      margin: "8px 0 6px 0",
                    }}
                  >
                    Doctor Verified!
                  </h2>
                  <p style={{ color: "#15803d", fontSize: 14, margin: 0 }}>
                    Credentials confirmed as genuine by Hyperledger Blockchain
                  </p>
                </div>
                {doctorDetails && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      borderRadius: 10,
                      padding: 16,
                      border: "1px solid #bbf7d0",
                      margin: "16px 0",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        fontWeight: "bold",
                        color: G.success,
                        fontSize: 14,
                      }}
                    >
                      ✅ Verified Doctor Details:
                    </p>
                    <InfoRow
                      icon="👤"
                      label="Name"
                      value={doctorDetails.name}
                    />
                    <InfoRow
                      icon="🎓"
                      label="Degree"
                      value={doctorDetails.degree}
                    />
                    <InfoRow
                      icon="🏫"
                      label="Institution"
                      value={doctorDetails.institution}
                    />
                    <InfoRow
                      icon="📋"
                      label="License Number"
                      value={doctorDetails.license}
                    />
                  </div>
                )}
                <Alert type="success">
                  🔒 Verified on Hyperledger Indy Blockchain. This result cannot
                  be faked or tampered with.
                </Alert>
                <Btn
                  onClick={() => {
                    setVerifyResult(null);
                    setDoctorDetails(null);
                    setStep(2);
                  }}
                  color={COLOR}
                  outline
                >
                  🔍 Verify Again
                </Btn>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: "center", padding: "10px 0 20px 0" }}>
                  <div style={{ fontSize: 72 }}>❌</div>
                  <h2
                    style={{
                      color: G.danger,
                      fontSize: 24,
                      margin: "8px 0 6px 0",
                    }}
                  >
                    Verification Failed
                  </h2>
                  <p style={{ color: G.danger, fontSize: 14, margin: 0 }}>
                    Could not verify this doctor's credentials
                  </p>
                </div>
                <Alert type="error">
                  The blockchain could not verify this doctor's credentials.
                  They may be invalid or tampered with. Please seek a second
                  opinion before proceeding.
                </Alert>
                <Btn
                  onClick={() => {
                    setVerifyResult(null);
                    setStep(2);
                  }}
                  color={COLOR}
                >
                  🔍 Try Again
                </Btn>
              </Card>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("patient");

  const tabs = [
    { id: "doctor", label: "Doctor", icon: "🏥", color: "#2563eb" },
    { id: "university", label: "University", icon: "🏛️", color: "#7c3aed" },
    { id: "patient", label: "Patient", icon: "🧑‍⚕️", color: "#0891b2" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: G.bg,
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Top Nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: `1px solid ${G.border}`,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 4px #0001",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>⛓️</span>
          <span style={{ fontWeight: "bold", color: G.text, fontSize: 15 }}>
            Healthcare SSI
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setScreen(t.id)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "none",
                background: screen === t.id ? t.color : "#f1f5f9",
                color: screen === t.id ? "#fff" : G.muted,
                fontWeight: screen === t.id ? "bold" : "normal",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <span
          style={{
            background: "#f0fdf4",
            color: G.success,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: "bold",
            border: "1px solid #bbf7d0",
          }}
        >
          ● Blockchain Active
        </span>
      </div>

      {/* Screen */}
      {screen === "doctor" && <DoctorScreen />}
      {screen === "university" && <UniversityScreen />}
      {screen === "patient" && <PatientScreen />}
    </div>
  );
}
