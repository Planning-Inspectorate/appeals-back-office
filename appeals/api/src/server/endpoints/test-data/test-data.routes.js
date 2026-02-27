import { asyncHandler } from '@pins/express';
import { Router } from 'express';
import { generateTestAppeals } from './test-data.controller.js';

const router = Router();

router.get(
	'/generate-appeals',
	/*
		#swagger.tags = ['Test Data']
		#swagger.path = '/appeals/generate-appeals'
		#swagger.description = 'Generates fake HAS or S78 appeals in the test environment'
		#swagger.parameters['type'] = {
			in: 'query',
			required: false,
			example: 'has',
			description: 'Type of appeal to generate (has or s78)'
		}
		#swagger.parameters['count'] = {
			in: 'query',
			required: false,
			example: 100,
			description: 'Number of appeals to generate'
		}
		#swagger.parameters['docCount'] = {
			in: 'query',
			required: false,
			example: 25,
			description: 'Number of additional documents to generate per appeal (default 25)'
		}
		#swagger.responses[200] = {
			description: 'Successful generation of test appeals'
		}
		#swagger.responses[400] = {
			description: 'Invalid request parameters'
		}
	 */
	asyncHandler(generateTestAppeals)
);

export { router as testDataRoutes };
