import { renderTemplate } from '#notify/notify-send.js';

const personalisation = {
	appeal_type: 'Enforcement Notice',
	enforcement_reference: 'ENF/123',
	appeal_reference_number: '123456',
	site_address: '10 Test Street',
	start_date: '1 January 2025',
	inspector_name: '',
	appeal_grounds: ['a'],
	other_appeals_grounds_group: [],
	child_appeals: [],
	questionnaire_due_date: '8 January 2025',
	lpa_statement_deadline: '15 January 2025',
	ip_comments_deadline: '22 January 2025',
	statement_of_common_ground_deadline: '',
	final_comments_deadline: '29 January 2025',
	proof_of_evidence_and_witnesses_deadline: '5 February 2025',
	case_management_conference_deadline: '',
	inquiry_date: '12 February 2025',
	inquiry_time: '10:00am',
	inquiry_expected_days: '',
	inquiry_address: '',
	team_email_address: 'team@example.com',
	front_office_url: 'https://example.com'
};

describe.each([
	['appellant', 'Statements'],
	['lpa', 'Statements from the local planning authority and any Rule 6 groups']
])('enforcement inquiry start case notification for %s', (recipient, statementsHeading) => {
	const template = `appeal-valid-start-case-enforcement-inquiry-${recipient}.content.md`;
	/** @param {Parameters<typeof renderTemplate>[1]} values */
	const render = (values) => renderTemplate(template, values).replaceAll('\r\n', '\n');

	test('renders the complete notification with optional details omitted', () => {
		const expectedContent = (
			recipient === 'appellant'
				? [
						'We have reviewed your appeal and supporting documents.',
						'',
						'Your appeal started on 1 January 2025. The timetable for the appeal begins from this date.',
						'',
						'Your appeal procedure is an inquiry.',
						'',
						'# Appeal details',
						'',
						'^Appeal reference number: 123456',
						'Address: 10 Test Street',
						'Enforcement notice reference: ENF/123',
						'',
						'',
						'# Grounds of appeal',
						'',
						'The appeal will continue on the following grounds:',
						'',
						'Ground (a)',
						'',
						'# Timetable',
						'',
						'Enforcement appeals are currently taking longer than usual. Find out about the [average handling times for appeals](https://www.gov.uk/guidance/appeals-how-long-they-take).',
						'',
						'## Local planning authority questionnaire',
						'',
						'Due by 8 January 2025.',
						'',
						`## ${statementsHeading}`,
						'',
						'Due by 15 January 2025.',
						'',
						'## Interested party comments',
						'',
						'Due by 22 January 2025.',
						'',
						'## Statement of common ground',
						'',
						'We will let you know when you can submit your statement of common ground.',
						'',
						'## Final comments',
						'',
						'Due by 29 January 2025.',
						'',
						'## Proof of evidence and witnesses',
						'',
						'Due by 5 February 2025.',
						'',
						'## Case management conference',
						'',
						'We will contact you when we set up your case management conference.',
						'',
						'',
						'# Inquiry details',
						'',
						'^Date: 12 February 2025',
						'Time: 10:00am',
						'',
						'The details of the inquiry are subject to change. We will contact you if we make any changes to the inquiry.',
						'',
						'Your witnesses should be available for the duration of the inquiry.',
						'',
						'# What happens next',
						'',
						'You need to [submit your statement](https://example.com) by 15 January 2025. If you have one.',
						'',
						'We will send you an email when you can view information from other parties in the appeals service.',
						'',
						'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
						'',
						'# Appeal costs',
						'',
						'You may have to pay costs if you:',
						'',
						'- behave unreasonably during the appeal',
						'- withdraw your enforcement notice without good reason',
						'- submit late evidence',
						'',
						'[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).',
						'',
						'Planning Inspectorate',
						'team@example.com'
					]
				: [
						'You have a new enforcement notice appeal against ENF/123.',
						'',
						'We will decide the appeal by inquiry. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
						'',
						'# Appeal details',
						'',
						'^Appeal reference number: 123456',
						'Address: 10 Test Street',
						'Enforcement notice reference: ENF/123',
						'Start date: 1 January 2025',
						'',
						'',
						'# Grounds of appeal',
						'',
						'The appeal will continue on the following grounds:',
						'',
						'Ground (a)',
						'',
						'# Timetable',
						'',
						'Enforcement appeals are currently taking longer than usual. Find out about the [average handling times for appeals](https://www.gov.uk/guidance/appeals-how-long-they-take).',
						'',
						'## Local planning authority questionnaire',
						'',
						'Due by 8 January 2025.',
						'',
						`## ${statementsHeading}`,
						'',
						'Due by 15 January 2025.',
						'',
						'## Interested party comments',
						'',
						'Due by 22 January 2025.',
						'',
						'## Statement of common ground',
						'',
						'We will let you know when you can submit your statement of common ground.',
						'',
						'',
						'## Final comments',
						'',
						'Due by 29 January 2025.',
						'',
						'## Proof of evidence and witnesses',
						'',
						'Due by 5 February 2025.',
						'',
						'## Case management conference',
						'',
						'We will contact you when we set up your case management conference.',
						'',
						'',
						'# Inquiry details',
						'',
						'^Date: 12 February 2025',
						'Time: 10:00am',
						'',
						'The details of the inquiry are subject to change. We will contact you if we make any changes to the inquiry.',
						'',
						'Your witnesses should be available for the duration of the inquiry.',
						'',
						'# What happens next',
						'',
						'1. [Submit your questionnaire and other documents](https://example.com/manage-appeals/123456), including your appeal notification letter and a list of those notified by 8 January 2025.',
						'',
						'2. Email team@example.com to confirm the venue address for the inquiry.',
						'',
						'',
						'[Find out more about your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
						'',
						'# Notifications',
						'',
						'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
						'',
						'# Appeal costs',
						'',
						'You may have to pay costs if you:',
						'',
						'- behave unreasonably during the appeal',
						'- withdraw your enforcement notice without good reason',
						'- submit late evidence',
						'',
						'[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).',
						'',
						'Planning Inspectorate',
						'team@example.com'
					]
		).join('\n');

		expect(render(personalisation)).toBe(expectedContent);
	});

	test('renders optional inquiry details, dates, multiple grounds and linked appeals', () => {
		const content = render({
			...personalisation,
			inspector_name: 'Inspector Smith',
			appeal_grounds: ['a', 'b'],
			other_appeals_grounds_group: [
				{ reference: '234567', grounds: ['c'] },
				{ reference: '345678', grounds: ['d', 'e'] },
				{ reference: '456789', grounds: [] }
			],
			child_appeals: ['234567', '345678'],
			statement_of_common_ground_deadline: '23 January 2025',
			case_management_conference_deadline: '30 January 2025',
			inquiry_expected_days: '3',
			inquiry_address: 'Town Hall'
		});

		expect(content).toContain('Inspector: Inspector Smith');
		expect(content).toContain(
			'123456 will continue on the following grounds:\n\n- Ground (a)\n- Ground (b)'
		);
		expect(content).toContain('234567 will continue on the following grounds:\n\nGround (c)');
		expect(content).toContain(
			'345678 will continue on the following grounds:\n\n- Ground (d)\n- Ground (e)'
		);
		expect(content).not.toContain('456789 will continue');
		expect(content).toContain(
			'The timetable is the same for the following linked appeals:\n- 234567\n- 345678'
		);
		expect(content).toContain('Send to team@example.com by 23 January 2025.');
		expect(content).toContain('Date: 30 January 2025.');
		expect(content).toContain('Expected days: 3\nVenue address: Town Hall');
		if (recipient === 'appellant') {
			expect(content).toContain(
				'[submit your statement](https://example.com) by 15 January 2025. If you have one.'
			);
			expect(content).not.toContain('Email team@example.com to confirm the venue address');
		} else {
			expect(content).toContain(
				'[Submit your questionnaire and other documents](https://example.com/manage-appeals/123456)'
			);
			expect(content).not.toContain('Email team@example.com to confirm the venue address');
			expect(content).not.toContain('1. [Submit your questionnaire');
		}
		expect(content).not.toContain('We will let you know when you can submit');
		expect(content).not.toContain(
			'We will contact you when we set up your case management conference'
		);
	});

	test('renders one linked appeal and no grounds when none are provided', () => {
		const content = render({
			...personalisation,
			appeal_grounds: [],
			child_appeals: ['234567']
		});

		expect(content).toContain('The timetable is the same for the linked appeal 234567.');
		expect(content).not.toContain('following linked appeals');
		expect(content).not.toContain('# Grounds of appeal');
		expect(content).not.toContain('Ground (');
	});
});
