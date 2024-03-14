import Ajv from 'ajv';
import addAjvFormats from 'ajv-formats';
import { loadAllSchemas } from 'pins-data-model';

const { schemas } = await loadAllSchemas();

const ajv = new Ajv({ schemas, allErrors: true });

addAjvFormats(ajv);

export const validateNsipProjectSchema = ajv.getSchema('nsip-project.schema.json');
export const validateNsipDocumentSchema = ajv.getSchema('nsip-document.schema.json');

// AJV treats Date objects as objects, we need it to understand strings.
// We actually don't care about the date object because it gets serialsied as a string anyway, so we can validate JSON.Parse here.
export const validateNsipProject = (/** @type {any} */ payload) => {
	return (
		validateNsipProjectSchema && validateNsipProjectSchema(JSON.parse(JSON.stringify(payload)))
	);
};

export const validateNsipDocument = (/** @type {any} */ payload) => {
	return (
		validateNsipDocumentSchema && validateNsipDocumentSchema(JSON.parse(JSON.stringify(payload)))
	);
};

export const removeUndefined = (/** @type {any} */ payload) => {
	return JSON.parse(JSON.stringify(payload));
};

/**
 * validate that a service bus event message payload is valid to the matching schema in data-model repo
 *
 * @param {string} schemaName
 * @param {object} events
 * @returns {Promise<boolean>}
 */
export const validateMessageToSchema = async (schemaName, events) => {
	const { schemas } = await loadAllSchemas();
	const ajv = new Ajv({ schemas, allErrors: true, verbose: true });

	addAjvFormats(ajv);

	const schema = schemas[schemaName];

	if (!schema) {
		console.log(`No valid schema found for '${schemaName}'`);
		return false;
	}
	const validator = ajv.compile(schema);

	let isAllValid = true;
	if (events instanceof Array) {
		for (const eachEvent of events) {
			const isValid = validator(eachEvent);
			if (!isValid) {
				isAllValid = false;
				console.log(`Message in array fails schema validation ${schemaName}: `, validator.errors);
			}
		}
	} else {
		const isValid = validator(events);
		if (!isValid) {
			isAllValid = false;
			console.log(`Message fails schema validation: ${schemaName}`, validator.errors);
		}
	}

	return isAllValid;
};
