import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Waiting for backend...");

  useEffect(() => {
    fetch("http://localhost:3000/api/ping")
        .then((res) => res.json())
        .then((data) => setMessage(`Backend says: ${data.message}`))
        .catch((err) => setMessage("Error: Backend not reachable"));
  }, []);

  return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Movie Watchlist</h1>
        <p>{message}</p>
      </div>
  );
}

export default App;