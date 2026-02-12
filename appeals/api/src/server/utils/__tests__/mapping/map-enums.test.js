import { isValidLawfulDevelopmentCertificateType } from '#utils/mapping/map-enums.js';

describe('isValidLawfulDevelopmentCertificateType', () => {
	test('returns false not a valid enum option', () => {
		expect(isValidLawfulDevelopmentCertificateType('test')).toBe(false);
	});

	test('returns true if a valid enum option', () => {
		expect(isValidLawfulDevelopmentCertificateType('proposed-changes-to-a-listed-building')).toBe(
			true
		);
	});
});
