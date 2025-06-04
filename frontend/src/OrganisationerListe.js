import React, { useState, useEffect } from 'react';


function OrganisationerListe() {
  // State hooks
  const [organisationer, setOrganisationer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrganisationName, setNewOrganisationName] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  // API URL 
  const API_BASE_URL = 'http://localhost:3001/api/organisationer';

  // --- Funktioner ---
  const fetchOrganisationer = () => {
    setLoading(true);
    setError(null);
    fetch(API_BASE_URL)
      .then(response => {
        if (!response.ok) throw new Error(`Netværksfejl: ${response.status}`);
        return response.json();
      })
      .then(data => setOrganisationer(data))
      .catch(error => {
        console.error("Fejl ved hentning af organisationer:", error);
        setError(`Kunne ikke hente organisationer: ${error.message}`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrganisationer(); }, []);

  const handleInputChange = (event) => {
    setNewOrganisationName(event.target.value);
  };

  const handleOrganisationSubmit = (event) => {
    event.preventDefault();
    const trimmedName = newOrganisationName.trim();
    if (!trimmedName) {
      alert('Organisationsnavn må ikke være tomt.');
      return;
    }
    setError(null);

    fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ navn: trimmedName }),
    })
    .then(response => {
      if (!response.ok) return response.text().then(text => { throw new Error(text || `Serverfejl: ${response.status}`) });
      return response.json();
    })
    .then((savedOrganisation) => {
      console.log('Organisation gemt:', savedOrganisation);
      setNewOrganisationName('');
      setIsFormVisible(false);
      fetchOrganisationer();
    })
    .catch(error => {
      console.error("Fejl ved gemning af organisation:", error);
      setError(`Kunne ikke gemme organisation: ${error.message}`);
    });
  };

  const handleDeleteOrganisation = (idToDelete) => {
    if (!window.confirm(`Sikker på du vil slette organisation med ID ${idToDelete}?`)) return;
    setError(null);

    fetch(`${API_BASE_URL}/${idToDelete}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok && response.status !== 204) {
           return response.text().then(text => { throw new Error(text || `Serverfejl: ${response.status}`) });
        }
        console.log(`Organisation med ID ${idToDelete} slettet.`);
        fetchOrganisationer();
      })
      .catch(error => {
        console.error("Fejl ved sletning:", error);
        setError(`Kunne ikke slette organisation: ${error.message}`);
      });
  };

  // --- JSX Return Værdi  ---
  return (
    <div>
      {/* --- KNAP TIL AT VISE/SKJULE FORMULAR --- */}
      <div className="toggle-form-container">
        <button
          onClick={() => setIsFormVisible(prev => !prev)}
          className="toggle-form-button"
        >
          {isFormVisible ? 'Skjul Tilføj Organisation Formular' : 'Vis Tilføj Organisation Formular'}
        </button>
      </div>

      {/* --- FORMULAR --- */}
      {isFormVisible && (
        <form onSubmit={handleOrganisationSubmit} className="add-person-form">
          <h3>Tilføj ny organisation</h3>
          <div className="form-field">
            <label htmlFor="orgNavn">Navn:*</label>
            <input
              type="text"
              id="orgNavn"
              name="orgNavn"
              value={newOrganisationName}
              onChange={handleInputChange}
              required
              placeholder="Organisationens navn"
            />
          </div>
          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Gemmer...' : 'Gem Organisation'}
            </button>
          </div>
        </form>
      )}

      {/* --- Fejl og Liste Sektion --- */}
      {error && <p className="error-message">{error}</p>}
      <h2>Eksisterende Organisationer</h2>
      {loading && <p className="info-message">Henter organisationer...</p>}
      {!loading && organisationer.length === 0 && !error && (
        <p className="info-message">Ingen organisationer fundet.</p>
      )}

      {/* --- TABEL VISNING --- */}
      {!loading && organisationer.length > 0 && (
        <div className="table-container">
          <table className="censor-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Navn</th>
                <th className="action-cell">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {organisationer.map(org => (
                <tr key={org.id}>
                  <td>{org.id}</td>
                  <td><strong>{org.navn}</strong></td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleDeleteOrganisation(org.id)}
                      className="delete-button"
                      title={`Slet ${org.navn}`}
                    >
                      Slet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      

    </div>
  );
}

export default OrganisationerListe;