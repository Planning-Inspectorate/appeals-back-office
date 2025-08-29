/*
This file links specific combinations of representation
type and status to an function which sends an email when
a rep of that type transitions to that status.

If you came here to add a new email to be sent
for a specific rep type and status change combination
you'll want to head to ./services/index.js first and
create a new function there to send the email.
Make sure you stick to the existing Service type
and add any new arguments you might need to ServiceArgs
*/

import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';

import * as service from './services/index.js';

/** @typedef {import('./services/index.js').Service} Service */

/**
 * @typedef {object} ConditionToServiceConnection
 * @property {string} status
 * @property {string} type
 * @property {Service} service
 * */

/** @type {ConditionToServiceConnection[]} */
export const serviceMap = [
	{
		status: APPEAL_REPRESENTATION_STATUS.INVALID,
		type: APPEAL_REPRESENTATION_TYPE.COMMENT,
		service: service.ipCommentRejection
	},
	{
		status: APPEAL_REPRESENTATION_STATUS.INVALID,
		type: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
		service: service.appellantFinalCommentRejection
	},
	{
		status: APPEAL_REPRESENTATION_STATUS.INVALID,
		type: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
		service: service.lpaFinalCommentRejection
	},
	{
		status: APPEAL_REPRESENTATION_STATUS.INCOMPLETE,
		type: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
		service: service.lpaStatementIncomplete
	}
];
