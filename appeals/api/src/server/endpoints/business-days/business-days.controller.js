import { addDays } from '@pins/appeals/utils/business-days.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {{body: { inputDate: string }}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const validate = async (req, res) => {
	return res.send(true);
};

/**
 * @param {{body: { inputDate: string, numDays: number }}} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
export const addBusinessDays = async (req, res) => {
	const { body } = req;

	const nextDate = await addDays(body.inputDate, body.numDays);

	return res.send(nextDate);
};
