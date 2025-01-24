/*
This code handles the conditional logic
that figures out which email to send when.

You shouldn't need to edit this unless there's
a bug in the switching or the conditions become
more complex.
*/

import logger from '#utils/logger.js';
import { serviceMap } from './service-map.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('./services/index.js').Service} Service */
/** @typedef {import('./services/index.js').ServiceArgs} ServiceArgs */
/** @typedef {import('./service-map.js').ConditionToServiceConnection} ConditionToServiceConnection */

/**
 * @param {Omit<ConditionToServiceConnection, 'service'>} wire
 * @returns {string}
 */
export const hash = ({ status, type }) => `${status}-${type}`;

/**
 * @param {ConditionToServiceConnection[]} connections
 */
export const buildDict = (connections) => {
	/** @type {Record<string, Service>} */
	const initialDict = {};
	return connections.reduce((acc, cur) => {
		acc[hash(cur)] = cur.service;
		return acc;
	}, initialDict);
};

const notifyDict = Object.freeze(buildDict(serviceMap));

/**
 * @param {string} status
 * @param {string} type
 * @returns {Service | null}
 */
export const getNotifyService = (status, type) => {
	const pluckedService = notifyDict[hash({ status, type })];
	if (!pluckedService) {
		logger.warn(
			`No notify service configured for representation status ${status} and representation type: ${type}`
		);
		return null;
	}
	return pluckedService;
};
