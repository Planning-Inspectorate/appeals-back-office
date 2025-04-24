import got from 'got';
import config from './config.js';
/**
 *
 * @param {*} submission
 * @returns {Promise<{id: string | null}>}
 */
async function post(submission) {
	return await got
		.post(`https://${config.API_HOST}/appeals/service-user-import`, {
			json: submission
		})
		.json();
}

export default {
	post
};
