// Install mocks for third-party integration
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { jest } from '@jest/globals';
import nock from 'nock';
import './testing/app/mocks/msal.js';

if (!nock.isActive()) {
	nock.activate();
}

nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');

const mockGenerateNotifyPreview = /** @type {typeof generateNotifyPreview} */ (
	jest.fn().mockImplementation((apiClient, templateName, personalisation) =>
		/* @ts-ignore */
		generateNotifyPreview(apiClient, templateName, personalisation)
	)
);

jest.unstable_mockModule('#lib/api/notify-preview.api.js', () => ({
	generateNotifyPreview: mockGenerateNotifyPreview
}));

const mockGetEnabledHearingAppealTypes = /** @type {typeof getEnabledHearingAppealTypes} */ (
	jest.fn().mockImplementation((linked) =>
		/* @ts-ignore */
		getEnabledHearingAppealTypes(linked)
	)
);

jest.unstable_mockModule('#common/hearing-appeal-types.js', () => ({
	getEnabledHearingAppealTypes: mockGetEnabledHearingAppealTypes
}));

const mockGetEnabledInquiryAppealTypes = /** @type {typeof getEnabledInquiryAppealTypes} */ (
	jest.fn().mockImplementation((linked) =>
		/* @ts-ignore */
		getEnabledInquiryAppealTypes(linked)
	)
);

jest.unstable_mockModule('#common/inquiry-appeal-types.js', () => ({
	getEnabledInquiryAppealTypes: mockGetEnabledInquiryAppealTypes
}));
