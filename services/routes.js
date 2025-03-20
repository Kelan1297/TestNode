const express = require('express');
const { body } = require('express-validator');
const { authenticateJWT } = require('../authMiddleware');
const taskController = require('../controllers/taskController'); // Importa il controller dei task

const router = express.Router();

// Rotte dei task
router.get('/', authenticateJWT, taskController.getTasks);
router.get('/:uuid', authenticateJWT, taskController.getTask);
router.post('/', [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
], authenticateJWT, taskController.createTask);
router.put('/:uuid', [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
], authenticateJWT, taskController.updateTask);
router.delete('/:uuid', authenticateJWT, taskController.deleteTask);

module.exports = router;
