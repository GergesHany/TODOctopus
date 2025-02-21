const express = require('express');

const router = express.Router();
const taskController = require('../controllers/taskController');
const verifyToken = require('../middleware/verifyJWT');


router.use(verifyToken);
router.get('/task/:id', taskController.getTask);
router.patch('/task/:id', taskController.updateTask);

router.post('/task', taskController.createTask);
router.get('/tasks', taskController.getAllTasks);
router.delete('/task/:id', taskController.deleteTask);

router.get('/getKilledOctopuses/:id', taskController.getKilledOctopuses);

// handling invalid routes
router.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = router;
