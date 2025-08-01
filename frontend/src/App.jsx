import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_BASE = "/incidents";


function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default function App() {
  const [search, setSearch] = useState("");
  const [autocomplete, setAutocomplete] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Fetch autocomplete suggestions
  const fetchAutocomplete = useCallback(
    debounce(async (q) => {
      if (q.length < 2) {
        setAutocomplete([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/addresses?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error("Failed to fetch autocomplete");
        const data = await res.json();
        setAutocomplete(data);
      } catch (error) {
        console.error(error);
        setAutocomplete([]);
      }
    }, 300),
    []
  );

  // Handle input change
  function handleInputChange(e) {
    const val = e.target.value;
    setSearch(val);
    fetchAutocomplete(val);
  }

  // Handle selecting an autocomplete suggestion
  function handleSelectAddress(addr) {
    setSelectedAddress(addr);
    setSearch(addr);
    setAutocomplete([]);
    setSkip(0);
  }

  // Fetch incidents when selectedAddress or skip changes
  useEffect(() => {
    if (!selectedAddress) {
      setIncidents([]);
      setNoResults(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}?address=${encodeURIComponent(selectedAddress)}&skip=${skip}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data);
        setNoResults(data.length === 0);
      })
      .catch((e) => {
        console.error(e);
        setNoResults(true);
      })
      .finally(() => setLoading(false));
  }, [selectedAddress, skip]);

  // Pagination handlers
  function handlePrev() {
    if (skip >= 20) setSkip(skip - 20);
  }
  function handleNext() {
    if (incidents.length === 20) setSkip(skip + 20);
  }

  return (
    <div className="app-container">
      <h1>Incidents Dashboard</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Address..."
          value={search}
          onChange={handleInputChange}
          aria-label="Search by Address"
        />
        {autocomplete.length > 0 && (
          <ul className="autocomplete-list">
            {autocomplete.map((addr, idx) => (
              <li key={idx} onClick={() => handleSelectAddress(addr)}>
                {addr}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p>Loading incidents...</p>}
      {noResults && <p>No incidents found.</p>}

      <div className="incidents-list">
        {incidents.map((incident) => (
          <div className="incident-card" key={incident.id}>
            <p><strong>Incident ID:</strong> {incident.incident_id}</p>
            <p><strong>Type:</strong> {incident.type}</p>
            <p><strong>Alarm:</strong> {incident.alarm}</p>
            <p><strong>Enroute Time:</strong> {incident.enroute_time}</p>
            <p><strong>Arrive Time:</strong> {incident.arrive_time}</p>
            <p><strong>Address:</strong> {incident.address}</p>
            <p><strong>Apparatus:</strong> {incident.apparatus}</p>
            <p><strong>Total:</strong> {incident.total}</p>
            <p><strong>Scan Date:</strong> {incident.scan_date}</p>
            <p><strong>Created At:</strong> {incident.created_at}</p>
          </div>
        ))}
      </div>

      {incidents.length > 0 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={skip === 0}>
            Previous
          </button>
          <button onClick={handleNext} disabled={incidents.length < 20}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
