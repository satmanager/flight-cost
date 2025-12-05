import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [origin, setOrigin] = useState('');
  const [destinations, setDestinations] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const destList = destinations.split(',').map(city => city.trim()).filter(c => c !== '');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/optimize';

      const response = await axios.post(apiUrl, {
        origin: origin,
        destinations: destList
      });
      setResult(response.data);
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("No flights found or server error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to reset the form
  const handleClear = () => {
    setOrigin('');
    setDestinations('');
    setResult(null);
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>✈️ Flight Value Optimizer</h1>
        <p>Find the cheapest flight per kilometer.</p>
      </header>

      <main className="container">
        <form onSubmit={handleSubmit} className="flight-form">
          <div className="form-group">
            <label>Departure City:</label>
            <input 
              type="text" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)} 
              placeholder="e.g. London" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Destinations (comma separated):</label>
            <input 
              type="text" 
              value={destinations} 
              onChange={(e) => setDestinations(e.target.value)} 
              placeholder="e.g. Paris, Berlin, Madrid" 
              required 
            />
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? 'Please wait...' : 'Search Best Flight'}
            </button>
            
            {/* NEW: Clear Button */}
            <button type="button" onClick={handleClear} className="clear-btn">
              Clear
            </button>
          </div>
        </form>

        {error && <div className="error-msg">{error}</div>}

        {/* NEW: Loading Spinner */}
        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}        

        {/* Result Card (Only show if NOT loading and we have a result) */}
        {!loading && result && (
          <div className="result-card">
            <h2>🏆 Best Option: {result.destination}</h2>
            <div className="result-details">
              <p><strong>Price:</strong> ${result.price}</p>
              <p><strong>Distance:</strong> {result.distance} km</p>
              <p className="highlight"><strong>Value:</strong> ${Number(result.ratio).toFixed(2)} / km</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;