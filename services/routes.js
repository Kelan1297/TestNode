const express = require('express');
const { body } = require('express-validator');
const { authenticateJWT } = require('../authMiddleware');
const controller = require('../controllers/controller'); // Importa il controller dei task

const router = express.Router();

// Rotte dei task
console.log("Controller:", controller);
router.get('/', authenticateJWT, controller.getTasks);
router.get('/:uuid', authenticateJWT, controller.getTask);
router.post('/', [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
], authenticateJWT, controller.createTask);
router.put('/:uuid', [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
], authenticateJWT, controller.updateTask);
router.delete('/:uuid', authenticateJWT, controller.deleteTask);

module.exports = router;
