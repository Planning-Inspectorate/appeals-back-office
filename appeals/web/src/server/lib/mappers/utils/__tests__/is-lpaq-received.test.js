import { appealData } from '#testing/appeals/appeals.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';
import { isLpaqReceived } from '../is-lpaq-received.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

describe('isLpaqReceived', () => {
	it('returns false if status not received', () => {
		/** @type {WebAppeal} */
		const appeal = {
			...appealData,
			documentationSummary: {
				lpaQuestionnaire: {
					status: DOCUMENT_STATUS_NOT_RECEIVED,
					dueDate: undefined,
					receivedAt: undefined,
					representationStatus: null
				}
			}
		};

		expect(isLpaqReceived(appeal)).toBe(false);
	});
	it('returns false if status undefined', () => {
		/** @type {WebAppeal} */
		const appeal = {
			...appealData,
			documentationSummary: {}
		};

		expect(isLpaqReceived(appeal)).toBe(false);
	});
	it('returns true if status received', () => {
		/** @type {WebAppeal} */
		const appeal = {
			...appealData,
			documentationSummary: {
				lpaQuestionnaire: {
					status: DOCUMENT_STATUS_RECEIVED,
					dueDate: new Date().toUTCString(),
					receivedAt: new Date().toUTCString(),
					representationStatus: null
				}
			}
		};

		expect(isLpaqReceived(appeal)).toBe(true);
	});

	it('returns true if status complete', () => {
		/** @type {WebAppeal} */
		const appeal = {
			...appealData,
			documentationSummary: {
				lpaQuestionnaire: {
					status: 'Complete',
					dueDate: new Date().toUTCString(),
					receivedAt: new Date().toUTCString(),
					representationStatus: null
				}
			}
		};

		expect(isLpaqReceived(appeal)).toBe(true);
	});
});
