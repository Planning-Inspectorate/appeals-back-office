import { renderTemplate } from '#notify/notify-send.js';

describe('publish-statements-enforcement-hearing.content.md', () => {
	const templateName = 'publish-statements-enforcement-hearing.content.md';

	const basePersonalisation = {
		appeal_reference_number: 'ENF12345',
		site_address: '10, Enforcement Street',
		enforcement_reference: 'ENF/2025/0001',
		lpa_reference: 'LPA/2025/0002',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk',
		front_office_url: '/mock-front-office-url/appeals/ENF12345',
		has_appellant_statement: true,
		has_lpa_statement: true,
		has_ip_comments: true,
		hearing_date: '15 March 2025',
		hearing_time: '10:30am',
		hearing_expected_days: '2',
		inspector_name: 'Jane Smith',
		hearing_address: 'Hearing Room, 1 Test Avenue',
		final_comments_due_date: '20 March 2025',
		recipient_role: 'lpa'
	};

	const renderContent = (personalisation = {}) =>
		renderTemplate(templateName, { ...basePersonalisation, ...personalisation }).replaceAll(
			'\r\n',
			'\n'
		);

	const appealHearingAndNextStepsLines = [
		'# Appeal details',
		'',
		'^Appeal reference number: ENF12345',
		'Address: 10, Enforcement Street',
		'Enforcement notice reference: ENF/2025/0001',
		'',
		'# Hearing details',
		'',
		'^Date: 15 March 2025',
		'Time: 10:30am',
		'Expected days: 2',
		'Inspector: Jane Smith',
		'Venue address: Hearing Room, 1 Test Avenue',
		'',
		'We will contact you if we make any changes to the hearing.',
		'',
		'# What happens next',
		'You need to submit your final comments by 20 March 2025.',
		'',
		'Planning Inspectorate',
		'caseofficers@planninginspectorate.gov.uk'
	];

	test.each([
		{
			name: 'appellant statement, LPA statement and interested party comments are received',
			has_appellant_statement: true,
			has_lpa_statement: true,
			has_ip_comments: true,
			expectedContent: [
				'# Documents received',
				'- appellant’s statement',
				'- local planning authority’s statement',
				'- comments from interested parties',
				'',
				'You can [view this information in the appeals service](/mock-front-office-url/appeals/ENF12345).',
				...appealHearingAndNextStepsLines
			].join('\n')
		},
		{
			name: 'appellant statement and LPA statement are received',
			has_appellant_statement: true,
			has_lpa_statement: true,
			has_ip_comments: false,
			expectedContent: [
				'# Documents received',
				'- appellant’s statement',
				'- local planning authority’s statement',
				'',
				'You can [view this information in the appeals service](/mock-front-office-url/appeals/ENF12345).',
				'We did not receive comments from interested parties.',
				...appealHearingAndNextStepsLines
			].join('\n')
		},
		{
			name: 'appellant statement and interested party comments are received',
			has_appellant_statement: true,
			has_lpa_statement: false,
			has_ip_comments: true,
			expectedContent: [
				'# Documents received',
				'- appellant’s statement',
				'- comments from interested parties',
				'',
				'You can [view this information in the appeals service](/mock-front-office-url/appeals/ENF12345).',
				'We did not receive a statement from the local planning authority.',
				...appealHearingAndNextStepsLines
			].join('\n')
		},
		{
			name: 'LPA statement and interested party comments are received',
			has_appellant_statement: false,
			has_lpa_statement: true,
			has_ip_comments: true,
			expectedContent: [
				'# Documents received',
				'- local planning authority’s statement',
				'- comments from interested parties',
				'',
				'You can [view this information in the appeals service](/mock-front-office-url/appeals/ENF12345).',
				'We did not receive a statement from the appellant.',
				...appealHearingAndNextStepsLines
			].join('\n')
		},
		{
			name: 'only appellant statement is received',
			has_appellant_statement: true,
			has_lpa_statement: false,
			has_ip_comments: false,
			expectedContent: [
				'# Documents received',
				'- appellant’s statement',
				'',
				'You can [view this information in the appeals service](/mock-front-office-url/appeals/ENF12345).',
				'We did not receive a statement from the local planning authority.',
				'We did not receive comments from interested parties.',
				...appealHearingAndNextStepsLines
			].join('\n')
		},
		{
			name: 'only LPA statement is received',
			has_appellant_statement: false,
			has_lpa_statement: true,
			has_ip_comments: false,
			expectedContent: [
				'# Documents received',
				'- local planning authority’s statement',
				'',
				'You can [view this information in the appeals service](/mock-front-office-url/appeals/ENF12345).',
				'We did not receive a statement from the appellant.',
				'We did not receive comments from interested parties.',
				...appealHearingAndNextStepsLines
			].join('\n')
		},
		{
			name: 'only interested party comments are received',
			has_appellant_statement: false,
			has_lpa_statement: false,
			has_ip_comments: true,
			expectedContent: [
				'# Documents received',
				'- comments from interested parties',
				'',
				'You can [view this information in the appeals service](/mock-front-office-url/appeals/ENF12345).',
				'We did not receive a statement from the local planning authority.',
				'We did not receive a statement from the appellant.',
				...appealHearingAndNextStepsLines
			].join('\n')
		},
		{
			name: 'no statements or comments are received',
			has_appellant_statement: false,
			has_lpa_statement: false,
			has_ip_comments: false,
			expectedContent: [
				'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.',
				...appealHearingAndNextStepsLines
			].join('\n')
		}
	])(
		'should render the full template content correctly when $name',
		({ has_appellant_statement, has_lpa_statement, has_ip_comments, expectedContent }) => {
			const content = renderContent({
				has_appellant_statement,
				has_lpa_statement,
				has_ip_comments
			});

			expect(content).toEqual(expectedContent);
		}
	);

	test('should render alternate hearing and appeal detail content when optional variables are not supplied', () => {
		const content = renderContent({
			enforcement_reference: null,
			hearing_date: null,
			hearing_expected_days: '',
			inspector_name: '',
			hearing_address: '',
			final_comments_due_date: null
		});

		expect(content).toContain('Planning application reference: LPA/2025/0002');
		expect(content).not.toContain('Enforcement notice reference: ENF/2025/0001');
		expect(content).toContain('We will contact you by email when we set up the hearing.');
		expect(content).not.toContain('# Hearing details');
		expect(content).not.toContain('Time:');
		expect(content).not.toContain('Expected days:');
		expect(content).not.toContain('Inspector:');
		expect(content).not.toContain('Venue address:');
		expect(content).not.toContain('# What happens next');
	});

	test('should render appellant-specific final comments content when only the appellant statement is received', () => {
		const content = renderContent({
			has_appellant_statement: true,
			has_lpa_statement: false,
			has_ip_comments: false,
			recipient_role: 'appellant'
		});

		expect(content).toContain(
			'We will let you know if the local planning authority submits any final comments.'
		);
		expect(content).not.toContain('You need to submit your final comments by 20 March 2025.');
	});
});
