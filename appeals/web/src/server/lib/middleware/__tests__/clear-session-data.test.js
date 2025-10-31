// @ts-nocheck
import { jest } from '@jest/globals';
import { clearSessionData } from '../clear-session-data.js';

describe('clear-session-data', () => {
	let next;

	beforeEach(() => {
		next = jest.fn();
	});
	describe('clearSessionData', () => {
		it('Should not clear session of account param', () => {
			const req = {
				session: {
					account: 'user account info',
					shouldBeCleared: 'someValue'
				}
			};
			const res = {};

			clearSessionData(req, res, next);
			expect(req.session).toEqual({ account: 'user account info' });
		});

		it('Should not clear session of cookie param', () => {
			const req = {
				session: {
					cookie: 'some cookie info',
					shouldBeCleared: 'someValue'
				}
			};
			const res = {};

			clearSessionData(req, res, next);
			expect(req.session).toEqual({ cookie: 'some cookie info' });
		});

		it('Should not clear session of permissions param', () => {
			const req = {
				session: {
					permissions: 'some permissions info',
					shouldBeCleared: 'someValue'
				}
			};
			const res = {};

			clearSessionData(req, res, next);
			expect(req.session).toEqual({ permissions: 'some permissions info' });
		});

		it('Should not clear session of notificationBanners', () => {
			const req = {
				session: {
					notificationBanners: [{ banner: 'some notification banner info' }],
					shouldBeCleared: 'someValue'
				}
			};
			const res = {};

			clearSessionData(req, res, next);
			expect(req.session).toEqual({
				notificationBanners: [{ banner: 'some notification banner info' }]
			});
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
