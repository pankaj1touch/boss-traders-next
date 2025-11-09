const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',')
      : ['http://localhost:3000','https://bosstradersinvestorclass.com','https://main.d314wrchp9hgrc.amplifyapp.com','https://www.bosstradersinvestorclass.com'];

    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;

