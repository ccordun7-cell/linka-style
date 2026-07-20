# Migrații

`schema.sql` reprezintă mereu **starea curentă completă** a bazei de date — dacă
provizionezi o bază nouă, rulezi doar `schema.sql`, nu fișierele de aici.

Acest folder e **istoricul** — fiecare schimbare făcută manual în baza de date
de producție (prin Supabase SQL Editor), în ordine cronologică, numerotată.
Scopul: cineva care se alătură proiectului mai târziu poate vedea exact ce
schimbări s-au făcut și când, în loc să ghicească.

## Regulă simplă de-acum înainte

Orice modificare de schemă făcută direct în Supabase SQL Editor primește și
un fișier nou aici, cu numărul următor (`005_...sql`, `006_...sql` etc.),
**și** se reflectă imediat în `schema.sql`, ca cele două să nu mai iasă din
sincron.
