const mongoose = require('mongoose');

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      autoIndex: process.env.NODE_ENV !== 'production'
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = dbConnection;