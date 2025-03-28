import { Router } from 'express';
import { AuthenticatedRequest } from '../@types/requestTypes';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/controller';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Update all route handlers to use proper typing
router.get('/',
    (req, res, next) => authenticateJWT(req as AuthenticatedRequest, res, next),
    (req, res, next) => getTasks(req as AuthenticatedRequest, res, next)
);

router.get('/:uuid',
    (req, res, next) => authenticateJWT(req as AuthenticatedRequest, res, next),
    (req, res, next) => getTask(req as AuthenticatedRequest, res, next)
);

router.post('/',
    (req, res, next) => authenticateJWT(req as AuthenticatedRequest, res, next),
    (req, res, next) => createTask(req as AuthenticatedRequest, res, next)
);

router.put('/:uuid',
    (req, res, next) => authenticateJWT(req as AuthenticatedRequest, res, next),
    (req, res, next) => updateTask(req as AuthenticatedRequest, res, next)
);

router.delete('/:uuid',
    (req, res, next) => authenticateJWT(req as AuthenticatedRequest, res, next),
    (req, res, next) => deleteTask(req as AuthenticatedRequest, res, next)
);

export default router;