const express = require('express');

const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const cors = require('cors');
const corsOptions = require("./config/corsOptions");


const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const TaskRouter = require('./routes/taskRoute');
const authRouter = require('./routes/authRoute');

app.use(cors());
app.use(cors(corsOptions));

app.use(express.json());
app.use(helmet());

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Todo App!');
});

app.use('/api/v1/tasks', TaskRouter);
app.use('/api/v1/users', authRouter);

// 4) ERROR HANDLING MIDDLEWARE

// this middleware is used to handle all the requests that are not handled by the routers
app.all('*', (req, res, next) => {
  // if the next function is called with an argument, it will be treated as an error
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// this middleware is used to handle all the errors that are passed to the next function
app.use(globalErrorHandler);

module.exports = app;
