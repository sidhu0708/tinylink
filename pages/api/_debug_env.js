export default function handler(req,res){ res.status(200).json({DATABASE_URL: process.env.DATABASE_URL ? 'SET' : null, NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || null}); }
