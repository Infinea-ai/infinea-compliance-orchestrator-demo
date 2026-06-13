# Infinea AuditMate MVP

Applicazione statica per monitorare la compliance formativa salute e sicurezza con account centralizzati e database Supabase.

## Versione v0.4.0

Questa versione sostituisce l'account locale con:

- accesso manager Infinea;
- accesso cliente con nome, email e password creati dal manager;
- dati salvati su Supabase/Postgres per singola azienda;
- pannello manager `Clienti` per creare, aprire e rimuovere clienti.

## Setup Supabase

1. Crea un progetto Supabase free.
2. In `Authentication > Providers > Email`, per l'MVP disattiva `Confirm email`. Se resta attivo, il primo accesso cliente viene bloccato da Supabase finche l'utente non conferma l'email.
3. Vai in `SQL Editor`.
4. Incolla ed esegui tutto il file `supabase-schema.sql`.
5. Crea il primo utente manager in `Authentication > Users`.
6. Esegui questa query, sostituendo email e user id del manager:

```sql
insert into public.profiles (id, email, role)
values ('USER_ID_DA_AUTH_USERS', 'manager@infinea.ai', 'manager')
on conflict (id) do update set role = 'manager', email = excluded.email;
```

7. Copia `Project URL` e `anon public key` da `Project Settings > API`.
8. Inseriscili in `supabase-config.js`:

```js
window.INFINEA_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

## Flusso manager

1. Apri l'app.
2. Seleziona `Manager` nella schermata login.
3. Accedi con l'utente manager creato su Supabase.
4. Vai in `Clienti`.
5. Crea un accesso cliente indicando:
   - nome, per esempio `Chimiver`;
   - email cliente;
   - password cliente.

La password aziendale viene salvata nel database come hash tramite `pgcrypto`, non in chiaro.

Dal pannello `Clienti` il manager puo anche eliminare un cliente. L'eliminazione rimuove l'azienda dall'app e cancella i dati compliance collegati tramite cascade nel database.

## Flusso cliente

Il cliente accede con tre campi:

- nome;
- email;
- password.

Se l'email non esiste ancora, l'app prova a registrarla su Supabase e poi collega l'utente all'azienda creata dal manager. Se email o password sono errate, l'accesso viene bloccato.

## Import dati

Ogni azienda parte vuota. Dopo l'accesso cliente, oppure dopo che il manager apre una specifica azienda, si caricano i file Excel/CSV.

Schema consigliato:

- `Employee Registry`: dipendenti e ruolo assegnato;
- `Role Obligation Matrix`: corsi obbligatori per ogni ruolo;
- `Certificate Repository`: stato reale degli attestati per dipendente e corso.

L'app genera gli obblighi richiesti incrociando:

```text
Employee Registry
dipendente -> ruolo

Role Obligation Matrix
ruolo -> corsi obbligatori

Risultato interno
dipendente -> corsi obbligatori
```

I dati importati vengono salvati su Supabase nelle tabelle dell'azienda corrente tramite `organization_id`.

## File principali

- `index.html`: app statica.
- `app.js`: UI, login, dashboard e flussi compliance.
- `importer.js`: lettura Excel/CSV e normalizzazione.
- `supabase-adapter.js`: collegamento tra frontend e Supabase.
- `supabase-config.js`: URL e anon key del progetto Supabase.
- `supabase-schema.sql`: schema database, RLS e funzioni RPC.

## Sicurezza MVP

- Row Level Security attiva sulle tabelle multi-cliente.
- I clienti vedono solo la propria azienda.
- Il manager vede e gestisce tutte le aziende.
- La password cliente e hashata nella tabella organizzazioni.
- La `anon key` Supabase e pubblica per natura, ma le regole RLS proteggono i dati.

## Limiti noti

- Il primo manager va promosso manualmente via SQL.
- Non ci sono ancora inviti email automatici.
- Non c'e ancora reset password avanzato lato prodotto.
- La password cliente viene usata anche come password Supabase iniziale dell'utente cliente.
