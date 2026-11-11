# Seated

Wedding and event guests enter their name to see their assigned table and seatmates.

## Stack

- Next.js app in this folder
- Neon Postgres provisioned with Stripe Projects (`neon/free` + `neon/postgres`)
- Credentials synced via `stripe projects env --pull` into the project `.env` (symlinked as `.env.local`)

## Local setup

```bash
# from the Stripe Projects workspace root
stripe projects env --pull

# from this app folder
node --env-file=.env.local scripts/setup-db.mjs
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) (or the port Next prints) and try names like **Ava Chen** or **Noah Patel**.

## Production

Deployed on Vercel (provisioned via Stripe Projects):

- https://events-seating.vercel.app

## Demo guest names

| Table | Guests |
|------:|--------|
| 1 Garden Olive | Ava Chen, Marcus Webb, Priya Nair, James Ortega, Elena Brooks |
| 2 Candlewick | Noah Patel, Sofia Ramirez, Liam O'Connor, Mia Thompson, Owen Blake |
| 3 River Birch | Harper Diaz, Ethan Cole, Isla Nguyen, Caleb Foster, Nora Quinn |
| 4 Evening Jasmine | Amelia Hart, Lucas Kim, Chloe Bennett, Benjamin Shaw, Grace Holloway |
| 5 Harbor Light | Henry Adler, Zoe Martins, Jack Ellison, Ruby Santos, Leo Fontaine |
