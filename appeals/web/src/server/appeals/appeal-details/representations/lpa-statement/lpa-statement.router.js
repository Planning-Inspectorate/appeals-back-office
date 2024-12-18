import { Router } from 'express';

const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
	// Placeholder code, replace when you make the real view :)
	console.log('🚀 ~ router.get ~ req.currentRepresentation:', req.currentRepresentation);
	res.send(`LPA Statement Placeholder `);
});

export default router;
