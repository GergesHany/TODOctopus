const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter a task"],
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  priority: {
    type: String,
    min: 1,
    max: 3,
    default: 2,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Task must belong to a User!"],
  },
});

taskSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "user",
    select: "_id",
  });
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
