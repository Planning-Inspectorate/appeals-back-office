import { renderTemplate } from '#notify/notify-send.js';

describe('publish-statements-enforcement-hearing-no-statements-or-comments-received.content.md', () => {
	const templateName =
		'publish-statements-enforcement-hearing-no-statements-or-comments-received.content.md';

	const basePersonalisation = {
		appeal_reference_number: 'ENF12345',
		site_address: '10, Enforcement Street',
		enforcement_reference: 'ENF/2025/0001',
		lpa_reference: 'LPA/2025/0002',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk',
		hearing_date: '15 March 2025',
		hearing_time: '10:30am',
		hearing_expected_days: '2',
		inspector_name: 'Jane Smith',
		hearing_address: 'Hearing Room, 1 Test Avenue'
	};

	const renderContent = (personalisation = {}) =>
		renderTemplate(templateName, { ...basePersonalisation, ...personalisation }).replaceAll(
			'\r\n',
			'\n'
		);

	test('should render all supplied variables correctly when hearing details are available', () => {
		const content = renderContent();

		const expectedContent = [
			'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ENF12345',
			'Address: 10, Enforcement Street',
			'Enforcement notice reference: ENF/2025/0001',
			'',
			'# Hearing details',
			'Date: 15 March 2025',
			'Time: 10:30am',
			'Expected days: 2',
			'',
			'Inspector: Jane Smith',
			'',
			'Venue address: Hearing Room, 1 Test Avenue',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		expect(content).toEqual(expectedContent);
	});

	test('should render fallback content when hearing has not been set up', () => {
		const content = renderContent({
			enforcement_reference: null,
			hearing_date: null,
			hearing_expected_days: '',
			inspector_name: '',
			hearing_address: ''
		});

		const expectedContent = [
			'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ENF12345',
			'Address: 10, Enforcement Street',
			'Planning application reference: LPA/2025/0002',
			'',
			'We will contact you by email when we set up the hearing.',
			'',
			'Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		expect(content).toEqual(expectedContent);
		expect(content).not.toContain('# Hearing details');
		expect(content).not.toContain('Time:');
		expect(content).not.toContain('Expected days:');
		expect(content).not.toContain('Inspector:');
		expect(content).not.toContain('Venue address:');
	});

	test.each([
		{
			name: 'expected days is not supplied',
			personalisation: { hearing_expected_days: '' },
			expectedContent: 'Inspector: Jane Smith',
			unexpectedContent: 'Expected days:'
		},
		{
			name: 'inspector name is not supplied',
			personalisation: { inspector_name: '' },
			expectedContent: 'Expected days: 2',
			unexpectedContent: 'Inspector:'
		},
		{
			name: 'hearing address is not supplied',
			personalisation: { hearing_address: '' },
			expectedContent: 'Inspector: Jane Smith',
			unexpectedContent: 'Venue address:'
		}
	])(
		'should omit optional hearing detail when $name',
		({ personalisation, expectedContent, unexpectedContent }) => {
			const content = renderContent(personalisation);

			expect(content).toContain('# Hearing details');
			expect(content).toContain('Date: 15 March 2025');
			expect(content).toContain('Time: 10:30am');
			expect(content).toContain(expectedContent);
			expect(content).not.toContain(unexpectedContent);
		}
	);
});
