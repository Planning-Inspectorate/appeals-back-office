import { loadEnvironment } from '@pins/platform';
import joi from 'joi';

module.exports = {
	AZURE: {
		BO_SERVICEBUS: {
			TOPIC_APPELLANT_CASE: process.env.SB_TOPIC_NAME_APPEAL_FO_APPELLANT_SUBMISSION || 'appeal-fo-appellant-submission',
			SUB_APPELLANT_CASE: process.env.SB_SUBSCRIPTION_NAME_APPEAL_FO_APPELLANT_SUBMISSION || 'appeal-fo-appellant-submission-sub'
		}
	}
};

const schema = joi.object({
	NODE_ENV: joi.string().valid('development', 'production', 'test'),
	API_HOST: joi.string()
});

const environment = loadEnvironment(process.env.NODE_ENV);

const { value, error } = schema.validate({
	NODE_ENV: environment.NODE_ENV,
	API_HOST: environment.API_HOST
});

if (error) {
	throw error;
}

export default value;
