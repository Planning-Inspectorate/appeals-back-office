import { renderTemplate } from '#notify/notify-send.js';
import { FRONT_OFFICE_DASHBOARD_PATH_STUBS } from '@pins/appeals/constants/common.js';

describe('publish-statements-enforcement-written-reps.content.md', () => {
	const templateName = 'publish-statements-enforcement-written-reps.content.md';

	const basePersonalisation = {
		appeal_reference_number: 'ENF12345',
		site_address: '10, Enforcement Street',
		enforcement_reference: 'ENF/2025/0001',
		lpa_reference: 'LPA/2025/0002',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk',
		front_office_url: 'https://example.com',
		final_comments_due_date: '20 March 2025'
	};

	const renderContent = (personalisation = {}) =>
		renderTemplate(templateName, { ...basePersonalisation, ...personalisation }).replaceAll(
			'\r\n',
			'\n'
		);

	const HEADER_DOCUMENTS_RECEIVED = '# Documents received';
	const ITEM_APPELLANT_STATEMENT = '- appellant’s statement';
	const ITEM_LPA_STATEMENT = '- local planning authority’s statement';
	const ITEM_IP_COMMENTS = '- comments from interested parties';

	const MSG_NO_LPA_STATEMENT = 'We did not receive a statement from the local planning authority.';
	const MSG_NO_APPELLANT_STATEMENT = 'We did not receive a statement from the appellant.';
	const MSG_NO_IP_COMMENTS = 'We did not receive comments from interested parties.';
	const MSG_NOTHING_RECEIVED =
		'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.';

	const HEADER_WHAT_HAPPENS_NEXT = '# What happens next';
	const MSG_APPELLANT_SUBMITS_FINAL_COMMENTS =
		'We will let you know if the appellant submits any final comments.';
	const MSG_LPA_SUBMITS_FINAL_COMMENTS =
		'We will let you know if the local planning authority submits any final comments.';

	const appealDetailsLines = [
		'# Appeal details',
		'',
		`^Appeal reference number: ${basePersonalisation.appeal_reference_number}`,
		`Address: ${basePersonalisation.site_address}`,
		`Enforcement notice reference: ${basePersonalisation.enforcement_reference}`
	];

	const defaultNextStepsLines = [
		HEADER_WHAT_HAPPENS_NEXT,
		'',
		`You need to submit any final comments by ${basePersonalisation.final_comments_due_date}.`
	];

	const onlyAppellantStatementSubmittedAppellantNextStepsLines = [
		HEADER_WHAT_HAPPENS_NEXT,
		'',
		MSG_LPA_SUBMITS_FINAL_COMMENTS
	];

	const onlyLpaStatementSubmittedLpaNextStepsLines = [
		HEADER_WHAT_HAPPENS_NEXT,
		'',
		MSG_APPELLANT_SUBMITS_FINAL_COMMENTS
	];

	const footerLines = ['Planning Inspectorate', basePersonalisation.team_email_address];

	const scenarios = [
		// 1. YES Appellant, YES LPA, YES IP comments
		{
			scenarioNumber: 1,
			description:
				'Scenario 1 - Statements and IP comments to share (YES Appellant, YES LPA, YES IP comments)',
			has_appellant_statement: true,
			has_lpa_statement: true,
			has_ip_comments: true,
			documentsReceivedBlock: [
				HEADER_DOCUMENTS_RECEIVED,
				ITEM_APPELLANT_STATEMENT,
				ITEM_LPA_STATEMENT,
				ITEM_IP_COMMENTS,
				''
			],
			didNotReceiveLines: [],
			appellantNextSteps: defaultNextStepsLines,
			lpaNextSteps: defaultNextStepsLines
		},
		// 2. YES Appellant, YES LPA, NO IP comments
		{
			scenarioNumber: 2,
			description:
				'Scenario 2 - Appellant and LPA statements to share, no IP comments (YES Appellant, YES LPA, NO IP comments)',
			has_appellant_statement: true,
			has_lpa_statement: true,
			has_ip_comments: false,
			documentsReceivedBlock: [
				HEADER_DOCUMENTS_RECEIVED,
				ITEM_APPELLANT_STATEMENT,
				ITEM_LPA_STATEMENT,
				''
			],
			didNotReceiveLines: [MSG_NO_IP_COMMENTS],
			appellantNextSteps: defaultNextStepsLines,
			lpaNextSteps: defaultNextStepsLines
		},
		// 3. NO Appellant, YES LPA, YES IP comments
		{
			scenarioNumber: 3,
			description:
				'Scenario 3 - LPA statement and IP comments to share, no appellant statement (NO Appellant, YES LPA, YES IP comments)',
			has_appellant_statement: false,
			has_lpa_statement: true,
			has_ip_comments: true,
			documentsReceivedBlock: [HEADER_DOCUMENTS_RECEIVED, ITEM_LPA_STATEMENT, ITEM_IP_COMMENTS, ''],
			didNotReceiveLines: [MSG_NO_APPELLANT_STATEMENT],
			appellantNextSteps: defaultNextStepsLines,
			lpaNextSteps: defaultNextStepsLines
		},
		// 4. NO Appellant, YES LPA, NO IP comments
		{
			scenarioNumber: 4,
			description:
				'Scenario 4 - LPA statement to share, no appellant statement and no IP comments (NO Appellant, YES LPA, NO IP comments)',
			has_appellant_statement: false,
			has_lpa_statement: true,
			has_ip_comments: false,
			documentsReceivedBlock: [HEADER_DOCUMENTS_RECEIVED, ITEM_LPA_STATEMENT, ''],
			didNotReceiveLines: [MSG_NO_APPELLANT_STATEMENT, MSG_NO_IP_COMMENTS],
			appellantNextSteps: defaultNextStepsLines,
			lpaNextSteps: onlyLpaStatementSubmittedLpaNextStepsLines
		},
		// 5. YES Appellant, NO LPA, YES IP comments
		{
			scenarioNumber: 5,
			description:
				'Scenario 5 - Appellant statement and IP comments to share, no LPA statement (YES Appellant, NO LPA, YES IP comments)',
			has_appellant_statement: true,
			has_lpa_statement: false,
			has_ip_comments: true,
			documentsReceivedBlock: [
				HEADER_DOCUMENTS_RECEIVED,
				ITEM_APPELLANT_STATEMENT,
				ITEM_IP_COMMENTS,
				''
			],
			didNotReceiveLines: [MSG_NO_LPA_STATEMENT],
			appellantNextSteps: defaultNextStepsLines,
			lpaNextSteps: defaultNextStepsLines
		},
		// 6. YES Appellant, NO LPA, NO IP comments
		{
			scenarioNumber: 6,
			description:
				'Scenario 6 - Appellant statement to share, no LPA statement and no IP comments (YES Appellant, NO LPA, NO IP comments)',
			has_appellant_statement: true,
			has_lpa_statement: false,
			has_ip_comments: false,
			documentsReceivedBlock: [HEADER_DOCUMENTS_RECEIVED, ITEM_APPELLANT_STATEMENT, ''],
			didNotReceiveLines: [MSG_NO_LPA_STATEMENT, MSG_NO_IP_COMMENTS],
			appellantNextSteps: onlyAppellantStatementSubmittedAppellantNextStepsLines,
			lpaNextSteps: defaultNextStepsLines
		},
		// 7. NO Appellant, NO LPA, YES IP comments
		{
			scenarioNumber: 7,
			description:
				'Scenario 7 - No statements but IP comments to share (NO Appellant, NO LPA, YES IP comments)',
			has_appellant_statement: false,
			has_lpa_statement: false,
			has_ip_comments: true,
			documentsReceivedBlock: [HEADER_DOCUMENTS_RECEIVED, ITEM_IP_COMMENTS, ''],
			didNotReceiveLines: [MSG_NO_LPA_STATEMENT, MSG_NO_APPELLANT_STATEMENT],
			appellantNextSteps: defaultNextStepsLines,
			lpaNextSteps: defaultNextStepsLines
		},
		// 8. NO Appellant, NO LPA, NO IP comments
		{
			scenarioNumber: 8,
			description:
				'Scenario 8 - No statements and no IP comments to share (NO Appellant, NO LPA, NO IP comments)',
			has_appellant_statement: false,
			has_lpa_statement: false,
			has_ip_comments: false,
			documentsReceivedBlock: [],
			didNotReceiveLines: [MSG_NOTHING_RECEIVED],
			appellantNextSteps: [],
			lpaNextSteps: []
		}
	];

	describe.each(scenarios)(
		'Scenario $scenarioNumber: $description',
		({
			has_appellant_statement,
			has_lpa_statement,
			has_ip_comments,
			documentsReceivedBlock,
			didNotReceiveLines,
			appellantNextSteps,
			lpaNextSteps
		}) => {
			test('should render the full template in its entirety for Appellant / Agent recipient', () => {
				const hasAnyDocuments = has_appellant_statement || has_lpa_statement || has_ip_comments;

				const expectedLines = hasAnyDocuments
					? [
							...documentsReceivedBlock,
							'You can [view this information in the appeals service](https://example.com/appeals/ENF12345).',
							...didNotReceiveLines,
							...appealDetailsLines,
							...appellantNextSteps,
							...footerLines
						]
					: [...didNotReceiveLines, ...appealDetailsLines, ...footerLines];

				const content = renderContent({
					has_appellant_statement,
					has_lpa_statement,
					has_ip_comments,
					fo_dashboard_stub: FRONT_OFFICE_DASHBOARD_PATH_STUBS.APPELLANT,
					recipient_role: 'appellant'
				});

				expect(content).toEqual(expectedLines.join('\n'));
			});

			test('should render the full template in its entirety for LPA recipient', () => {
				const hasAnyDocuments = has_appellant_statement || has_lpa_statement || has_ip_comments;

				const expectedLines = hasAnyDocuments
					? [
							...documentsReceivedBlock,
							'You can [view this information in the appeals service](https://example.com/manage-appeals/ENF12345).',
							...didNotReceiveLines,
							...appealDetailsLines,
							...lpaNextSteps,
							...footerLines
						]
					: [...didNotReceiveLines, ...appealDetailsLines, ...footerLines];

				const content = renderContent({
					has_appellant_statement,
					has_lpa_statement,
					has_ip_comments,
					fo_dashboard_stub: FRONT_OFFICE_DASHBOARD_PATH_STUBS.LPA,
					recipient_role: 'lpa'
				});

				expect(content).toEqual(expectedLines.join('\n'));
			});
		}
	);

	describe('Optional personalisation & alternate appeal details', () => {
		test('should render alternate appeal details for LDC appeals (planning application reference instead of enforcement notice reference)', () => {
			const content = renderContent({
				enforcement_reference: null,
				final_comments_due_date: null,
				fo_dashboard_stub: FRONT_OFFICE_DASHBOARD_PATH_STUBS.LPA,
				recipient_role: 'lpa'
			});

			expect(content).toContain('Planning application reference: LPA/2025/0002');
			expect(content).not.toContain('Enforcement notice reference: ENF/2025/0001');
			expect(content).not.toContain('# What happens next');
		});
	});
});
