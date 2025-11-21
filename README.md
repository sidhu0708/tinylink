TinyLink — URL Shortener

TinyLink is a lightweight URL shortening service similar to Bitly.
Users can create short links, optionally choose custom codes, view click statistics, and delete links.
The app is built using Next.js, TailwindCSS, and Neon Postgres, and deployed on Vercel.

Features
Core Functionality

Create short URLs with optional custom short codes

Validate target URLs before saving

Prevent duplicate codes (returns 409 Conflict)

Perform 302 redirect from /:code → original URL

Track:

total clicks

last clicked timestamp

Delete links and immediately disable redirection

Pages and Routes
Route	Description
/	Dashboard (create, list, delete links)
/code/:code	Stats page for a single link
/:code	Public redirect endpoint
/healthz	Health check endpoint
API Endpoints
Method	Path	Description
POST	/api/links	Create a new link
GET	/api/links	List all links
GET	/api/links/:code	Stats for one short code
DELETE	/api/links/:code	Delete a link
Tech Stack

Next.js 14

TailwindCSS

Neon Postgres

Vercel (hosting)

pg (Postgres client)

Installation & Local Development
1. Clone the repository
git clone https://github.com/<your-username>/tinylink.git
cd tinylink

2. Install dependencies
npm install

3. Create .env.local
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000

4. Create the database table

Run this SQL in Neon Query Editor:

CREATE TABLE IF NOT EXISTS links (
  code VARCHAR(8) PRIMARY KEY,
  url TEXT NOT NULL,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_clicked TIMESTAMPTZ
);

5. Start the development server
npm run dev


Access the app at:

http://localhost:3000

Deployment (Vercel)

Push the project to GitHub

Import the repository into Vercel

Add the following environment variables in Vercel:

Key	Value
DATABASE_URL	Neon connection string
NEXT_PUBLIC_BASE_URL	https://your-vercel-domain.vercel.app

Deploy the project

Verify /healthz, link creation, redirects, and stats page

API Examples
Create a new link
curl -X POST https://yourapp.vercel.app/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","code":"example"}'

Redirect (should return 302)
curl -I https://yourapp.vercel.app/example

Get stats
curl https://yourapp.vercel.app/api/links/example

Delete a link
curl -X DELETE https://yourapp.vercel.app/api/links/example

Project Structure
tinylink/
├── pages/
│   ├── index.js             # Dashboard
│   ├── [code].js            # Redirect handler
│   ├── code/[code].js       # Stats page
│   └── api/links/           # CRUD API routes
├── lib/db.js                # Database connection pool
├── styles/globals.css       # Tailwind CSS
├── public/                  # Static assets
├── .env.example
└── README.md

License

This project is for educational and demonstration purposes.
