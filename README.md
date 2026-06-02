# Infinea AuditMate MVP

Prima versione statica dell'app per monitorare la compliance formativa salute e sicurezza.

## Contenuto

- `index.html`: applicazione web.
- `styles.css`: layout e design system.
- `app.js`: motore compliance, viste, filtri ed export.
- `data/compliance-data.js`: dati normalizzati dai quattro Excel caricati.

## Logica compliance

Alla data di controllo selezionata:

- `Valido`: attestato presente e scadenza oltre 90 giorni.
- `In scadenza 90g/60g/30g`: attestato presente, ancora valido, ma da monitorare.
- `Scaduto`: attestato presente con scadenza precedente alla data di controllo.
- `Mancante`: obbligo richiesto senza attestato presente.
- `Metadata incompleti`: attestato presente ma non verificabile per dati mancanti.

Gli obblighi in scadenza sono considerati compliant alla data del controllo, ma entrano nella lista alert.

## Caricamento corso concluso

La vista `Carica attestato` permette di selezionare un dipendente non compliant, scegliere l'obbligo aperto, registrare data corso, scadenza, ente formatore, note e nome del documento evidenza.

Nel primo MVP il caricamento e salvato nel `localStorage` del browser e viene usato subito dal motore compliance per ricalcolare stato dipendente, gap e report. In una versione backend, lo stesso flusso diventera upload reale del file attestato e scrittura persistente su database.
