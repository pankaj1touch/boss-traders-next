const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map(url => url.trim())
      : [
          'http://localhost:3000',
          'https://bosstradersinvestorclass.com',
          'https://www.bosstradersinvestorclass.com',
          'https://main.d314wrchp9hgrc.amplifyapp.com'
        ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in whitelist
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed`);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

module.exports = corsOptions;

