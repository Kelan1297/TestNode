import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Task } from '@prisma/client';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../@types/requestTypes';

const prisma = new PrismaClient();

/**
 * @openapi
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TaskPaginatedResponse:
 *       type: object
 *       properties:
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         totalTasks:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         currentPage:
 *           type: integer
 *         perPage:
 *           type: integer
 *     TaskCreateUpdate:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 */

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get paginated tasks with filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title (contains)
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskPaginatedResponse'
 *       401:
 *         description: Unauthorized
 */
export async function getTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const { page = '1', limit = '10', title, completed } = req.query;
    const userId = req.user?.userId;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    try {
        const filters: Record<string, any> = { userId };
        if (title) filters.title = { contains: title as string, mode: 'insensitive' };
        if (completed !== undefined) filters.completed = completed === 'true';

        const [tasks, totalTasks] = await Promise.all([
            prisma.task.findMany({
                where: filters,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.task.count({ where: filters })
        ]);

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

/**
 * @openapi
 * /tasks/{uuid}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a single task by UUID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreateUpdate'
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @openapi
 * /tasks/{uuid}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreateUpdate'
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
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
            data: {
                title,
                description,
                completed,
                updatedAt: new Date()
            },
        });

        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
}

/**
 * @openapi
 * /tasks/{uuid}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
export async function deleteTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { uuid } = req.params;

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