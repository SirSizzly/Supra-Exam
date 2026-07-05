Inventory Manager (Supra Exam)

Basic CRUD app I built for the Z-prefix assessment. It's an inventory tracker
you sign up as an inventory manager, add items you want to keep track of, and
edit/delete them later. You don't need an account just to browse, anyone can
look at what's been added.

Stack


React (Vite) + plain CSS on the front
Express on the back
PostgreSQL for the db
JWT + bcrypt for auth


Running it locally

You need Node 18+ and Postgres running. The .env assumes a postgres user with
password postgres, change it if yours is different.

First make the database:

bashcreatedb inventory_app

Then the backend:

bashcd BackEnd
cp .env.example .env   # edit if your postgres creds are different
npm install
npm run db:init        # sets up the users and items tables
npm run dev            # http://localhost:3001

Frontend in another terminal:

bashcd FrontEnd
npm install
npm run dev            # http://localhost:5173

Go to http://localhost:5173 and you should see it. The Log in button in the top
right opens a modal where you can either log in or make an account.

How it works

If you're not logged in you can still browse all the items and click into any
of them for details. Once you're signed in you can add your own items and
edit or delete them, but only your own. Other people's items are read only
for you.

Layout


BackEnd : the Express API, pg pool, auth middleware
FrontEnd : the React app. The Vite dev server proxies /api to the backend
