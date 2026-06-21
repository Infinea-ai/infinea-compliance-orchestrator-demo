# Infinea AuditMate MVP

Web application per monitorare la compliance formativa salute e sicurezza in aziende clienti diverse, con account centralizzati, dati separati per azienda e dashboard aggiornata da import Excel/CSV.

## Versione v0.4.5

Questa versione introduce:

- login unico con email e password;
- apertura automatica del pannello corretto in base al ruolo dell'utente;
- workspace separati per ogni azienda cliente;
- pannello Infinea `Clienti` per creare, aprire e rimuovere aziende;
- import dati aziendali da Excel/CSV;
- dashboard, dipendenti, gap, matrice regole, carica attestato e report.

## Flusso Accesso

Tutti accedono dalla stessa schermata:

```text
Email
Password
```

Dopo il login, il sistema decide automaticamente:

```text
Utente Infinea -> pannello manager
Utente cliente -> workspace della propria azienda
```

Il cliente non deve indicare il nome della societa nella schermata di login.

## Flusso Manager Infinea

Dal pannello `Clienti`, il manager Infinea puo:

- creare un nuovo workspace cliente;
- impostare email e password iniziale dell'admin cliente;
- aprire il workspace di un cliente;
- eliminare un cliente;
- verificare stato dati, utenti e import.

Nel form di creazione cliente il campo `Azienda cliente` serve solo a identificare il workspace nel pannello Infinea. Non e una credenziale di accesso.

## Flusso Cliente

Il cliente accede con email e password.

Se l'account e autorizzato, l'app apre il workspace dell'azienda associata. Ogni azienda vede solo i propri dati.

Ogni workspace parte vuoto. I dati vengono popolati tramite import.

## Import Dati

Schema consigliato:

- `Employee Registry`: dipendenti e ruolo assegnato;
- `Role Obligation Matrix`: corsi obbligatori per ruolo;
- `Certificate Repository`: stato reale degli attestati per dipendente e corso.

L'app incrocia i dati cosi:

```text
dipendente -> ruolo
ruolo -> corsi obbligatori
dipendente -> corsi obbligatori attesi
attestati presenti -> stato compliance
```

Dopo l'import, la dashboard viene aggiornata con:

- obblighi conformi;
- obblighi in scadenza;
- obblighi non conformi;
- criticita per dipendente;
- gap per reparto/corso;
- report manageriale.

## Sicurezza MVP

La versione attuale prevede:

- account centralizzati;
- separazione dei dati per azienda;
- ruoli distinti tra Infinea e cliente;
- password non salvate in chiaro;
- accesso negato con messaggio generico in caso di credenziali errate;
- regole lato database per impedire a un cliente di vedere dati di altre aziende.

## Limiti Noti

Questa versione e pronta per demo/pilota controllato, ma non ancora per produzione enterprise completa.

Mancano ancora:

- inviti email automatici;
- reset password avanzato lato prodotto;
- ruoli cliente dettagliati, per esempio admin, editor e sola lettura;
- audit log delle azioni importanti;
- pannello privacy/configurazione aziendale;
- report PDF/Word rifinito per consegna ufficiale.

## File Principali

- `index.html`: struttura dell'app.
- `styles.css`: interfaccia e stile Infinea.
- `app.js`: UI, login, dashboard e flussi compliance.
- `importer.js`: lettura Excel/CSV e normalizzazione.
- file backend/configurazione: collegamento al database centrale e regole di accesso.
