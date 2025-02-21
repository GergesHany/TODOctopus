const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// ------------------------- DATABASE CONNECTION -------------------------


const connectDB = require('./config/dbConn');

connectDB();


const PORT = process.env.PORT || 3000;

// Database connection and server start
mongoose.connection.once("open", () => {
  console.log("MongoDB connected successfully");    
  app.listen(PORT, () => {
     console.log(`Server is running on PORT ${PORT}`);
  });
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
  process.exit(1);
});


// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  console.error(`Shutting down....`);
  process.exit(1);
});