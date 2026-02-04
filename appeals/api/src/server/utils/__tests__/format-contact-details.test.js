import { formatContactDetails } from '../format-contact-details.js';

describe('formatContactDetails function', () => {
	const serviceUser = /** @type {import('@pins/appeals.api').Schema.ServiceUser} */ ({
		id: 1,
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com',
		phoneNumber: '1234567890'
	});
	it('should return the contact details in the correct format', () => {
		expect(formatContactDetails(serviceUser)).toBe('John Doe, john.doe@example.com, 1234567890');
	});

	it('should return the contact details in the correct format when the email is missing', () => {
		expect(formatContactDetails({ ...serviceUser, email: null })).toBe('John Doe, 1234567890');
	});

	it('should return the contact details in the correct format when the phone number is missing', () => {
		expect(formatContactDetails({ ...serviceUser, phoneNumber: null })).toBe(
			'John Doe, john.doe@example.com'
		);
	});

	it('should return the contact details in the correct format when the email and phone number are missing', () => {
		expect(formatContactDetails({ ...serviceUser, email: null, phoneNumber: null })).toBe(
			'John Doe'
		);
	});
});
