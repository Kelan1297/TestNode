const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

// Get all tasks with pagination and filtering
async function getTasks(req, res, next) {
    const { page = 1, limit = 10, title, completed } = req.query;

    const skip = (page - 1) * limit;

    try {
        const filters = {};
        if (title) filters.title = { contains: title, mode: 'insensitive' };
        if (completed !== undefined) filters.completed = completed === 'true';

        const tasks = await prisma.task.findMany({
            where: filters,
            skip: skip,
            take: Number(limit),
        });

        const totalTasks = await prisma.task.count({ where: filters });

        res.json({
            tasks,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: Number(page),
            perPage: Number(limit),
        });
    } catch (error) {
        next(error);
    }
}

// Get a single task by UUID
async function getTask(req, res, next) {
    try {
        const task = await prisma.task.findUnique({
            where: { uuid: req.params.uuid },
        });
        if (!task) return res.status(404).send('Task not found');
        res.json(task);
    } catch (error) {
        next(error);
    }
}

// Create a new task
async function createTask(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, description } = req.body;
        const task = await prisma.task.create({
            data: { title, description },
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
}

// Update a task by UUID
async function updateTask(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { uuid } = req.params;
        const { title, description, completed } = req.body;
        const task = await prisma.task.update({
            where: { uuid },
            data: { title, description, completed },
        });
        res.json(task);
    } catch (error) {
        next(error);
    }
}

// Delete a task by UUID
async function deleteTask(req, res, next) {
    try {
        const { uuid } = req.params;
        await prisma.task.delete({
            where: { uuid },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
};
