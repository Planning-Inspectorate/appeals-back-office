import got from 'got';
import config from './config.js';

/**
 *
 * @param {*} msg
 * @returns {Promise<{id: string | null}>}
 */
async function upsertRecord(msg) {
	return await got
		.post(`https://${config.API_HOST}/appeals/listed-buildings`, {
			json: msg
		})
		.json();
}

/**
 *
 * @param {string} reference
 * @returns {Promise<{id: string | null}>}
 */
async function deleteRecord(reference) {
	return await got
		.delete(`https://${config.API_HOST}/appeals/listed-buildings/${reference}`)
		.json();
}

export default {
	upsertRecord,
	deleteRecord
};
