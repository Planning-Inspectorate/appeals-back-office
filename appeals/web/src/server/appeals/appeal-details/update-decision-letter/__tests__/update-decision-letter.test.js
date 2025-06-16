// @ts-nocheck
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const oneThousdandAndOneCharacterString = 'a'.repeat(1001);
const oneThousdandCharacterString = 'a'.repeat(1000);

describe('update-decision-letter', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /update-decision-letter/correction-notice', () => {
		it(`should render the 'correction-notice' page with the expected content`, async () => {
			const response = await request.get(`${baseUrl}/1/update-decision-letter/correction-notice`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			console.log('unprettifiedElement', unprettifiedElement.innerHTML);
			expect(unprettifiedElement.innerHTML).toContain('Correction notice');
		});
	});

	describe('POST /upload-decision-letter/correction-notice', () => {
		it(`should return 'Enter the correction notice' when nothing value provided`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.expect(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Enter the correction notice</a>');
			expect(unprettifiedElement.innerHTML).toContain('href="#correction-notice"');
			expect(unprettifiedElement.innerHTML).toContain('Enter the correction notice</p>');
		});
		it(`should return expected error message if invalid character entered(non ascii)`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.send({ correctionNotice: '😀' })
				.expect(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('href="#correction-notice"');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain('😀');
		});

		it(`should return expected error message if over 1000 characters entered`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.send({ correctionNotice: oneThousdandAndOneCharacterString })
				.expect(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must be 1000 characters or less</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('href="#correction-notice"');
			expect(unprettifiedElement.innerHTML).toContain(
				'Correction notice must be 1000 characters or less</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain(oneThousdandAndOneCharacterString);
		});

		it(`should rredirect to CYA page if valid correction notice provided`, async () => {
			const response = await request
				.post(`${baseUrl}/1/update-decision-letter/correction-notice`)
				.send({ correctionNotice: oneThousdandCharacterString })
				.expect(302);
			expect(response.headers.location).toBe(`${baseUrl}/1/update-decision-letter/check-details`);
		});
	});
});
