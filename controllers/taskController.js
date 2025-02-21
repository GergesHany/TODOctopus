const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Helper function to format task response
const formatTaskResponse = (task) => ({
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
});

// Get all tasks for the selected user
exports.getAllTasks = catchAsync(async (req, res, next) => {
  const filter = { user: req.user.id };
  const allTasksCount = await Task.countDocuments(filter);

  const pagination = {
    page: req.query.page || 1,
    pageSize: req.query.limit || 8,
    pageCount: Math.ceil(allTasksCount / (req.query.limit || 8)),
    total: allTasksCount,
  };

  const features = new APIFeatures(Task.find(filter), req.query).filter().sort().paginate();
  const tasks = (await features.query).map(formatTaskResponse);

  res.status(200).json({ tasks, pagination });
});

// Create a new task
exports.createTask = catchAsync(async (req, res, next) => {
  const newTask = await Task.create({
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority,
    user: req.user.id,
  });
  res.status(201).json({ status: 'success', data: { task: newTask } });
});

// Delete a task
exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  const remainingTasksCount = await Task.countDocuments({ user: req.user.id });
  if (remainingTasksCount % 8 === 0) {
    const user = await User.findById(req.user.id);
    user.KilledOctopuses += 1;
    await user.save();
  }

  res.status(204).json({ status: 'success', data: null });
});

// Update a task
exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { task } });
});

// Get a task
exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: { task } });
});

// Get the number of octopuses killed by the selected user
exports.getKilledOctopuses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: { KilledOctopuses: user.KilledOctopuses } });
});
