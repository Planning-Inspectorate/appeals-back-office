import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loadAllSchemas } from 'pins-data-model';
import BackOfficeAppError from '#utils/app-error.js';
import { setCache, getCache } from '#utils/cache-data.js';

//1.5.1
export const schemas = {
	commands: {
		appealSubmission: 'appellant-submission',
		lpaSubmission: 'lpa-questionnaire',
		documentSubmission: ''
	},
	events: {
		serviceUser: 'service-user',
		document: 'appeal-document',
		appeal: 'appeal-has',
		appealEvent: ''
	}
};

export const validateFromSchema = async (
	/** @type {string} */ schema,
	/** @type {any} */ payload
) => {
	const cacheKey = 'integration-schemas';
	let schemas = getCache(cacheKey);
	if (!schemas) {
		const commandsAndEvents = await loadAllSchemas();
		schemas = {
			...commandsAndEvents.schemas,
			...commandsAndEvents.commands
		};

		setCache(cacheKey, schemas);
	}

	const ajv = new Ajv({ schemas });
	addFormats(ajv);

	const validator = ajv.getSchema(`${schema}.schema.json`);
	if (!validator) {
		throw new BackOfficeAppError(
			`Trying to validate against schema '${schema}', which could not be loaded.`
		);
	}
	if (!validator(payload)) {
		return { errors: validator.errors };
	} else {
		return true;
	}
};
