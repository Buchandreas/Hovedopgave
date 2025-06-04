const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001; // Backend port

// Database Konfiguration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb', // Databasenavn
  password: 'admin',  // Kodeord
  port: 5432,         // Postgres standard port
});

// Middleware
app.use(cors());
app.use(express.json());



// ----- Censorer API Endpoints -----
app.get('/api/censorer', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM censorer ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Database fejl (GET /api/censorer):', err);
    res.status(500).send('Serverfejl ved hentning af censorer');
  }
});

app.post('/api/censorer', async (req, res) => {
  const {
    fornavn, efternavn, adresse, postnummer, forstad, telefon, email,
    cpr_nummer, beskikket_til, beskikket_indfodsret, beskikket_medborgerskab,
    arbejds_status, prioritet, sprogcenter_id, kommentar
  } = req.body;

  if (!fornavn || !efternavn) {
    return res.status(400).send('Fejl: "fornavn" og "efternavn" er påkrævede');
  }

  const insertQuery = `
    INSERT INTO censorer (
      fornavn, efternavn, adresse, postnummer, forstad, telefon, email,
      cpr_nummer, beskikket_til, beskikket_indfodsret, beskikket_medborgerskab,
      arbejds_status, prioritet, sprogcenter_id, kommentar
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`;
  const values = [
    fornavn, efternavn, adresse || null, postnummer || null, forstad || null, telefon || null, email || null,
    cpr_nummer || null, beskikket_til || null,
    typeof beskikket_indfodsret === 'boolean' ? beskikket_indfodsret : false,
    typeof beskikket_medborgerskab === 'boolean' ? beskikket_medborgerskab : false,
    arbejds_status || null, typeof prioritet === 'number' ? prioritet : null,
    typeof sprogcenter_id === 'number' ? sprogcenter_id : null, kommentar || null
  ];

  try {
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database fejl (POST /api/censorer):', err);
    res.status(500).send('Serverfejl ved oprettelse af censor');
  }
});

app.delete('/api/censorer/:id', async (req, res) => {
  const { id } = req.params;
  const censorId = parseInt(id, 10);
  if (isNaN(censorId)) return res.status(400).send('Fejl: Ugyldigt ID format.');

  try {
    const result = await pool.query('DELETE FROM censorer WHERE id = $1', [censorId]);
    if (result.rowCount === 0) return res.status(404).send(`Fejl: Censor med ID ${censorId} blev ikke fundet.`);
    res.sendStatus(204);
  } catch (err) {
    console.error(`Database fejl (DELETE /api/censorer/${censorId}):`, err);
    res.status(500).send('Serverfejl under sletning af censor.');
  }
});



// ----- Sprogcenter API Endpoints -----
app.get('/api/sprogcentre', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sprogcenter ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Database fejl (GET /api/sprogcentre):', err);
    res.status(500).send('Serverfejl ved hentning af sprogcentre');
  }
});

app.post('/api/sprogcentre', async (req, res) => {
  const {
    navn, adresse, postnummer, forstad, telefon, email, institutionsnummer,
    organisations_id, driftsaftaleperiode, tilsynskommune, udbyder_pd1,
    udbyder_pd2, udbyder_pd3, udbyder_sp, udbyder_vp
  } = req.body;

  if (!navn) return res.status(400).send('Fejl: "navn" er påkrævet for sprogcenter');

  const insertQuery = `
    INSERT INTO sprogcenter (
      navn, adresse, postnummer, forstad, telefon, email, institutionsnummer,
      organisations_id, driftsaftaleperiode, tilsynskommune, udbyder_pd1,
      udbyder_pd2, udbyder_pd3, udbyder_sp, udbyder_vp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`;
  const values = [
    navn, adresse || null, postnummer || null, forstad || null, telefon || null, email || null, institutionsnummer || null,
    typeof organisations_id === 'number' ? organisations_id : null,
    driftsaftaleperiode || null, tilsynskommune || null,
    typeof udbyder_pd1 === 'boolean' ? udbyder_pd1 : false,
    typeof udbyder_pd2 === 'boolean' ? udbyder_pd2 : false,
    typeof udbyder_pd3 === 'boolean' ? udbyder_pd3 : false,
    typeof udbyder_sp === 'boolean' ? udbyder_sp : false,
    typeof udbyder_vp === 'boolean' ? udbyder_vp : false
  ];

  try {
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database fejl (POST /api/sprogcentre):', err);
    res.status(500).send('Serverfejl ved oprettelse af sprogcenter');
  }
});

app.delete('/api/sprogcentre/:id', async (req, res) => {
  const { id } = req.params;
  const sprogcenterId = parseInt(id, 10);
  if (isNaN(sprogcenterId)) return res.status(400).send('Fejl: Ugyldigt ID format.');

  try {
    const result = await pool.query('DELETE FROM sprogcenter WHERE id = $1', [sprogcenterId]);
    if (result.rowCount === 0) return res.status(404).send(`Fejl: Sprogcenter med ID ${sprogcenterId} blev ikke fundet.`);
    res.sendStatus(204);
  } catch (err) {
    console.error(`Database fejl (DELETE /api/sprogcentre/${sprogcenterId}):`, err);
    res.status(500).send('Serverfejl under sletning af sprogcenter.');
  }
});



// ----- Organisationer API Endpoints -----
app.get('/api/organisationer', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, navn FROM organisationer ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Database fejl (GET /api/organisationer):', err);
    res.status(500).send('Serverfejl ved hentning af organisationer');
  }
});

app.post('/api/organisationer', async (req, res) => {
  const { navn } = req.body;
  if (!navn || navn.trim() === '') return res.status(400).send('Fejl: "navn" er påkrævet for organisation');

  try {
    const result = await pool.query('INSERT INTO organisationer (navn) VALUES ($1) RETURNING *;', [navn.trim()]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database fejl (POST /api/organisationer):', err);
    res.status(500).send('Serverfejl ved oprettelse af organisation');
  }
});

app.delete('/api/organisationer/:id', async (req, res) => {
  const { id } = req.params;
  const organisationId = parseInt(id, 10);
  if (isNaN(organisationId)) return res.status(400).send('Fejl: Ugyldigt ID format.');

  try {
    const result = await pool.query('DELETE FROM organisationer WHERE id = $1', [organisationId]);
    if (result.rowCount === 0) return res.status(404).send(`Fejl: Organisation med ID ${organisationId} blev ikke fundet.`);
    res.sendStatus(204);
  } catch (err) {
    console.error(`Database fejl (DELETE /api/organisationer/${organisationId}):`, err);
    res.status(500).send('Serverfejl under sletning af organisation.');
  }
});



// ----- Hold API Endpoints -----
app.get('/api/hold', async (req, res) => {
  const { termin } = req.query;
  try {
    let queryText = `
      SELECT
        h.id AS hold_id, h.deltagere, h.termin, h.prøve, h.prøvetype, h.låst,
        s.id AS sprogcenter_id, s.navn AS sprogcenter_navn,
        c.id AS censor_id, c.fornavn AS censor_fornavn, c.efternavn AS censor_efternavn
      FROM hold h
      LEFT JOIN sprogcenter s ON h.sprogcenter_id = s.id
      LEFT JOIN censorer c ON h.censorer_id = c.id
    `;
    const queryParams = [];

    if (termin) {
      queryText += ' WHERE h.termin = $1';
      queryParams.push(termin);
      queryText += ' ORDER BY h.id ASC;';
    } else {
      queryText += ' ORDER BY h.id ASC;';
    }

    const result = await pool.query(queryText, queryParams);
    const holdMedNavne = result.rows.map(row => ({
        id: row.hold_id, deltagere: row.deltagere, termin: row.termin, prøve: row.prøve,
        prøvetype: row.prøvetype, låst: row.låst,
        sprogcenter: row.sprogcenter_id ? { id: row.sprogcenter_id, navn: row.sprogcenter_navn } : null,
        censor: row.censor_id ? { id: row.censor_id, fornavn: row.censor_fornavn, efternavn: row.censor_efternavn } : null
    }));
    res.json(holdMedNavne);
  } catch (err) {
    console.error('Database fejl (GET /api/hold med JOINs og termin):', err);
    res.status(500).send('Serverfejl ved hentning af hold');
  }
});

app.post('/api/hold', async (req, res) => {
  const {
    deltagere, termin, prøve, prøvetype, låst, sprogcenter_id, censorer_id
  } = req.body;

  if (deltagere === undefined || deltagere === null || typeof deltagere !== 'number' || !termin || !prøve || !prøvetype) {
    return res.status(400).send('Fejl: "deltagere" (som tal), "termin", "prøve" og "prøvetype" er påkrævede');
  }

  const insertQuery = `
    INSERT INTO hold (deltagere, termin, prøve, prøvetype, låst, sprogcenter_id, censorer_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
  const values = [
    deltagere, termin, prøve, prøvetype,
    typeof låst === 'boolean' ? låst : false,
    typeof sprogcenter_id === 'number' ? sprogcenter_id : null,
    typeof censorer_id === 'number' ? censorer_id : null
  ];

  try {
    const result = await pool.query(insertQuery, values);
    // For at returnere det nye hold med joinede navne
    const newHoldId = result.rows[0].id;
    const newHoldQuery = `
        SELECT h.id AS hold_id, h.deltagere, h.termin, h.prøve, h.prøvetype, h.låst,
               s.id AS sprogcenter_id, s.navn AS sprogcenter_navn,
               c.id AS censor_id, c.fornavn AS censor_fornavn, c.efternavn AS censor_efternavn
        FROM hold h
        LEFT JOIN sprogcenter s ON h.sprogcenter_id = s.id
        LEFT JOIN censorer c ON h.censorer_id = c.id
        WHERE h.id = $1;
    `;
    const newHoldResult = await pool.query(newHoldQuery, [newHoldId]);
    if (newHoldResult.rows.length > 0) {
        const holdMedNavne = {
            id: newHoldResult.rows[0].hold_id, deltagere: newHoldResult.rows[0].deltagere, termin: newHoldResult.rows[0].termin, prøve: newHoldResult.rows[0].prøve,
            prøvetype: newHoldResult.rows[0].prøvetype, låst: newHoldResult.rows[0].låst,
            sprogcenter: newHoldResult.rows[0].sprogcenter_id ? { id: newHoldResult.rows[0].sprogcenter_id, navn: newHoldResult.rows[0].sprogcenter_navn } : null,
            censor: newHoldResult.rows[0].censor_id ? { id: newHoldResult.rows[0].censor_id, fornavn: newHoldResult.rows[0].censor_fornavn, efternavn: newHoldResult.rows[0].censor_efternavn } : null
        };
        res.status(201).json(holdMedNavne);
    } else {
        res.status(201).json(result.rows[0]); // Fallback til rå data hvis join fejler
    }
  } catch (err) {
    console.error('Database fejl (POST /api/hold):', err);
    if (err.code === '23503') {
        res.status(400).send(`Serverfejl: Kunne ikke oprette hold. Tjek om sprogcenter_id (${sprogcenter_id}) eller censorer_id (${censorer_id}) eksisterer.`);
    } else {
        res.status(500).send('Serverfejl ved oprettelse af hold');
    }
  }
});

app.delete('/api/hold/:id', async (req, res) => {
  const { id } = req.params;
  const holdId = parseInt(id, 10);
  if (isNaN(holdId)) return res.status(400).send('Fejl: Ugyldigt ID format.');

  try {
    const result = await pool.query('DELETE FROM hold WHERE id = $1', [holdId]);
    if (result.rowCount === 0) return res.status(404).send(`Fejl: Hold med ID ${holdId} blev ikke fundet.`);
    res.sendStatus(204);
  } catch (err) {
    console.error(`Database fejl (DELETE /api/hold/${holdId}):`, err);
    res.status(500).send('Serverfejl under sletning af hold.');
  }
});

app.patch('/api/hold/:id/togglelock', async (req, res) => {
  const { id } = req.params;
  const holdId = parseInt(id, 10);
  if (isNaN(holdId)) return res.status(400).send('Fejl: Ugyldigt ID format.');

  try {
    const currentHold = await pool.query('SELECT låst FROM hold WHERE id = $1', [holdId]);
    if (currentHold.rows.length === 0) return res.status(404).send(`Fejl: Hold med ID ${holdId} blev ikke fundet.`);

    const newLockStatus = !currentHold.rows[0].låst;
    await pool.query('UPDATE hold SET låst = $1 WHERE id = $2', [newLockStatus, holdId]);

    const updatedHoldWithDetailsQuery = `
      SELECT
        h.id AS hold_id, h.deltagere, h.termin, h.prøve, h.prøvetype, h.låst,
        s.id AS sprogcenter_id, s.navn AS sprogcenter_navn,
        c.id AS censor_id, c.fornavn AS censor_fornavn, c.efternavn AS censor_efternavn
      FROM hold h
      LEFT JOIN sprogcenter s ON h.sprogcenter_id = s.id
      LEFT JOIN censorer c ON h.censorer_id = c.id
      WHERE h.id = $1;`;
    const finalResult = await pool.query(updatedHoldWithDetailsQuery, [holdId]);

    if (finalResult.rows.length === 0) return res.status(404).send('Fejl: Kunne ikke finde det opdaterede hold.');

    const mappedUpdatedHold = {
        id: finalResult.rows[0].hold_id, deltagere: finalResult.rows[0].deltagere, termin: finalResult.rows[0].termin,
        prøve: finalResult.rows[0].prøve, prøvetype: finalResult.rows[0].prøvetype, låst: finalResult.rows[0].låst,
        sprogcenter: finalResult.rows[0].sprogcenter_id ? { id: finalResult.rows[0].sprogcenter_id, navn: finalResult.rows[0].sprogcenter_navn } : null,
        censor: finalResult.rows[0].censor_id ? { id: finalResult.rows[0].censor_id, fornavn: finalResult.rows[0].censor_fornavn, efternavn: finalResult.rows[0].censor_efternavn } : null
    };
    res.status(200).json(mappedUpdatedHold);
  } catch (err) {
    console.error(`Database fejl (PATCH /api/hold/${holdId}/togglelock):`, err);
    res.status(500).send('Serverfejl under opdatering af låsestatus.');
  }
});



// ----- Terminer API Endpoint -----
app.get('/api/terminer', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT termin FROM hold ORDER BY termin DESC');
    const terminer = result.rows.map(row => row.termin);
    res.json(terminer);
  } catch (err) {
    console.error('Database fejl (GET /api/terminer):', err);
    res.status(500).send('Serverfejl ved hentning af terminer');
  }
});

// Starter serveren
app.listen(port, () => {
  console.log(`Backend server kører på http://localhost:${port}`);
});