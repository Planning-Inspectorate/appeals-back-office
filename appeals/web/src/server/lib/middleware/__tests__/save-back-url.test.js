// @ts-nocheck
import { jest } from '@jest/globals';
import { saveBackUrl } from '../save-back-url.js';

describe('saveBackUrl', () => {
	it('should save the backUrl to the session', async () => {
		const req = {
			params: {
				appealId: '123'
			},
			query: {
				backUrl: '/appeals-service/personal-list'
			},
			session: {}
		};

		saveBackUrl('manageIpComments')(req, {}, jest.fn());
		expect(req.session['backUrl/manageIpComments']['123']).toBe('/appeals-service/personal-list');
	});

	it('should not save the backUrl to the session if it is not present', async () => {
		const req = {
			params: {
				appealId: '123'
			},
			session: {}
		};

		saveBackUrl('manageIpComments')(req, {}, jest.fn());
		expect(req.session['backUrl/manageIpComments']).toBeUndefined();
	});

	it('should keep the existing backUrl if no query param is present', async () => {
		const req = {
			params: {
				appealId: '123'
			},
			session: {
				'backUrl/manageIpComments': {
					123: '/appeals-service/personal-list'
				}
			}
		};

		saveBackUrl('manageIpComments')(req, {}, jest.fn());
		expect(req.session['backUrl/manageIpComments']['123']).toBe('/appeals-service/personal-list');
	});

	it('should invalidate other specified session keys', async () => {
		const req = {
			params: {
				appealId: '123'
			},
			query: {
				backUrl: '/appeals-service/personal-list'
			},
			session: {
				'backUrl/manageIpComments': {
					123: '/appeals-service/personal-list'
				},
				'backUrl/addIpComment': {
					123: '/appeals-service/add-ip-comment'
				}
			}
		};

		saveBackUrl('manageIpComments', { invalidateKeys: ['addIpComment'] })(req, {}, jest.fn());

		expect(req.session['backUrl/manageIpComments']['123']).toBe('/appeals-service/personal-list');
		expect(req.session['backUrl/addIpComment']).toBeUndefined();
	});

	it('should not invalidate other specified session keys if no backUrl is present', async () => {
		const req = {
			params: {
				appealId: '123'
			},
			session: {
				'backUrl/manageIpComments': {
					123: '/appeals-service/personal-list'
				},
				'backUrl/addIpComment': {
					123: '/appeals-service/add-ip-comment'
				}
			}
		};

		saveBackUrl('manageIpComments', { invalidateKeys: ['addIpComment'] })(req, {}, jest.fn());

		expect(req.session['backUrl/manageIpComments']['123']).toBe('/appeals-service/personal-list');
		expect(req.session['backUrl/addIpComment']).toEqual({ 123: '/appeals-service/add-ip-comment' });
	});
});
