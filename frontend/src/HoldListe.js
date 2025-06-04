import React, { useState, useEffect } from 'react';
import Modal from 'react-modal'; // Importer Modal

// Initial form state for Hold
const initialFormState = {
    deltagere: '',
    termin: '', // Vil blive sat af selectedTermin ved submit
    prøve: '',
    prøvetype: '',
    låst: false,
    sprogcenter_id: '',
    censorer_id: ''
};

function HoldListe() {
  const [hold, setHold] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal synlighed

  const [sprogcentreOptions, setSprogcentreOptions] = useState([]);
  const [censorerOptions, setCensorerOptions] = useState([]);
  const [terminOptions, setTerminOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingTerminer, setLoadingTerminer] = useState(true);

  const [selectedTermin, setSelectedTermin] = useState('');
  const [showHoldListe, setShowHoldListe] = useState(false);

  const API_BASE_URL_HOLD = 'http://localhost:3001/api/hold';
  const API_BASE_URL_SPROGCENTRE = 'http://localhost:3001/api/sprogcentre';
  const API_BASE_URL_CENSORER = 'http://localhost:3001/api/censorer';
  const API_BASE_URL_TERMINER = 'http://localhost:3001/api/terminer';

  // Funktioner til at åbne og lukke modal
  const openModal = () => {
    if (!selectedTermin) {
        alert("Vælg venligst en termin først for at tilføje et hold.");
        return;
    }
    resetForm(); // Nulstil formen, men behold den valgte termin
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setError(null); // Ryd fejl når modal lukkes
  };

  // Hent dropdown data ved første mount
  useEffect(() => {
    const fetchInitialDropdownData = async () => {
      setLoadingOptions(true);
      setLoadingTerminer(true);
      setError(null);
      try {
        const [sprogcentreRes, censorerRes, terminerRes] = await Promise.all([
          fetch(API_BASE_URL_SPROGCENTRE),
          fetch(API_BASE_URL_CENSORER),
          fetch(API_BASE_URL_TERMINER)
        ]);
        if (!sprogcentreRes.ok) throw new Error(`Sprogcentre: ${sprogcentreRes.statusText || sprogcentreRes.status}`);
        if (!censorerRes.ok) throw new Error(`Censorer: ${censorerRes.statusText || censorerRes.status}`);
        if (!terminerRes.ok) throw new Error(`Terminer: ${terminerRes.statusText || terminerRes.status}`);

        const sprogcentreData = await sprogcentreRes.json();
        const censorerData = await censorerRes.json();
        const terminerData = await terminerRes.json();

        setSprogcentreOptions(sprogcentreData);
        setCensorerOptions(censorerData);
        setTerminOptions(terminerData);
      } catch (error) {
        console.error("Fejl dropdown data:", error);
        setError(error.message);
      } finally {
        setLoadingOptions(false);
        setLoadingTerminer(false);
      }
    };
    fetchInitialDropdownData();
  }, []);

  // Hent hold når en termin vælges
  const fetchHoldByTermin = async (terminToFetch) => {
    if (!terminToFetch) {
      setHold([]);
      setShowHoldListe(false);
      return;
    }
    setLoading(true);
    setError(null);
    setShowHoldListe(true);
    try {
      const url = `${API_BASE_URL_HOLD}?termin=${encodeURIComponent(terminToFetch)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Netværksfejl hold: ${response.statusText || response.status}`);
      const data = await response.json();
      setHold(data);
    } catch (error) {
      console.error("Fejl hent hold for termin:", error);
      setError(`Kunne ikke hente hold for ${terminToFetch}: ${error.message}`);
      setHold([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTermin) {
      fetchHoldByTermin(selectedTermin);
    } else {
      setHold([]);
      setShowHoldListe(false);
    }
  }, [selectedTermin]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTerminChange = (event) => {
    setSelectedTermin(event.target.value);
  };

  const resetForm = () => {
    setFormState({
      ...initialFormState, // Nulstil alle felter
    });
  };

  const handleHoldSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Ryd fejl før submit

    const deltagereInt = parseInt(formState.deltagere, 10);
    if (isNaN(deltagereInt) || deltagereInt < 0) {
      setError('Antal deltagere skal være et gyldigt positivt tal eller nul.'); // Sæt fejl i modal
      return;
    }
    if (!selectedTermin || !formState.prøve.trim() || !formState.prøvetype.trim()) {
      setError('En termin skal være valgt, og Prøve samt Prøvetype er påkrævede felter.'); // Sæt fejl i modal
      return;
    }

    const holdData = {
      deltagere: deltagereInt,
      termin: selectedTermin,
      prøve: formState.prøve.trim(),
      prøvetype: formState.prøvetype.trim(),
      låst: formState.låst,
      sprogcenter_id: formState.sprogcenter_id ? parseInt(formState.sprogcenter_id, 10) : null,
      censorer_id: formState.censorer_id ? parseInt(formState.censorer_id, 10) : null,
    };
    if (isNaN(holdData.sprogcenter_id)) holdData.sprogcenter_id = null;
    if (isNaN(holdData.censorer_id)) holdData.censorer_id = null;

    const submitButton = event.target.querySelector('button[type="submit"]');
    if(submitButton) submitButton.disabled = true; // Deaktiver knap under submit

    try {
      const response = await fetch(API_BASE_URL_HOLD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holdData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Serverfejl: ${response.status}`);
      }
      const savedHold = await response.json();
      console.log('Hold gemt:', savedHold);
      closeModal();
      await fetchHoldByTermin(selectedTermin);
    } catch (error) {
      console.error("Fejl ved gemning af hold:", error);
      setError(`Kunne ikke gemme hold: ${error.message}`); // Fejl vises i modal
    } finally {
      if(submitButton) submitButton.disabled = false; // Genaktiver knap
    }
  };

  const handleDeleteHold = async (idToDelete) => {
    if (!window.confirm(`Sikker på du vil slette hold med ID ${idToDelete}?`)) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL_HOLD}/${idToDelete}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(errorText || `Serverfejl: ${response.status}`);
      }
      console.log(`Hold med ID ${idToDelete} slettet.`);
      await fetchHoldByTermin(selectedTermin);
    } catch (error) {
      console.error("Fejl ved sletning:", error);
      setError(`Kunne ikke slette hold: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (holdId) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL_HOLD}/${holdId}/togglelock`, { method: 'PATCH' });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Serverfejl: ${response.status} ved lås/aflås`);
      }
      const updatedHoldFromServer = await response.json();
      setHold(prevHold => prevHold.map(h => h.id === holdId ? updatedHoldFromServer : h));
      console.log(`Hold med ID ${holdId} låsestatus opdateret til: ${updatedHoldFromServer.låst}`);
    } catch (error) {
      console.error("Fejl ved opdatering af låsestatus:", error);
      setError(`Kunne ikke opdatere låsestatus: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="termin-selector-container form-field">
        <label htmlFor="terminSelect">Vælg Termin:</label>
        <select id="terminSelect" value={selectedTermin} onChange={handleTerminChange} disabled={loadingTerminer}>
          <option value="">-- Vælg en Termin --</option>
          {loadingTerminer ? (<option disabled>Henter terminer...</option>) : (terminOptions.map(termin => (<option key={termin} value={termin}>{termin}</option>)))}
        </select>
      </div>

      {selectedTermin && showHoldListe && (
        <>
          <div className="toggle-form-container">
            <button onClick={openModal} className="toggle-form-button" disabled={!selectedTermin || loadingTerminer || loadingOptions}>
              {`Tilføj Nyt Hold (${selectedTermin})`}
            </button>
          </div>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Tilføj Hold Formular"
            className="ReactModal__Content"
            overlayClassName="ReactModal__Overlay"
          >
            <form onSubmit={handleHoldSubmit} className="modal-form">
              <h3>Tilføj nyt hold for Termin: {selectedTermin}</h3>
              {error && <p className="error-message" style={{marginBottom: '15px'}}>{error}</p>}

              <input type="hidden" name="termin" value={selectedTermin} />

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="deltagereModal">Antal Deltagere:*</label>
                  <input type="number" id="deltagereModal" name="deltagere" value={formState.deltagere} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-field">
                  <label htmlFor="prøveModal">Prøve:*</label>
                  <input type="text" id="prøveModal" name="prøve" value={formState.prøve} onChange={handleInputChange} required placeholder="f.eks. PD1, PD2"/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="prøvetypeModal">Prøvetype:*</label>
                  <input type="text" id="prøvetypeModal" name="prøvetype" value={formState.prøvetype} onChange={handleInputChange} required placeholder="f.eks. Mundtlig, Skriftlig" />
                </div>
                <div className="form-field">
                    <label htmlFor="sprogcenter_idModal">Sprogcenter:</label>
                    <select id="sprogcenter_idModal" name="sprogcenter_id" value={formState.sprogcenter_id} onChange={handleInputChange} disabled={loadingOptions}>
                        <option value="">-- Vælg Sprogcenter (valgfrit) --</option>
                        {loadingOptions ? <option disabled>Henter...</option> : sprogcentreOptions.map(sc => (<option key={sc.id} value={sc.id}>{sc.navn} (ID: {sc.id})</option>))}
                    </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                    <label htmlFor="censorer_idModal">Censor:</label>
                    <select id="censorer_idModal" name="censorer_id" value={formState.censorer_id} onChange={handleInputChange} disabled={loadingOptions}>
                        <option value="">-- Vælg Censor (valgfrit) --</option>
                        {loadingOptions ? <option disabled>Henter...</option> : censorerOptions.map(censor => (<option key={censor.id} value={censor.id}>{censor.fornavn} {censor.efternavn} (ID: {censor.id})</option>))}
                    </select>
                </div>
                <div className="form-field-check" style={{ alignSelf: 'flex-end', paddingBottom: '10px' }}>
                    <input type="checkbox" id="låstModal" name="låst" checked={formState.låst} onChange={handleInputChange} />
                    <label htmlFor="låstModal"> Låst</label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={loadingOptions}>
                  {loadingOptions ? 'Arbejder...' : 'Gem Hold'}
                </button>
                <button type="button" onClick={closeModal} className="cancel-button">
                  Annuller
                </button>
              </div>
            </form>
          </Modal>

          {error && !modalIsOpen && <p className="error-message">{error}</p>}
          <h2>Eksisterende Hold for {selectedTermin}</h2>
          {loading && <p className="info-message">Henter hold...</p>}
          {!loading && hold.length === 0 && !error && ( <p className="info-message">Ingen hold fundet for denne termin.</p> )}
          {!loading && hold.length > 0 && (
            <div className="table-container">
              <table className="censor-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Termin</th><th>Prøve</th><th>Type</th><th>Delt.</th>
                    <th>Låst</th><th>Sprogcenter</th><th>Censor</th><th className="action-cell">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {hold.map(h => (
                    <tr key={h.id}>
                      <td>{h.id}</td><td>{h.termin}</td><td>{h.prøve}</td><td>{h.prøvetype}</td><td>{h.deltagere}</td>
                      <td>{h.låst ? 'Ja' : 'Nej'}</td><td>{h.sprogcenter ? h.sprogcenter.navn : 'N/A'}</td>
                      <td>{h.censor ? `${h.censor.fornavn} ${h.censor.efternavn}` : 'N/A'}</td>
                      <td className="action-cell">
                          <button onClick={() => handleToggleLock(h.id)} className={h.låst ? "unlock-button" : "lock-button"} title={h.låst ? `Aflås hold ${h.id}` : `Lås hold ${h.id}`} style={{ marginRight: '5px' }}>{h.låst ? 'Aflås' : 'Lås'}</button>
                          <button onClick={() => handleDeleteHold(h.id)} className="delete-button" title={`Slet hold ${h.id} (${h.termin})`}>Slet</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {!selectedTermin && !loadingTerminer && !error && <p className="info-message">Vælg en termin ovenfor for at se og tilføje hold.</p>}
      {error && !selectedTermin && <p className="error-message">{error}</p>}
    </div>
  );
}

export default HoldListe;