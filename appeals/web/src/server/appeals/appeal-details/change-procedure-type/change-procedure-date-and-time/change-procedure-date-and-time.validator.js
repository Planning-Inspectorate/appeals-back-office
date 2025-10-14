import {
	createDateInputDateInFutureValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { capitalize } from 'lodash-es';

// @ts-ignore
const invoke = (unit, req, res) => {
	if (unit && typeof unit.run === 'function') {
		// express-validator ValidationChain
		return unit.run(req);
	}
	if (typeof unit === 'function') {
		return new Promise((resolve, reject) =>
			// @ts-ignore
			unit(req, res, (err) => (err ? reject(err) : resolve()))
		);
	}
	// Array of chains/middlewares
	if (Array.isArray(unit)) {
		return unit.reduce((p, u) => p.then(() => invoke(u, req, res)), Promise.resolve());
	}
	return Promise.resolve();
};

// @ts-ignore
export const validateEventDateTime = () => async (req, res, next) => {
	try {
		const { procedureType } = req.params;

		// Field names derived from the param
		const dateField = 'event-date';
		const timeField = 'event-time';

		const dateLabel = `${capitalize(procedureType)} date`;
		const timeLabel = `${procedureType} time`;

		const chains = [
			createDateInputFieldsValidator(dateField, dateLabel),
			createDateInputDateValidityValidator(dateField, dateLabel),
			createDateInputDateInFutureValidator(dateField, dateLabel),
			createTimeInputValidator(timeField, timeLabel)
		];

		for (const chain of chains) {
			await invoke(chain, req, res);
		}

		// pass through; your usual error handling middleware can read validationResult(req)
		return next();
	} catch (err) {
		return next(err);
	}
};
