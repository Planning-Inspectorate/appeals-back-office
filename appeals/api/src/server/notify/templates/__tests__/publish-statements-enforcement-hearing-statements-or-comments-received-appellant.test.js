import { renderTemplate } from '#notify/notify-send.js';

describe('publish-statements-enforcement-hearing-statements-or-comments-received-appellant.md', () => {
	const basePersonalisation = {
		appeal_reference_number: 'ABC45678',
		site_address: '10, Test Street',
		lpa_reference: '12345XYZ',
		front_office_url: '/mock-front-office-url/appeals/ABC45678',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk',
		hearing_date: '15 March 2025',
		hearing_time: '10:00am',
		hearing_expected_days: 2,
		inspector_name: 'J Smith',
		hearing_address: '10, Test Street',
		final_comments_due_date: '15 April 2026'
	};

	test('renders when statements or comments were received', () => {
		const content = renderTemplate(
			'publish-statements-enforcement-hearing-statements-or-comments-received-appellant.content.md',
			{
				...basePersonalisation,
				has_appellant_statement: true,
				has_lpa_statement: false,
				has_ip_comments: false
			}
		);

		expect(content).toContain('appellant’s statement');
		expect(content).toContain('We did not receive a statement from the local planning authority.');
		expect(content).toContain('We did not receive comments from interested parties.');
		expect(content).toContain(
			'We will let you know if the local planning authority submits any final comments.'
		);
	});

	test('renders the no statements or comments fallback branch', () => {
		const content = renderTemplate(
			'publish-statements-enforcement-hearing-statements-or-comments-received-appellant.content.md',
			{
				...basePersonalisation,
				has_appellant_statement: false,
				has_lpa_statement: false,
				has_ip_comments: false
			}
		);

		expect(content).toContain(
			'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.'
		);
	});
});
