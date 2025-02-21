const allwedOrigins = require('./allowedOrigins');

const corsOptions = {
  origin: (origin, callback) => {
    // !origin -> for postman requests
    if (allwedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
