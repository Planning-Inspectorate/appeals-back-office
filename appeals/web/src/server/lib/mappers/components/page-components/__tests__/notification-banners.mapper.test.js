// @ts-nocheck
import { jest } from '@jest/globals';
import {
	mapNotificationBannersFromSession,
	sortNotificationBanners
} from '../notification-banners.mapper.js';

describe('buildNotificationBanners', () => {
	/**
	 * @type {import("express-session").Session & Partial<import("express-session").SessionData>}
	 */
	let session;

	const servicePage = 'appealDetails';
	const appealId = 1;

	const oneWeekFromNow = new Date();
	oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

	beforeEach(() => {
		session = {
			notificationBanners: {},
			id: 'mock-session-id',
			cookie: {
				expires: oneWeekFromNow,
				maxAge: 7 * 24 * 60 * 60 * 1000,
				originalMaxAge: 7 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				path: '/',
				sameSite: 'lax',
				secure: false
			},
			regenerate: jest.fn(),
			destroy: jest.fn(),
			reload: jest.fn(),
			save: jest.fn(),
			touch: jest.fn(),
			resetMaxAge: jest.fn()
		};
	});

	it('should return an empty array if appealId is undefined', () => {
		const result = mapNotificationBannersFromSession(session, servicePage, undefined);
		expect(result).toEqual([]);
	});

	it('should return an empty array if notificationBanners does not exist in session', () => {
		delete session.notificationBanners;
		const result = mapNotificationBannersFromSession(session, servicePage, appealId);
		expect(result).toEqual([]);
	});

	it('should return an empty array if no matching notification definitions exist', () => {
		session.notificationBanners = {
			[appealId]: [
				{
					key: 'nonExistentKey'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, servicePage, appealId);
		expect(result).toEqual([]);
	});

	it('should return an empty array if the banner is not configured to display on the specified page', () => {
		session.notificationBanners = {
			[appealId]: [
				{
					key: 'documentAdded'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, 'manageNeighbouringSites', appealId);
		expect(result).toEqual([]);
	});

	it('should return an empty array if the appeal ID does not match', () => {
		session.notificationBanners = {
			[2]: [
				{
					key: 'documentAdded'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, 'appealDetails', appealId);
		expect(result).toEqual([]);
	});

	it('should return a notification banner if a matching notification definition exists, the banner is configured to display on the specified page, and the appeal ID matches', () => {
		session.notificationBanners = {
			[appealId]: [
				{
					key: 'documentAdded'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, 'appellantCase', appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'Document added',
					attributes: {
						'data-index': 0
					}
				}
			}
		]);
	});

	it('should use custom text banner content from the session if provided', () => {
		session.notificationBanners = {
			[appealId]: [
				{
					key: 'documentAdded',
					text: 'custom text content'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, 'appellantCase', appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'custom text content',
					attributes: {
						'data-index': 0
					}
				}
			}
		]);
	});

	it('should use custom html banner content from the session if provided', () => {
		session.notificationBanners = {
			[appealId]: [
				{
					key: 'documentAdded',
					html: '<p>custom text content</p>'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, 'appellantCase', appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'Document added',
					html: '<p>custom text content</p>',
					attributes: {
						'data-index': 0
					}
				}
			}
		]);
	});

	it('should return a notification banner for interestedPartyCommentsRedactionSuccess', () => {
		session.notificationBanners = {
			[appealId]: [
				{
					key: 'interestedPartyCommentsRedactionSuccess'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, 'ipComments', appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'Comment redacted and accepted',
					attributes: {
						'data-index': 0
					}
				}
			}
		]);
	});

	it('should return a notification banner for decisionLetterUpdated', () => {
		session.notificationBanners = {
			[appealId]: [
				{
					key: 'decisionLetterUpdated'
				}
			]
		};

		const result = mapNotificationBannersFromSession(session, 'appealDecision', appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'Decision letter updated',
					attributes: {
						'data-index': 0
					}
				}
			}
		]);
	});
});

describe('sortNotificationBanners', () => {
	const successBannerOne = {
		type: 'notification-banner',
		parameters: {
			titleText: 'First success banner',
			type: 'success'
		}
	};
	const successBannerTwo = {
		type: 'notification-banner',
		parameters: {
			titleText: 'Second success banner',
			type: 'success'
		}
	};
	const importantBannerOne = {
		type: 'notification-banner',
		parameters: {
			titleText: 'First important banner',
			type: 'important'
		}
	};
	const importantBannerTwo = {
		type: 'notification-banner',
		parameters: {
			titleText: 'Second important banner',
			type: 'important'
		}
	};

	it('should sort success banners before (above) important banners', () => {
		expect(
			sortNotificationBanners([
				successBannerOne,
				importantBannerOne,
				successBannerTwo,
				importantBannerTwo
			])
		).toEqual([successBannerOne, successBannerTwo, importantBannerOne, importantBannerTwo]);
	});

	it('should not change the relative ordering of success banners', () => {
		expect(sortNotificationBanners([successBannerTwo, successBannerOne])).toEqual([
			successBannerTwo,
			successBannerOne
		]);
	});

	it('should not change the relative ordering of important banners', () => {
		expect(sortNotificationBanners([importantBannerTwo, importantBannerOne])).toEqual([
			importantBannerTwo,
			importantBannerOne
		]);
	});
});
