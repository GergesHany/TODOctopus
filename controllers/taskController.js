const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

const Task = require('../models/taskModel');
const User = require('../models/userModel');

const jwt = require('jsonwebtoken');

function getDecodeToken(req, next) {
  // Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // check if the user is logged in
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
}

// Get all tasks for the selected user
exports.getAllTasks = catchAsync(async (req, res, next) => {
  const decoded = getDecodeToken(req);

  let filter = { user: decoded.id };
  const allTasks = await Task.find(filter);

  // meta pagination
  const pagination = {
    page: req.query.page || 1,
    pageSize: 8 || req.query.limit,
    pageCount: 0 || Math.ceil(allTasks.length / (8 || req.query.limit)),
    total: allTasks.length,
  };

  // filter, sort and paginate
  const features = new APIFeatures(Task.find(filter), req.query).filter().sort().paginate();

  const Tasks = await features.query;

  const tasks = Tasks.map((task) => {
    return {
      _id: task._id,
      createdAt: task.createdAt,
      attributes: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
      },
      user: {
        _id: task.user._id,
      },
    };
  });

  res.status(200).json({ tasks, pagination });
});

// Create a new task
exports.createTask = catchAsync(async (req, res, next) => {
  getDecodeToken(req);
  const newTask = await Task.create({
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority,
    user: req.body._id,
  });
  res.status(201).json({ status: 'success', data: { task: newTask } });
});

// Delete a task
exports.deleteTask = catchAsync(async (req, res, next) => {
  const decoded = getDecodeToken(req);

  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  // get all the tasks for the selected user
  const tasks = await Task.find({ user: decoded.id });

  let len = tasks.length;
  if (len && len % 8 === 0) {
    // increment the number of octopuses killed by 1 of the selected user
    const user = await User.findById(decoded.id);
    user.KilledOctopuses += 1;
    await user.save();
  }

  res.status(204).json({ status: 'success', data: null });
});

// Update a task
exports.updateTask = catchAsync(async (req, res, next) => {
  getDecodeToken(req);

  const task = await Task.findByIdAndUpdate(
    {
      _id: req.params.id,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { task } });
});

// Get a task
exports.getTask = catchAsync(async (req, res, next) => {
  getDecodeToken(req);
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: { task } });
});

// get the number of octopuses killed by the selected user
exports.getKilledOctopuses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { KilledOctopuses: user.KilledOctopuses },
  });
});
