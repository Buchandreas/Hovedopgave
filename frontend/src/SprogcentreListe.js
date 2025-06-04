import React, { useState, useEffect } from 'react';

// Initial form state for Sprogcentre
const initialFormState = {
    navn: '',
    adresse: '',
    postnummer: '',
    forstad: '',
    telefon: '',
    email: '',
    institutionsnummer: '',
    organisations_id: '', 
    driftsaftaleperiode: '',
    tilsynskommune: '',
    udbyder_pd1: false,
    udbyder_pd2: false,
    udbyder_pd3: false,
    udbyder_sp: false,
    udbyder_vp: false
};

function SprogcentreListe() {
  // State hooks specifikt for sprogcentre
  const [sprogcentre, setSprogcentre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // API URL for sprogcentre
  const API_BASE_URL = 'http://localhost:3001/api/sprogcentre';

  // --- Funktioner ---

  // Funktion til at hente alle sprogcentre
  const fetchSprogcentre = () => {
    setLoading(true);
    setError(null);
    fetch(API_BASE_URL)
      .then(response => {
        if (!response.ok) throw new Error(`Netværksfejl: ${response.status}`);
        return response.json();
      })
      .then(data => setSprogcentre(data))
      .catch(error => {
        console.error("Fejl ved hentning af sprogcentre:", error);
        setError(`Kunne ikke hente sprogcentre: ${error.message}`);
      })
      .finally(() => setLoading(false));
  };

  // Hent data ved mount
  useEffect(() => {
    fetchSprogcentre();
  }, []);

  // Generisk input handler
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Nulstil formularen
  const resetForm = () => {
    setFormState(initialFormState);
  };

  // Håndter submit af nyt sprogcenter
  const handleSprogcenterSubmit = (event) => {
    event.preventDefault();
    if (!formState.navn.trim()) {
      alert('Navn er påkrævet for sprogcenter.');
      return;
    }
    setError(null);

    // Forbered data til backend
    const sprogcenterData = {
      ...formState,
      // Konverter organisations_id til tal eller null
      organisations_id: formState.organisations_id ? parseInt(formState.organisations_id, 10) : null,
    };
    // Fjern evt. NaN hvis parsing fejlede
    if (isNaN(sprogcenterData.organisations_id)) sprogcenterData.organisations_id = null;

    fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sprogcenterData),
    })
    .then(response => {
      if (!response.ok) return response.text().then(text => { throw new Error(text || `Serverfejl: ${response.status}`) });
      return response.json();
    })
    .then((savedSprogcenter) => {
      console.log('Sprogcenter gemt:', savedSprogcenter);
      resetForm();
      setIsFormVisible(false); // Skjul formen
      fetchSprogcentre(); // Opdater listen
    })
    .catch(error => {
      console.error("Fejl ved gemning af sprogcenter:", error);
      setError(`Kunne ikke gemme sprogcenter: ${error.message}`);
    });
  };

  // Håndter sletning af sprogcenter
  const handleDeleteSprogcenter = (idToDelete) => {
    if (!window.confirm(`Sikker på du vil slette sprogcenter med ID ${idToDelete}?`)) return;
    setError(null);

    fetch(`${API_BASE_URL}/${idToDelete}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok && response.status !== 204) {
           return response.text().then(text => { throw new Error(text || `Serverfejl: ${response.status}`) });
        }
        console.log(`Sprogcenter med ID ${idToDelete} slettet.`);
        fetchSprogcentre(); // Opdater listen
      })
      .catch(error => {
        console.error("Fejl ved sletning:", error);
        setError(`Kunne ikke slette sprogcenter: ${error.message}`);
      });
  };


  // --- JSX Return Værdi ---
  return (
    <div>
      <div className="toggle-form-container">
        <button
          onClick={() => setIsFormVisible(prev => !prev)}
          className="toggle-form-button"
        >
          {isFormVisible ? 'Skjul Tilføj Sprogcenter Formular' : 'Vis Tilføj Sprogcenter Formular'}
        </button>
      </div>

      {/* --- FORMULAR --- */}
      {isFormVisible && (
          <form onSubmit={handleSprogcenterSubmit} className="add-person-form">
            <h3>Tilføj/Rediger Sprogcenter</h3>

            {/* Navn (påkrævet) */}
            <div className="form-field">
              <label htmlFor="navn">Navn:*</label>
              <input type="text" id="navn" name="navn" value={formState.navn} onChange={handleInputChange} required />
            </div>

            {/* Adresse Info */}
            <div className="form-field">
              <label htmlFor="adresse">Adresse:</label>
              <input type="text" id="adresse" name="adresse" value={formState.adresse} onChange={handleInputChange} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="postnummer">Postnummer:</label>
                <input type="text" id="postnummer" name="postnummer" value={formState.postnummer} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label htmlFor="forstad">Forstad/By:</label>
                <input type="text" id="forstad" name="forstad" value={formState.forstad} onChange={handleInputChange} />
              </div>
            </div>

            {/* Kontakt Info */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="telefon">Telefon:</label>
                <input type="tel" id="telefon" name="telefon" value={formState.telefon} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={formState.email} onChange={handleInputChange} />
              </div>
            </div>

            {/* IDs og Perioder */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="institutionsnummer">Institutionsnummer:</label>
                <input type="text" id="institutionsnummer" name="institutionsnummer" value={formState.institutionsnummer} onChange={handleInputChange} />
              </div>
               <div className="form-field">
                <label htmlFor="organisations_id">Organisations ID:</label>
                <input type="number" id="organisations_id" name="organisations_id" value={formState.organisations_id} onChange={handleInputChange} />
              </div>
            </div>
             <div className="form-row">
                 <div className="form-field">
                    <label htmlFor="driftsaftaleperiode">Driftsaftaleperiode:</label>
                    <input type="text" id="driftsaftaleperiode" name="driftsaftaleperiode" value={formState.driftsaftaleperiode} onChange={handleInputChange} />
                  </div>
                   <div className="form-field">
                    <label htmlFor="tilsynskommune">Tilsynskommune:</label>
                    <input type="text" id="tilsynskommune" name="tilsynskommune" value={formState.tilsynskommune} onChange={handleInputChange} />
                  </div>
            </div>

            {/* Udbyder Checkboxes */}
            <fieldset style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'15px', borderRadius:'4px' }}>
                <legend style={{fontWeight:'bold', color:'#555'}}>Udbyder:</legend>
                 <div className="form-row" style={{ marginBottom: '0' }}>
                    <div className="form-field-check"><input type="checkbox" id="udbyder_pd1" name="udbyder_pd1" checked={formState.udbyder_pd1} onChange={handleInputChange} /><label htmlFor="udbyder_pd1"> PD1</label></div>
                    <div className="form-field-check"><input type="checkbox" id="udbyder_pd2" name="udbyder_pd2" checked={formState.udbyder_pd2} onChange={handleInputChange} /><label htmlFor="udbyder_pd2"> PD2</label></div>
                    <div className="form-field-check"><input type="checkbox" id="udbyder_pd3" name="udbyder_pd3" checked={formState.udbyder_pd3} onChange={handleInputChange} /><label htmlFor="udbyder_pd3"> PD3</label></div>
                    <div className="form-field-check"><input type="checkbox" id="udbyder_sp" name="udbyder_sp" checked={formState.udbyder_sp} onChange={handleInputChange} /><label htmlFor="udbyder_sp"> SP</label></div>
                    <div className="form-field-check"><input type="checkbox" id="udbyder_vp" name="udbyder_vp" checked={formState.udbyder_vp} onChange={handleInputChange} /><label htmlFor="udbyder_vp"> VP</label></div>
                 </div>
            </fieldset>

            {/* Knapper */}
            <div>
              <button type="submit" disabled={loading}>{loading ? 'Gemmer...' : 'Gem Sprogcenter'}</button>
              <button type="button" onClick={resetForm} className="reset-button" disabled={loading}>Nulstil Form</button>
            </div>
          </form>
      )}

      {/* --- Fejl og Liste Sektion --- */}
      {error && <p className="error-message">{error}</p>}
      <h2>Eksisterende Sprogcentre</h2>
      {loading && <p className="info-message">Henter sprogcentre...</p>}
      {!loading && sprogcentre.length === 0 && !error && (
        <p className="info-message">Ingen sprogcentre fundet.</p>
      )}

      {/* --- TABEL VISNING --- */}
      {!loading && sprogcentre.length > 0 && (
        <div className="table-container">
          <table className="censor-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Navn</th>
                <th>Kontakt</th>
                <th>Adresse</th>
                <th>Inst./Org. ID</th>
                <th>Udbyder</th>
                <th>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {sprogcentre.map(sc => (
                <tr key={sc.id}>
                  <td>{sc.id}</td>
                  <td><strong>{sc.navn}</strong></td>
                  <td>
                    {sc.email && <><small>Email: {sc.email}</small><br /></>}
                    {sc.telefon && <small>Tlf: {sc.telefon}</small>}
                    {!sc.email && !sc.telefon && <small>N/A</small>}
                  </td>
                   <td>
                    {sc.adresse && <small>{sc.adresse}</small>}
                    {(sc.postnummer || sc.forstad) && <><br /><small>{sc.postnummer || ''} {sc.forstad || ''}</small></>}
                    {!sc.adresse && !sc.postnummer && !sc.forstad && <small>N/A</small>}
                  </td>
                   <td>
                       {sc.institutionsnummer && <><small>Inst: {sc.institutionsnummer}</small><br/></>}
                       {sc.organisations_id !== null && <small>OrgID: {sc.organisations_id}</small>}
                       {!sc.institutionsnummer && sc.organisations_id === null && <small>N/A</small>}
                   </td>
                   <td>
                       <small>
                           {sc.udbyder_pd1 ? 'PD1 ' : ''}
                           {sc.udbyder_pd2 ? 'PD2 ' : ''}
                           {sc.udbyder_pd3 ? 'PD3 ' : ''}
                           {sc.udbyder_sp ? 'SP ' : ''}
                           {sc.udbyder_vp ? 'VP' : ''}
                           {!sc.udbyder_pd1 && !sc.udbyder_pd2 && !sc.udbyder_pd3 && !sc.udbyder_sp && !sc.udbyder_vp ? 'Ingen' : ''}
                       </small>
                   </td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleDeleteSprogcenter(sc.id)}
                      className="delete-button"
                      title={`Slet ${sc.navn}`}
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

export default SprogcentreListe;