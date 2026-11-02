// @ts-nocheck
import { jest } from '@jest/globals';

const mockRenderPageComponentsToHtml = jest.fn((components) => JSON.stringify(components));

jest.unstable_mockModule('#lib/nunjucks-template-builders/page-component-rendering.js', () => ({
	renderPageComponentsToHtml: mockRenderPageComponentsToHtml,
	preRenderPageComponents: jest.fn()
}));

const { generateStatusTags } = await import('../status-tags.mapper.js');

describe('status-tags mapper', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('includes redetermined status tag when isRedetermined is true', async () => {
		const mappedData = {
			appeal: {
				appealStatus: {
					display: {
						statusTag: {
							status: 'redetermination_stage_1',
							classes: ''
						}
					}
				},
				leadOrChild: {}
			}
		};

		const appealDetails = {
			appealId: 1,
			appealStatus: 'redetermination_stage_1',
			isRedetermined: true,
			costs: {}
		};

		const request = {};

		const result = await generateStatusTags(mappedData, appealDetails, request);

		expect(result).toHaveLength(1);
		expect(mockRenderPageComponentsToHtml).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					type: 'status-tag',
					parameters: expect.objectContaining({
						status: 'redetermined'
					})
				})
			])
		);
	});

	it('does not include redetermined status tag when isRedetermined is false', async () => {
		const mappedData = {
			appeal: {
				appealStatus: {
					display: {
						statusTag: {
							status: 'event',
							classes: ''
						}
					}
				},
				leadOrChild: {}
			}
		};

		const appealDetails = {
			appealId: 1,
			appealStatus: 'event',
			isRedetermined: false,
			costs: {}
		};

		const request = {};

		const result = await generateStatusTags(mappedData, appealDetails, request);

		expect(result).toHaveLength(1);
		expect(mockRenderPageComponentsToHtml).toHaveBeenCalledWith(
			expect.not.arrayContaining([
				expect.objectContaining({
					type: 'status-tag',
					parameters: expect.objectContaining({
						status: 'redetermined'
					})
				})
			])
		);
	});
});
