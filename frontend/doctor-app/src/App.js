import { useState, useCallback } from "react";

const API = "http://localhost:5000";

function AgentCard({ title, color, children }) {
  return (
    <div style={{
      border: `2px solid ${color}`, borderRadius: "12px",
      padding: "24px", margin: "12px", backgroundColor: "#1a1a2e",
      minWidth: "320px", maxWidth: "400px", flex: 1
    }}>
      <h2 style={{ color, textAlign: "center", marginBottom: "20px" }}>{title}</h2>
      {children}
    </div>
  );
}

function Btn({ onClick, children, color = "#4fc3f7", disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "10px", margin: "6px 0",
      background: disabled ? "#333" : "transparent",
      border: `1px solid ${disabled ? "#555" : color}`,
      color: disabled ? "#555" : color,
      borderRadius: "6px", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "14px"
    }}>
      {children}
    </button>
  );
}

function StatusBox({ data }) {
  if (!data) return null;
  return (
    <pre style={{
      background: "#0d0d1a", color: "#00ff88", padding: "10px",
      borderRadius: "6px", fontSize: "11px", overflow: "auto",
      maxHeight: "150px", marginTop: "8px", whiteSpace: "pre-wrap",
      wordBreak: "break-all"
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function ConnectionList({ connections, onAccept }) {
  if (!connections || !connections.results) return null;
  return (
    <div style={{ marginTop: "8px" }}>
      {connections.results.length === 0 ? (
        <p style={{ color: "#888", fontSize: "12px" }}>No connections yet</p>
      ) : (
        connections.results.map((c) => (
          <div key={c.connection_id} style={{
            background: "#0d0d1a", borderRadius: "6px",
            padding: "8px", marginBottom: "6px", fontSize: "11px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <span style={{
                color: c.state === "active" ? "#00ff88" :
                       c.state === "response" ? "#ffaa00" :
                       c.state === "request" ? "#ff9800" : "#ff6b6b",
                fontWeight: "bold"
              }}>● {c.state?.toUpperCase()}</span>
              <span style={{ color: "#aaa", marginLeft: "8px" }}>
                {c.their_label || c.alias || c.connection_id?.slice(0, 8) + "..."}
              </span>
            </div>
            {c.state === "request" && onAccept && (
              <button onClick={() => onAccept(c.connection_id)} style={{
                background: "#00ff88", color: "#000", border: "none",
                borderRadius: "4px", padding: "2px 8px", cursor: "pointer",
                fontSize: "10px", fontWeight: "bold"
              }}>ACCEPT</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function Msg({ text }) {
  if (!text) return null;
  const isError = text.toLowerCase().includes("error") || text.toLowerCase().includes("invalid");
  return (
    <p style={{
      color: isError ? "#ff6b6b" : "#ffaa00",
      fontSize: "12px", margin: "4px 0",
      padding: "6px", background: "#0d0d1a", borderRadius: "4px"
    }}>{text}</p>
  );
}

function DoctorCard() {
  const [did, setDid] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [connections, setConnections] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const getDID = async () => {
    setLoading(true); setMsg("Fetching DID...");
    const r = await fetch(`${API}/doctor/did`);
    const d = await r.json();
    setDid(d.result || d);
    setMsg(""); setLoading(false);
  };

  const createInvitation = async () => {
    setLoading(true); setMsg("Creating invitation...");
    const r = await fetch(`${API}/doctor/create-invitation`, { method: "POST" });
    const d = await r.json();
    setInvitation(d);
    setMsg("✅ Invitation created! Click Copy below.");
    setLoading(false);
  };

  const copyInvitation = () => {
    if (invitation?.invitation) {
      navigator.clipboard.writeText(JSON.stringify(invitation.invitation));
      setMsg("✅ Copied! Paste in University or Patient card.");
    }
  };

  const getConnections = async () => {
    setLoading(true); setMsg("Fetching connections...");
    const r = await fetch(`${API}/doctor/connections`);
    const d = await r.json();
    setConnections(d);
    setMsg(""); setLoading(false);
  };

  const acceptPending = async () => {
    setMsg("Accepting all pending...");
    const r = await fetch(`${API}/doctor/accept-all-pending`, { method: "POST" });
    const d = await r.json();
    setMsg(`✅ Accepted ${d.count || 0} connections`);
    setTimeout(getConnections, 1500);
  };

  const acceptOne = async (connection_id) => {
    setMsg("Accepting...");
    await fetch(`${API}/doctor/accept-request/${connection_id}`, { method: "POST" });
    setMsg("✅ Accepted! Refreshing...");
    setTimeout(getConnections, 1500);
  };

  return (
    <AgentCard title="🏥 Doctor Agent" color="#4fc3f7">
      <Btn onClick={getDID} color="#4fc3f7" disabled={loading}>Get DID</Btn>
      {did && <StatusBox data={did} />}
      <Btn onClick={createInvitation} color="#4fc3f7" disabled={loading}>Create Invitation</Btn>
      {invitation?.invitation && (
        <Btn onClick={copyInvitation} color="#00ff88">📋 Copy Invitation</Btn>
      )}
      {invitation?.invitation && <StatusBox data={invitation.invitation} />}
      <Btn onClick={getConnections} color="#4fc3f7" disabled={loading}>View Connections</Btn>
      <Btn onClick={acceptPending} color="#ff9800" disabled={loading}>✅ Accept All Pending Requests</Btn>
      <Msg text={msg} />
      {connections && <ConnectionList connections={connections} onAccept={acceptOne} />}
    </AgentCard>
  );
}

function UniversityCard() {
  const [did, setDid] = useState(null);
  const [connections, setConnections] = useState(null);
  const [invText, setInvText] = useState("");
  const [msg, setMsg] = useState("");
  const [receivedConn, setReceivedConn] = useState(null);
  const [loading, setLoading] = useState(false);

  const getDID = async () => {
    setLoading(true); setMsg("Fetching DID...");
    const r = await fetch(`${API}/university/did`);
    const d = await r.json();
    setDid(d.result || d);
    setMsg(""); setLoading(false);
  };

  const receiveInvitation = async () => {
    try {
      setLoading(true); setMsg("Receiving invitation...");
      const parsed = JSON.parse(invText);
      const r = await fetch(`${API}/university/receive-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const d = await r.json();
      if (d.error) { setMsg(`❌ Error: ${d.error}`); setLoading(false); return; }
      setReceivedConn(d);
      setMsg("✅ Invitation received! Click Accept Connection.");
      setLoading(false);
    } catch (e) {
      setMsg("❌ Invalid JSON. Copy invitation from Doctor card first.");
      setLoading(false);
    }
  };

  const acceptConnection = async () => {
    if (!receivedConn?.connection_id) { setMsg("Receive invitation first!"); return; }
    setLoading(true); setMsg("Accepting...");
    const r = await fetch(
      `${API}/university/accept-invitation/${receivedConn.connection_id}`,
      { method: "POST" }
    );
    const d = await r.json();
    if (d.error) { setMsg(`❌ Error: ${d.error}`); setLoading(false); return; }
    setMsg("✅ Connection accepted! Click View Connections.");
    setReceivedConn(d); setLoading(false);
    setTimeout(getConnections, 2000);
  };

  const getConnections = useCallback(async () => {
    setLoading(true); setMsg("Fetching connections...");
    const r = await fetch(`${API}/university/connections`);
    const d = await r.json();
    setConnections(d);
    setMsg(""); setLoading(false);
  }, []);

  const acceptOne = async (connection_id) => {
    setMsg("Accepting...");
    await fetch(`${API}/university/accept-invitation/${connection_id}`, { method: "POST" });
    setMsg("✅ Accepted! Refreshing...");
    setTimeout(getConnections, 1500);
  };

  return (
    <AgentCard title="🏛️ University Agent" color="#ce93d8">
      <Btn onClick={getDID} color="#ce93d8" disabled={loading}>Get DID</Btn>
      {did && <StatusBox data={did} />}
      <p style={{ color: "#aaa", fontSize: "12px", margin: "8px 0 4px" }}>Paste Doctor invitation here:</p>
      <textarea value={invText} onChange={(e) => setInvText(e.target.value)}
        placeholder="Paste invitation JSON here..."
        style={{ width: "100%", height: "80px", background: "#0d0d1a", color: "#fff",
          border: "1px solid #ce93d8", borderRadius: "6px", padding: "8px",
          fontSize: "11px", boxSizing: "border-box" }} />
      <Btn onClick={receiveInvitation} color="#ce93d8" disabled={loading}>Receive Invitation</Btn>
      {receivedConn && <Btn onClick={acceptConnection} color="#00ff88" disabled={loading}>✅ Accept Connection</Btn>}
      <Btn onClick={getConnections} color="#ce93d8" disabled={loading}>View Connections</Btn>
      <Msg text={msg} />
      {connections && <ConnectionList connections={connections} onAccept={acceptOne} />}
    </AgentCard>
  );
}

function PatientCard() {
  const [did, setDid] = useState(null);
  const [connections, setConnections] = useState(null);
  const [invText, setInvText] = useState("");
  const [msg, setMsg] = useState("");
  const [receivedConn, setReceivedConn] = useState(null);
  const [loading, setLoading] = useState(false);

  const getDID = async () => {
    setLoading(true); setMsg("Fetching DID...");
    const r = await fetch(`${API}/patient/did`);
    const d = await r.json();
    setDid(d.result || d);
    setMsg(""); setLoading(false);
  };

  const receiveInvitation = async () => {
    try {
      setLoading(true); setMsg("Receiving invitation...");
      const parsed = JSON.parse(invText);
      const r = await fetch(`${API}/patient/receive-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const d = await r.json();
      if (d.error) { setMsg(`❌ Error: ${d.error}`); setLoading(false); return; }
      setReceivedConn(d);
      setMsg("✅ Invitation received! Click Accept Connection.");
      setLoading(false);
    } catch (e) {
      setMsg("❌ Invalid JSON. Copy invitation from Doctor card first.");
      setLoading(false);
    }
  };

  const acceptConnection = async () => {
    if (!receivedConn?.connection_id) { setMsg("Receive invitation first!"); return; }
    setLoading(true); setMsg("Accepting...");
    const r = await fetch(
      `${API}/patient/accept-invitation/${receivedConn.connection_id}`,
      { method: "POST" }
    );
    const d = await r.json();
    if (d.error) { setMsg(`❌ Error: ${d.error}`); setLoading(false); return; }
    setMsg("✅ Connection accepted! Click View Connections.");
    setReceivedConn(d); setLoading(false);
    setTimeout(getConnections, 2000);
  };

  const getConnections = useCallback(async () => {
    setLoading(true); setMsg("Fetching connections...");
    const r = await fetch(`${API}/patient/connections`);
    const d = await r.json();
    setConnections(d);
    setMsg(""); setLoading(false);
  }, []);

  const acceptOne = async (connection_id) => {
    setMsg("Accepting...");
    await fetch(`${API}/patient/accept-invitation/${connection_id}`, { method: "POST" });
    setMsg("✅ Accepted! Refreshing...");
    setTimeout(getConnections, 1500);
  };

  return (
    <AgentCard title="🧑‍⚕️ Patient Agent" color="#80cbc4">
      <Btn onClick={getDID} color="#80cbc4" disabled={loading}>Get DID</Btn>
      {did && <StatusBox data={did} />}
      <p style={{ color: "#aaa", fontSize: "12px", margin: "8px 0 4px" }}>Paste Doctor invitation here:</p>
      <textarea value={invText} onChange={(e) => setInvText(e.target.value)}
        placeholder="Paste invitation JSON here..."
        style={{ width: "100%", height: "80px", background: "#0d0d1a", color: "#fff",
          border: "1px solid #80cbc4", borderRadius: "6px", padding: "8px",
          fontSize: "11px", boxSizing: "border-box" }} />
      <Btn onClick={receiveInvitation} color="#80cbc4" disabled={loading}>Receive Invitation</Btn>
      {receivedConn && <Btn onClick={acceptConnection} color="#00ff88" disabled={loading}>✅ Accept Connection</Btn>}
      <Btn onClick={getConnections} color="#80cbc4" disabled={loading}>View Connections</Btn>
      <Msg text={msg} />
      {connections && <ConnectionList connections={connections} onAccept={acceptOne} />}
    </AgentCard>
  );
}

export default function App() {
  const [allStatus, setAllStatus] = useState(null);

  const checkAllConnections = async () => {
    const r = await fetch(`${API}/status/connections`);
    const d = await r.json();
    setAllStatus(d);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#13131f", color: "#fff", fontFamily: "monospace", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px" }}>Healthcare SSI System</h1>
        <p style={{ color: "#888" }}>Self-Sovereign Identity backed by Hyperledger Blockchain</p>
        <span style={{ background: "#1a3a1a", color: "#00ff88", padding: "4px 16px", borderRadius: "20px", fontSize: "13px" }}>
          ● Blockchain Running at localhost:9000
        </span>
        <br /><br />
        <button onClick={checkAllConnections} style={{
          background: "#1a1a2e", color: "#ffaa00", border: "1px solid #ffaa00",
          borderRadius: "6px", padding: "8px 20px", cursor: "pointer", fontSize: "13px"
        }}>🔍 Check All Connection Status</button>
        {allStatus && (
          <pre style={{ background: "#0d0d1a", color: "#00ff88", padding: "10px", borderRadius: "6px",
            fontSize: "11px", marginTop: "10px", textAlign: "left", display: "inline-block" }}>
            {JSON.stringify(allStatus, null, 2)}
          </pre>
        )}
      </div>
      <div style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "8px",
        padding: "12px", marginBottom: "20px", textAlign: "center", fontSize: "12px", color: "#aaa" }}>
        <strong style={{ color: "#fff" }}>Flow: </strong>
        <span style={{ color: "#4fc3f7" }}>1. Doctor creates invitation</span> →{" "}
        <span style={{ color: "#ce93d8" }}>2. University/Patient receives & accepts</span> →{" "}
        <span style={{ color: "#00ff88" }}>3. View Connections → ACTIVE ✅</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
        <DoctorCard />
        <UniversityCard />
        <PatientCard />
      </div>
    </div>
  );
}
