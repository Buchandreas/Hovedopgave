import React, { useState, useEffect } from 'react';
// import './App.css';

// Initial form state
const initialFormState = {
    fornavn: '',
    efternavn: '',
    adresse: '',
    postnummer: '',
    forstad: '',
    telefon: '',
    email: '',
    cpr_nummer: '',
    beskikket_til: '',
    beskikket_indfodsret: false,
    beskikket_medborgerskab: false,
    arbejds_status: '',
    prioritet: '', 
    sprogcenter_id: '', 
    kommentar: ''
};

function CensorerListe() {
  // State hooks
  const [censorer, setCensorer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // API URL
  const API_BASE_URL = 'http://localhost:3001/api/censorer';

  // --- Funktioner ---
  const fetchCensorer = () => {
    setLoading(true);
    setError(null);
    fetch(API_BASE_URL)
      .then(response => {
        if (!response.ok) throw new Error(`Netværksfejl: ${response.status}`);
        return response.json();
      })
      .then(data => setCensorer(data))
      .catch(error => {
        console.error("Fejl ved hentning af censorer:", error);
        setError(`Kunne ikke hente censorer: ${error.message}`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCensorer(); }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormState(initialFormState); // Nulstiller til den fulde initial state
  };

  const handleCensorSubmit = (event) => {
    event.preventDefault();
    if (!formState.fornavn.trim() || !formState.efternavn.trim()) {
      alert('Fornavn og Efternavn er påkrævede felter.');
      return;
    }
    setError(null);

    const censorData = {
      ...formState,
      prioritet: formState.prioritet ? parseInt(formState.prioritet, 10) : null,
      sprogcenter_id: formState.sprogcenter_id ? parseInt(formState.sprogcenter_id, 10) : null,
    };
     if (isNaN(censorData.prioritet)) censorData.prioritet = null;
     if (isNaN(censorData.sprogcenter_id)) censorData.sprogcenter_id = null;

    fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(censorData),
    })
    .then(response => {
      if (!response.ok) return response.text().then(text => { throw new Error(text || `Serverfejl: ${response.status}`) });
      return response.json();
    })
    .then((savedCensor) => {
      console.log('Censor gemt:', savedCensor);
      resetForm();
      setIsFormVisible(false);
      fetchCensorer();
    })
    .catch(error => {
      console.error("Fejl ved gemning af censor:", error);
      setError(`Kunne ikke gemme censor: ${error.message}`);
    });
  };

  const handleDeleteCensor = (idToDelete) => {
    if (!window.confirm(`Sikker på du vil slette censor med ID ${idToDelete}?`)) return;
    setError(null);

    fetch(`${API_BASE_URL}/${idToDelete}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok && response.status !== 204) {
           return response.text().then(text => { throw new Error(text || `Serverfejl: ${response.status}`) });
        }
        console.log(`Censor med ID ${idToDelete} slettet.`);
        fetchCensorer();
      })
      .catch(error => {
        console.error("Fejl ved sletning:", error);
        setError(`Kunne ikke slette censor: ${error.message}`);
      });
  };

  
  return (
    <div>
      {/* --- KNAP TIL AT VISE/SKJULE FORMULAR --- */}
      <div className="toggle-form-container">
        <button
          onClick={() => setIsFormVisible(prev => !prev)}
          className="toggle-form-button"
        >
          {isFormVisible ? 'Skjul Tilføj Censor Formular' : 'Vis Tilføj Censor Formular'}
        </button>
      </div>

      {/* --- FULD CENSOR FORMULAR --- */}
      {isFormVisible && (
          <form onSubmit={handleCensorSubmit} className="add-person-form">
            <h3>Tilføj/Rediger Censor</h3>

            {/* Række 1: Navn */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fornavn">Fornavn:*</label>
                <input type="text" id="fornavn" name="fornavn" value={formState.fornavn} onChange={handleInputChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="efternavn">Efternavn:*</label>
                <input type="text" id="efternavn" name="efternavn" value={formState.efternavn} onChange={handleInputChange} required />
              </div>
            </div>

            {/* Række 2: Adresse */}
             <div className="form-field">
                <label htmlFor="adresse">Adresse:</label>
                <input type="text" id="adresse" name="adresse" value={formState.adresse} onChange={handleInputChange} />
              </div>

            {/* Række 3: Post/By */}
            <div className="form-row">
               <div className="form-field">
                    <label htmlFor="postnummer">Postnummer:</label>
                    <input type="text" id="postnummer" name="postnummer" value={formState.postnummer} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                    <label htmlFor="by">By:</label>
                    <input type="text" id="by" name="by" value={formState.forstad} onChange={handleInputChange} />
                </div>
            </div>

             {/* Række 4: Kontakt */}
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

             {/* Række 5: CPR / Beskikket Til */}
             <div className="form-row">
                 <div className="form-field">
                    <label htmlFor="cpr_nummer">CPR-nummer:</label>
                    <input type="text" id="cpr_nummer" name="cpr_nummer" value={formState.cpr_nummer} onChange={handleInputChange} />
                 </div>
                 <div className="form-field">
                    <label htmlFor="beskikket_til">Beskikket Til:</label>
                    <input type="text" id="beskikket_til" name="beskikket_til" value={formState.beskikket_til} onChange={handleInputChange} />
                 </div>
             </div>

            {/* Række 6: Checkboxes */}
            <div className="form-row"> 
                <div className="form-field-check">
                    <input type="checkbox" id="beskikket_indfodsret" name="beskikket_indfodsret" checked={formState.beskikket_indfodsret} onChange={handleInputChange} />
                    <label htmlFor="beskikket_indfodsret"> Beskikket Indfødsret</label>
                </div>
                <div className="form-field-check">
                    <input type="checkbox" id="beskikket_medborgerskab" name="beskikket_medborgerskab" checked={formState.beskikket_medborgerskab} onChange={handleInputChange} />
                    <label htmlFor="beskikket_medborgerskab"> Beskikket Medborgerskab</label>
                </div>
            </div>

            {/* Række 7: Status/Prioritet/Sprogcenter */}
             <div className="form-row">
                 <div className="form-field">
                    <label htmlFor="arbejds_status">Arbejdsstatus:</label>
                    <input type="text" id="arbejds_status" name="arbejds_status" value={formState.arbejds_status} onChange={handleInputChange} />
                 </div>
                 <div className="form-field">
                    <label htmlFor="prioritet">Prioritet:</label>
                    <input type="number" id="prioritet" name="prioritet" value={formState.prioritet} onChange={handleInputChange} />
                 </div>
                  <div className="form-field">
                    <label htmlFor="sprogcenter_id">Sprogcenter ID:</label>
                    <input type="number" id="sprogcenter_id" name="sprogcenter_id" value={formState.sprogcenter_id} onChange={handleInputChange} />
                 </div>
             </div>

            {/* Række 8: Kommentar */}
            <div className="form-field">
                <label htmlFor="kommentar">Kommentar:</label>
                <textarea id="kommentar" name="kommentar" value={formState.kommentar} onChange={handleInputChange} rows="3"></textarea>
            </div>


            {/* Knapper inde i formen */}
            <div>
              <button type="submit" disabled={loading}>{loading ? 'Gemmer...' : 'Gem Censor'}</button>
              <button type="button" onClick={resetForm} className="reset-button" disabled={loading}>Nulstil Form</button>
            </div>
          </form>
      )}


      {/* --- Fejl og Liste Sektion --- */}
      {error && <p className="error-message">{error}</p>}
      <h2>Eksisterende Censorer</h2>
      {!loading && censorer.length > 0 && (
        <div className="table-container">
          <table className="censor-table">
            <thead>
              <tr>
                <th>ID</th><th>Navn</th><th>Kontakt</th><th>Adresse</th>
                <th>Beskikkelser</th><th>Status</th><th>Noter</th><th>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {censorer.map(censor => (
                <tr key={censor.id} className={censor.arkiveret ? 'archived-row' : ''}>
                  <td>{censor.id}</td>
                  <td><strong>{censor.fornavn} {censor.efternavn}</strong>{censor.cpr_nummer && <><br /><small>CPR: {censor.cpr_nummer}</small></>}</td>
                  <td>{censor.email && <><small>Email: {censor.email}</small><br /></>}{censor.telefon && <small>Tlf: {censor.telefon}</small>}{!censor.email && !censor.telefon && <small>N/A</small>}</td>
                  <td>{censor.adresse && <small>{censor.adresse}</small>}{(censor.postnummer || censor.forstad) && <><br /><small>{censor.postnummer || ''} {censor.forstad || ''}</small></>}{!censor.adresse && !censor.postnummer && !censor.forstad && <small>N/A</small>}</td>
                  <td>{censor.beskikket_til && <><small>Til: {censor.beskikket_til}</small><br/></>}<small>Indf.: {censor.beskikket_indfodsret ? 'Ja' : 'Nej'}</small><br/><small>Medb.: {censor.beskikket_medborgerskab ? 'Ja' : 'Nej'}</small></td>
                  <td>{censor.arbejds_status && <><small>Arbejde: {censor.arbejds_status}</small><br/></>}{censor.prioritet !== null && <><small>Prio: {censor.prioritet}</small><br/></>}{censor.sprogcenter_id !== null && <><small>SprogC ID: {censor.sprogcenter_id}</small><br/></>}</td>
                  <td>{censor.kommentar && <small className="comment-cell">{censor.kommentar}</small>}{!censor.kommentar && <small>-</small>}</td>
                  <td className="action-cell"><button onClick={() => handleDeleteCensor(censor.id)} className="delete-button" title={`Slet ${censor.fornavn} ${censor.efternavn}`}>Slet</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CensorerListe;