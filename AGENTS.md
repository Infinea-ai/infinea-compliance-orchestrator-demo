# AGENTS.md - Infinea AuditMate

## Scopo

Questo repository contiene l'MVP di Infinea AuditMate, una web application statica per compliance formativa salute e sicurezza, con login centralizzato, workspace cliente separati e import dati da Excel/CSV.

## Architettura Attuale

- L'app principale vive nella cartella `mvp/`.
- I file nella root del repository sono legacy/sito precedente: non modificarli salvo richiesta esplicita.
- L'MVP e' una app HTML/CSS/JavaScript vanilla, senza framework e senza build step.
- `mvp/index.html` carica direttamente:
  - `supabase-config.js`
  - `supabase-adapter.js`
  - `importer.js`
  - `app.js`
- Mantenere compatibilita' con deploy statico tipo GitHub Pages.

## File Centrali

- `mvp/app.js`: UI, stato applicazione, login, dashboard, compliance engine, upload attestati.
- `mvp/importer.js`: parser Excel/CSV, normalizzazione colonne, generazione obblighi, validazione import.
- `mvp/supabase-adapter.js`: collegamento al backend centrale, auth, lettura/scrittura dati per azienda.
- `mvp/supabase-schema.sql`: schema database, funzioni e regole di isolamento dati.
- `mvp/styles.css`: stile UI Infinea.
- `mvp/README.md`: documentazione prodotto ad alto livello, non guida tecnica dettagliata del backend.

## Modello Dati Interno

Preservare la struttura `source`:

- `meta`
- `employees`
- `roleObligationMatrix`
- `requiredObligations`
- `certificateRepository`
- `quality`

Preservare i nomi colonna standard:

- `Employee ID`
- `Nome`
- `Cognome`
- `Reparto`
- `Mansione`
- `Role ID`
- `Course ID`
- `Corso obbligatorio`
- `Required Obligation ID`
- `Certificate ID`
- `Certificate Presence`
- `Issue Date`
- `Expiry Date`
- `Evidence File`

Questi nomi sono un contratto tra import, dashboard, upload attestato e persistenza backend.

## Import Excel/CSV

Non sostituire la logica di import senza motivo. L'import attuale:

- accetta Excel/CSV;
- riconosce fogli/colonne tramite header e alias;
- supporta Employee Registry, Role Obligation Matrix e Certificate Repository;
- genera Required Obligations quando mancano;
- normalizza date e campi numerici;
- produce errori bloccanti e warning.

Ogni modifica all'import deve preservare questi comportamenti.

## Compliance Engine

La compliance e' calcolata in modo deterministico da:

- dipendente;
- ruolo/mansione/reparto;
- matrice ruolo-corso;
- obblighi richiesti;
- attestati presenti;
- date di scadenza.

Non usare AI come fonte autonoma della compliance. L'AI puo' aiutare solo per spiegazioni, estrazione o supporto operativo.

## Backend E Sicurezza

- Ogni dato cliente deve restare associato a `organization_id`.
- Non introdurre letture/scritture cross-tenant.
- Non mostrare errori login specifici su email, password, utente non confermato o provider backend.
- Non inserire service role key o segreti nel frontend.
- Non indebolire Row Level Security o policy senza richiesta esplicita.
- La chiave anon pubblica puo' essere nel frontend; chiavi privilegiate no.

## UI E Prodotto

- Login unico: email e password.
- Non reintrodurre tab `Cliente/Manager` nel login.
- Il sistema decide il workspace in base a ruolo e membership.
- Il nome azienda serve solo per identificare il workspace nel pannello manager, non per il login.
- Preservare palette e stile Infinea esistenti.

## Persistenza

- L'import oggi salva i dati compliance con strategia full-replace per azienda.
- Non trasformare il database principale in localStorage.
- localStorage puo' restare per preferenze UI/sessione locale, ma non come fonte principale dei dati cliente.

## Regole Operative

- Prima di modificare, leggere i file interessati.
- Usare `rg` per cercare nel repository.
- Non aggiungere dipendenze, framework o build tool senza richiesta esplicita.
- Non fare push su GitHub senza richiesta esplicita.
- Dopo modifiche JS, verificare almeno:
  - `node --check app.js`
  - `node --check importer.js`
  - `node --check supabase-adapter.js`
- Per modifiche UI rilevanti, verificare in browser login, manager e cliente.
