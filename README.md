# Infinea AuditMate MVP

Applicazione statica per monitorare la compliance formativa salute e sicurezza.

Questa versione parte da database vuoto: i dati non sono piu precaricati nel codice.

## Accesso locale

All'apertura l'app mostra una schermata di accesso locale.

- Al primo utilizzo si crea un account demo con azienda, email e password.
- L'account e la sessione vengono salvati nel `localStorage` del browser.
- Il pulsante `Esci` chiude la sessione locale.
- Questa protezione serve per simulare il prodotto: non sostituisce un'autenticazione reale backend.

In produzione l'accesso locale andra sostituito con autenticazione server, per esempio Supabase Auth.

## Flusso dati

1. Apri `index.html`.
2. Vai in `Importa dati`.
3. Carica uno o piu file `.xlsx` / `.csv`.
4. L'importatore legge, normalizza e valida i dati.
5. Il database locale del browser viene popolato.
6. Dashboard, dipendenti, gap, matrice e report vengono ricalcolati.

## Schema dati consigliato

Lo schema consigliato usa tre blocchi non ridondanti:

- `Employee Registry`: dipendenti e ruolo assegnato.
- `Role Obligation Matrix`: corsi obbligatori per ogni ruolo.
- `Certificate Repository`: stato reale degli attestati per dipendente e corso.

L'app genera automaticamente gli obblighi richiesti incrociando:

```text
Employee Registry
dipendente -> ruolo

Role Obligation Matrix
ruolo -> corsi obbligatori

Risultato interno
dipendente -> corsi obbligatori
```

Il file `Certificate Repository` viene poi collegato agli obblighi generati tramite:

```text
Employee ID + Course ID
```

Il vecchio file `Required Obligations` resta supportato come input opzionale, ma non e piu necessario per il flusso standard.

I file possono essere:

- un unico workbook Excel con piu fogli;
- piu file Excel separati;
- piu file CSV separati.

## Database locale

In questa fase di sviluppo il database e salvato nel `localStorage` del browser.

Questo significa:

- i dati restano nel browser usato per importarli;
- non vengono ancora inviati a un backend remoto;
- il pulsante `Svuota database locale` cancella il dataset importato;
- in produzione questa struttura sara sostituita da backend, autenticazione e database multi-cliente.

## Backend futuro

La destinazione naturale e:

- frontend su Vercel;
- autenticazione e database su Supabase/Postgres;
- storage attestati su Supabase Storage;
- separazione dati per azienda tramite `organization_id`.

## Logica compliance

Alla data di controllo selezionata:

- `Valido`: attestato presente e scadenza oltre 90 giorni.
- `In scadenza 90g/60g/30g`: attestato presente, ancora valido, ma da monitorare.
- `Scaduto`: attestato presente con scadenza precedente alla data di controllo.
- `Mancante`: obbligo richiesto senza attestato presente.
- `Metadata incompleti`: attestato presente ma non verificabile per dati mancanti.

Gli obblighi in scadenza sono considerati compliant alla data del controllo, ma entrano nella lista alert.
