import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loadAllSchemas } from 'pins-data-model';
import BackOfficeAppError from '#utils/app-error.js';

export const schemas = {
	serviceUser: 'service-user'
	//appellantCase: 'pins-appellant-case',
	//lpaQuestionnaire: 'pins-lpa-questionnaire',
	//document: 'pins-document',
	//appeal: 'pins-appeal'
};

export const validateFromSchema = async (
	/** @type {string} */ schema,
	/** @type {any} */ payload
) => {
	const dataModels = await loadAllSchemas();
	const schemas = dataModels.schemas;
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
