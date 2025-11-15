// config/cors.js (improved)
const allowedBase = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(u => u.trim().toLowerCase())
  : [
      'http://localhost:3000',
      'https://bosstradersinvestorclass.com',
      'https://www.bosstradersinvestorclass.com',
      'https://main.d314wrchp9hgrc.amplifyapp.com'
    ];

function normalize(o) {
  if (!o) return '';
  return o.toLowerCase().replace(/\/$/, '');
}

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests without origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);

    const incoming = normalize(origin);
    const allowed = allowedBase.map(normalize);

    if (allowed.includes(incoming)) {
      return callback(null, true);
    }

    console.error(`CORS Error: Origin ${origin} not allowed`);
    return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept','Origin'],
  exposedHeaders: ['Content-Range','X-Content-Range'],
  optionsSuccessStatus: 200,
  maxAge: 86400
};

module.exports = corsOptions;

