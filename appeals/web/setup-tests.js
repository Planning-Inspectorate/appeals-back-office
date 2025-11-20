// @ts-nocheck
// Install mocks for third-party integration
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
