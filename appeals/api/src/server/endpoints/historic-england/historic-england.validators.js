import { schemas, validateFromSchema } from '#endpoints/integrations/integrations.validators.js';
import pino from '#utils/logger.js';
import { ERROR_INVALID_LISTED_BUILDING_DATA } from '@pins/appeals/constants/support.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateListedBuildingsPayload = async (req, res, next) => {
	const { body } = req;

	pino.info('Received Listed Building from topic', body);
	const validationResult = await validateFromSchema(schemas.events.listedBuilding, body);
	if (validationResult !== true && validationResult.errors) {
		const errorDetails = validationResult.errors.map(
			(e) => `${e.instancePath || '/'}: ${e.message}`
		);

		pino.error(`Error validating Listed Building update: ${errorDetails[0]}`);
		return res.status(400).send({
			errors: {
				integration: ERROR_INVALID_LISTED_BUILDING_DATA,
				details: errorDetails
			}
		});
	}

	next();
};
