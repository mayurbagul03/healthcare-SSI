import React, { useState } from "react";

const API = "http://localhost:5000";

function AgentCard({ title, color, agentEndpoint }) {
  const [did, setDid] = useState(null);
  const [connections, setConnections] = useState([]);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getDID = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/${agentEndpoint}/did`);
      const data = await res.json();
      setDid(data.result);
    } catch (e) {
      setMessage("❌ Error fetching DID");
    }
    setLoading(false);
  };

  const getConnections = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/${agentEndpoint}/connections`);
      const data = await res.json();
      setConnections(data.results || []);
    } catch (e) {
      setMessage("❌ Error fetching connections");
    }
    setLoading(false);
  };

  const createInvitation = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/doctor/create-invitation`, {
        method: "POST",
      });
      const data = await res.json();
      setInvitation(data);
      setMessage("✅ Invitation created!");
    } catch (e) {
      setMessage("❌ Error creating invitation");
    }
    setLoading(false);
  };

  return (
    <div style={{
      border: `2px solid ${color}`,
      borderRadius: "12px",
      padding: "20px",
      margin: "10px",
      width: "30%",
      minWidth: "280px",
      backgroundColor: "#1e1e2e",
      boxShadow: `0 0 15px ${color}44`
    }}>
      <h2 style={{ color: color, textAlign: "center" }}>
        {title} Agent
      </h2>

      {message && (
        <p style={{ textAlign: "center", color: "#00ff88" }}>{message}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={getDID} style={btnStyle(color)}>
          {loading ? "Loading..." : "Get DID"}
        </button>

        {agentEndpoint === "doctor" && (
          <button onClick={createInvitation} style={btnStyle(color)}>
            Create Invitation
          </button>
        )}

        <button onClick={getConnections} style={btnStyle(color)}>
          View Connections
        </button>
      </div>

      {did && (
        <div style={cardBox}>
          <p style={label}>DID:</p>
          <p style={value}>{did.did}</p>
          <p style={label}>Verkey:</p>
          <p style={value}>{did.verkey}</p>
          <p style={label}>Status:</p>
          <p style={{ color: "#00ff88" }}>✅ {did.posture}</p>
        </div>
      )}

      {invitation && (
        <div style={cardBox}>
          <p style={label}>Invitation Created!</p>
          <p style={label}>Connection ID:</p>
          <p style={value}>{invitation.connection_id}</p>
          <p style={label}>Invitation Object:</p>
          <pre style={{ ...value, fontSize: "10px", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(invitation.invitation, null, 2)}
          </pre>
        </div>
      )}

      {connections.length > 0 && (
        <div style={cardBox}>
          <p style={label}>Connections ({connections.length}):</p>
          {connections.map((c, i) => (
            <div key={i} style={{
              borderBottom: "1px solid #333",
              paddingBottom: "8px",
              marginBottom: "8px"
            }}>
              <p style={value}>Label: {c.their_label || "Pending"}</p>
              <p style={value}>
                State: <span style={{
                  color: c.state === "active" ? "#00ff88" : "#ffaa00"
                }}>{c.state}</span>
              </p>
              <p style={{ ...value, fontSize: "10px" }}>
                ID: {c.connection_id}
              </p>
            </div>
          ))}
        </div>
      )}

      {connections.length === 0 && (
        <p style={{ color: "#666", textAlign: "center", marginTop: "10px" }}>
          No connections yet
        </p>
      )}
    </div>
  );
}

const btnStyle = (color) => ({
  backgroundColor: "transparent",
  border: `1px solid ${color}`,
  color: color,
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
});

const cardBox = {
  marginTop: "15px",
  backgroundColor: "#13131f",
  borderRadius: "8px",
  padding: "12px",
};

const label = {
  color: "#888",
  fontSize: "11px",
  margin: "4px 0",
  textTransform: "uppercase",
};

const value = {
  color: "#fff",
  fontSize: "12px",
  margin: "2px 0",
  wordBreak: "break-all",
};

function App() {
  return (
    <div style={{
      backgroundColor: "#13131f",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "monospace"
    }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#fff", fontSize: "28px" }}>
          🏥 Healthcare SSI System
        </h1>
        <p style={{ color: "#888" }}>
          Self-Sovereign Identity backed by Hyperledger Blockchain
        </p>
        <div style={{
          display: "inline-block",
          backgroundColor: "#00ff8822",
          border: "1px solid #00ff88",
          borderRadius: "20px",
          padding: "5px 15px",
          color: "#00ff88",
          fontSize: "12px"
        }}>
          ● Blockchain Running at localhost:9000
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <AgentCard title="Doctor" color="#4fc3f7" agentEndpoint="doctor" />
        <AgentCard title="University" color="#ce93d8" agentEndpoint="university" />
        <AgentCard title="Patient" color="#80cbc4" agentEndpoint="patient" />
      </div>
    </div>
  );
}

export default App;