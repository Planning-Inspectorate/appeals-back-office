// @ts-nocheck
// Install mocks for third-party integration
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { jest } from '@jest/globals';
import nock from 'nock';
import './testing/app/mocks/msal.js';

// Keep HTTP retries disabled in tests so a single mocked failure
// maps to a single request and does not consume extra nock interceptors.
process.env.RETRY_MAX_ATTEMPTS = '0';

if (!nock.isActive()) {
	nock.activate();
}

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
	.mockImplementation((linked) => getEnabledHearingAppealTypes(linked));

jest.unstable_mockModule('#common/hearing-appeal-types.js', () => ({
	getEnabledHearingAppealTypes: mockGetEnabledHearingAppealTypes
}));

const mockGetEnabledInquiryAppealTypes = jest
	.fn()
	.mockImplementation((linked) => getEnabledInquiryAppealTypes(linked));

jest.unstable_mockModule('#common/inquiry-appeal-types.js', () => ({
	getEnabledInquiryAppealTypes: mockGetEnabledInquiryAppealTypes
}));
