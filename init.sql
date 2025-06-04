CREATE TABLE organisationer (
    id SERIAL PRIMARY KEY,
    navn TEXT NOT NULL
);

CREATE TABLE sprogcenter (
    id SERIAL PRIMARY KEY,
    navn TEXT NOT NULL,
    adresse TEXT,
    postnummer VARCHAR(10),
    forstad TEXT,
    telefon VARCHAR(20),
    email TEXT,
    institutionsnummer VARCHAR(20),
    organisations_id INT REFERENCES organisationer(id),
    driftsaftaleperiode TEXT,
    tilsynskommune TEXT,
    udbyder_pd1 BOOLEAN,
    udbyder_pd2 BOOLEAN,
    udbyder_pd3 BOOLEAN,
    udbyder_sp BOOLEAN,
    udbyder_vp BOOLEAN
);

CREATE TABLE censorer (
    id SERIAL PRIMARY KEY,
    fornavn VARCHAR(255) NOT NULL,
    efternavn VARCHAR(255) NOT NULL,
    adresse TEXT,
    postnummer VARCHAR(10),
    forstad VARCHAR(255),
    telefon VARCHAR(20),
    email VARCHAR(255),
    cpr_nummer VARCHAR(15),
    beskikket_til VARCHAR(50),
    beskikket_indfodsret BOOLEAN DEFAULT FALSE,
    beskikket_medborgerskab BOOLEAN DEFAULT FALSE,
    arbejds_status VARCHAR(50),
    prioritet VARCHAR(50),
    sprogcenter_id INT REFERENCES sprogcenter(id),
    kommentar TEXT
);

CREATE TABLE hold (
    id SERIAL PRIMARY KEY,
    deltagere INT NOT NULL,
    termin VARCHAR(255) NOT NULL,
    prøve VARCHAR(10) NOT NULL,
    prøvetype VARCHAR(25) NOT NULL,
    låst BOOLEAN DEFAULT FALSE,
    sprogcenter_id INT REFERENCES sprogcenter(id),
    censorer_id INT REFERENCES censorer(id)
);