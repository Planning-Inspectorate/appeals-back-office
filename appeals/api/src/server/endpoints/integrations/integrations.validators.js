import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loadAllSchemas } from '@planning-inspectorate/data-model';
import BackOfficeAppError from '#utils/app-error.js';
import { setCache, getCache } from '@pins/appeals/utils/cache-data.js';

export const schemas = {
	commands: {
		appealSubmission: 'appellant-submission',
		lpaSubmission: 'lpa-questionnaire',
		repSubmission: 'appeal-representation-submission'
	},
	events: {
		serviceUser: 'service-user',
		document: 'appeal-document',
		appealHas: 'appeal-has',
		appealS78: 'appeal-s78',
		appealEvent: 'appeal-event',
		appealRepresentation: 'appeal-representation',
		listedBuilding: 'listed-building',
		appealEventEstimate: 'appeal-event-estimate'
	}
};

/**
 *
 * @param {string} schema
 * @param {Object} payload
 * @param {boolean|undefined} isCommand
 * @returns
 */
export const validateFromSchema = async (schema, payload, isCommand = false) => {
	const cacheKey = 'integration-schemas';
	let commandsAndEvents = getCache(cacheKey);
	if (!commandsAndEvents) {
		commandsAndEvents = await loadAllSchemas();
		setCache(cacheKey, commandsAndEvents);
	}

	const schemas = isCommand ? commandsAndEvents.commands : commandsAndEvents.schemas;
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
