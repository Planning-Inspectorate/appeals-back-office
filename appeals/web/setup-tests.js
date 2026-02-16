// @ts-nocheck
// Install mocks for third-party integration
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { jest } from '@jest/globals';
import './testing/app/mocks/msal.js';

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
