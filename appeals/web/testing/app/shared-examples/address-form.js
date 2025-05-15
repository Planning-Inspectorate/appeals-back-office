// @ts-nocheck
/* eslint-disable no-undef */
import { parseHtml } from '@pins/platform';

export const behavesLikeAddressForm = ({ request, url }) => {
	const errorRoot = '.govuk-error-summary';

	[
		['null', null],
		['an empty string', '']
	].forEach(([description, invalidValue]) => {
		it(`should re-render the page if addressLine1 is ${description}`, async () => {
			const invalidData = {
				addressLine1: invalidValue,
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request.post(url).send(invalidData);

			expect(response.statusCode).toBe(400);
			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter address line 1</a>');
		});

		it(`should re-render the page if town is ${description}`, async () => {
			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: invalidValue,
				county: null,
				postCode: 'E1 8RU'
			};
			const response = await request.post(url).send(invalidData);

			expect(response.statusCode).toBe(400);
			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter town or city</a>');
		});

		it(`should re-render the page if the postcode is ${description}`, async () => {
			const invalidData = {
				addressLine1: '123 Long Road',
				addressLine2: null,
				town: 'London',
				county: null,
				postCode: invalidValue
			};
			const response = await request.post(url).send(invalidData);

			expect(response.statusCode).toBe(400);

			const element = parseHtml(response.text, { rootElement: errorRoot });

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Enter postcode</a>');
		});
	});

	it('should re-render the page if the postcode is invalid', async () => {
		const invalidData = {
			addressLine1: '123 Long Road',
			addressLine2: null,
			town: 'London',
			county: null,
			postCode: '111'
		};
		const response = await request.post(url).send(invalidData);

		expect(response.statusCode).toBe(400);

		const element = parseHtml(response.text, { rootElement: errorRoot });

		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('There is a problem</h2>');
		expect(element.innerHTML).toContain('Enter a full UK postcode</a>');
	});
};
