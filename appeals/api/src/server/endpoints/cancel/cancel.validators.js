import { createValidator } from '@pins/express';
import { query } from 'express-validator';

export const validateDryRunQueryParam = createValidator(
	query('dryRun').optional().isBoolean().withMessage('Dry run must be a boolean').default(false)
);
