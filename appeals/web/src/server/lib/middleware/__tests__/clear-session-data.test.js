// @ts-nocheck
import { jest } from '@jest/globals';
import { clearSessionData } from '../clear-session-data.js';

describe('clear-session-data', () => {
	let next;

	beforeEach(() => {
		next = jest.fn();
	});
	describe('clearSessionData', () => {
		it('Should not clear session of params that are part of the required session params', () => {
			const req = {
				session: {
					account: 'user account info',
					permissions: 'permissions',
					cookie: 'cookies info'
				}
			};
			const res = {};

			clearSessionData(req, res, next);
			expect(req.session.account).toBe('user account info');
			expect(req.session.permissions).toBe('permissions');
			expect(req.session.cookie).toBe('cookies info');
		});

		it('Should clear session of params that are not part of the required session params', () => {
			const req = {
				session: {
					notRequiredSessionParam: 'someValue'
				}
			};
			const res = {};

			clearSessionData(req, res, next);
			expect(req.session.notRequiredSessionParam).toBeUndefined();
		});
	});
});
