// @ts-nocheck
process.env.LOG_LEVEL_STDOUT = 'fatal';
process.env.SESSION_SECRET = 'JEST_SESSION_SECRET';

// Install mocks for third-party integration
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { jest } from '@jest/globals';
import nock from 'nock';
import './testing/app/mocks/msal.js';

nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');

const mockGenerateNotifyPreview = jest
	.fn()
	.mockImplementation((apiClient, templateName, personalisation) =>
		generateNotifyPreview(apiClient, templateName, personalisation)
	);

jest.unstable_mockModule('#lib/api/notify-preview.api.js', () => ({
	generateNotifyPreview: mockGenerateNotifyPreview
}));

const mockGetEnabledHearingAppealTypes = jest
	.fn()
	.mockImplementation(() => getEnabledHearingAppealTypes());

jest.unstable_mockModule('#common/hearing-appeal-types.js', () => ({
	getEnabledHearingAppealTypes: mockGetEnabledHearingAppealTypes
}));

const mockGetEnabledInquiryAppealTypes = jest
	.fn()
	.mockImplementation(() => getEnabledInquiryAppealTypes());

jest.unstable_mockModule('#common/inquiry-appeal-types.js', () => ({
	getEnabledInquiryAppealTypes: mockGetEnabledInquiryAppealTypes
}));
