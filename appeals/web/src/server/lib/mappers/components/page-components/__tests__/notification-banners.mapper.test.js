// @ts-nocheck
import { buildNotificationBanners } from '../notification-banners.mapper.js';
import { jest } from '@jest/globals';

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
		const result = buildNotificationBanners(session, servicePage, undefined);
		expect(result).toEqual([]);
	});

	it('should return an empty array if notificationBanners does not exist in session', () => {
		delete session.notificationBanners;
		const result = buildNotificationBanners(session, servicePage, appealId);
		expect(result).toEqual([]);
	});

	it('should return an empty array if no matching notification definitions exist', () => {
		session.notificationBanners = {
			nonExistentKey: { appealId }
		};
		const result = buildNotificationBanners(session, servicePage, appealId);
		expect(result).toEqual([]);
	});

	it('should build a notification banner for a matching key', () => {
		session.notificationBanners = {
			siteVisitTypeSelected: { appealId }
		};

		const result = buildNotificationBanners(session, servicePage, appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'Site visit type has been selected'
				}
			}
		]);
	});

	it('should remove non-persistent banners from the session', () => {
		session.notificationBanners = {
			siteVisitTypeSelected: { appealId }
		};

		buildNotificationBanners(session, servicePage, appealId);

		expect(session.notificationBanners).not.toHaveProperty('siteVisitTypeSelected');
	});

	it('should retain persistent banners in the session', () => {
		session.notificationBanners = {
			appellantCaseNotValid: { appealId }
		};

		buildNotificationBanners(session, 'appellantCase', appealId);

		expect(session.notificationBanners).toHaveProperty('appellantCaseNotValid');
	});

	it('should use data from the session if provided', () => {
		session.notificationBanners = {
			siteVisitTypeSelected: {
				appealId,
				type: 'success',
				text: 'Custom text'
			}
		};

		const result = buildNotificationBanners(session, servicePage, appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'Custom text'
				}
			}
		]);
	});

	it('should handle banners with HTML content', () => {
		session.notificationBanners = {
			appealAwaitingTransfer: { appealId }
		};

		const result = buildNotificationBanners(session, servicePage, appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					html: '<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, update the appeal with the new horizon reference.</p>'
				}
			}
		]);
	});
	it('should handle the interestedPartyCommentsRedactionSuccess banner', () => {
		session.notificationBanners = {
			interestedPartyCommentsRedactionSuccess: { appealId }
		};

		const result = buildNotificationBanners(session, 'viewIpComment', appealId);

		expect(result).toEqual([
			{
				type: 'notification-banner',
				parameters: {
					titleText: 'Success',
					titleHeadingLevel: 3,
					type: 'success',
					text: 'Comment redacted and accepted'
				}
			}
		]);
	});
});
