import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Task } from '@prisma/client';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../@types/requestTypes';

const prisma = new PrismaClient();

// Get all tasks with pagination and filtering
export async function getTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const { page = '1', limit = '10', title, completed } = req.query;
    const userId = req.user?.userId;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    try {
        const filters: Record<string, any> = { userId };
        if (title) filters.title = { contains: title as string, mode: 'insensitive' };
        if (completed !== undefined) filters.completed = completed === 'true';

        const tasks: Task[] = await prisma.task.findMany({
            where: filters,
            skip,
            take: limitNum,
        });

        const totalTasks = await prisma.task.count({ where: filters });

        res.json({
            tasks,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limitNum),
            currentPage: pageNum,
            perPage: limitNum,
        });
    } catch (error) {
        next(error);
    }
}

// Get a single task by UUID
export async function getTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const task = await prisma.task.findFirst({
            where: {
                uuid: req.params.uuid,
                userId: req.user?.userId
            },
        });

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        res.json(task);
    } catch (error) {
        next(error);
    }
}

// Create a new task
export async function createTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const { title, description } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                user: {
                    connect: { id: req.user?.userId }
                }
            },
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
}

// Update a task by UUID
export async function updateTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const { uuid } = req.params;
        const { title, description, completed } = req.body;

        // Verify task belongs to user before updating
        const existingTask = await prisma.task.findFirst({
            where: {
                uuid,
                userId: req.user?.userId
            }
        });

        if (!existingTask) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        const updatedTask = await prisma.task.update({
            where: { uuid },
            data: { title, description, completed },
        });

        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
}

// Delete a task by UUID
export async function deleteTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { uuid } = req.params;

        // Verify task belongs to user before deleting
        const existingTask = await prisma.task.findFirst({
            where: {
                uuid,
                userId: req.user?.userId
            }
        });

        if (!existingTask) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        await prisma.task.delete({
            where: { uuid },
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}