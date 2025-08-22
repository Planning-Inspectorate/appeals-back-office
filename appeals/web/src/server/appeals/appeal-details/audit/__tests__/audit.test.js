// @ts-nocheck
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import {
	activeDirectoryUsersData,
	caseAuditLog,
	caseNotificationAuditLog,
	appealData
} from '#testing/app/fixtures/referencedata.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { createTestEnvironment } from '#testing/index.js';
import { tryMapDocument } from '#appeals/appeal-details/audit/audit.mapper.js';
import { statusFormatMap } from '#appeals/appeal-details/representations/document-attachments/controller/redaction-status.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('audit', () => {
	beforeEach(() => {
		const appealWithCaseOfficerAndInspector = {
			...appealData,
			caseOfficer: activeDirectoryUsersData[0].id,
			inspector: activeDirectoryUsersData[4].id
		};
		nock('http://test/').get('/appeals/1').reply(200, appealWithCaseOfficerAndInspector).persist();
		installMockApi();
		usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
		usersService.getUserById = jest.fn((id) => {
			if (id === activeDirectoryUsersData[0].id) {
				return Promise.resolve(activeDirectoryUsersData[0]);
			} else if (id === activeDirectoryUsersData[4].id) {
				return Promise.resolve(activeDirectoryUsersData[4]);
			}
			return Promise.resolve(null);
		});
		usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
	});
	afterEach(teardown);

	describe('tryMapDocument', () => {
		const redactionStatusKeys = Object.keys(statusFormatMap);
		const randomKey = redactionStatusKeys[Math.floor(Math.random() * redactionStatusKeys.length)];
		const randomRedactStatus = statusFormatMap[randomKey].toLowerCase();
		const auditTrailEntryText = `Document 2288c506-bd6e-4a25-b0e3-05c10c350d9a_docstuff.docx uploaded (version 1, ${randomRedactStatus})`;
		const docInfo = {
			name: '2288c506-bd6e-4a25-b0e3-05c10c350d9a_docstuff.docx',
			documentGuid: 'efac1b7f-71c6-4780-bf22-edd0b0531914',
			stage: 'representation',
			folderId: 61306,
			documentType: 'representationAttachments'
		};

		it('should return audit trail entry with doc GUID removed from a supporting doc display name', async () => {
			const result = await tryMapDocument(1, auditTrailEntryText, docInfo, null);
			expect(result).toEqual(
				`Document <a class="govuk-link" href="#">docstuff.docx</a> uploaded (version 1, ${randomRedactStatus})`
			);
		});

		it('should include the redaction status in the audit log display text for a supporting document', async () => {
			const result = await tryMapDocument(1, auditTrailEntryText, docInfo, null);
			expect(result).toMatch(/unredacted|no redaction required|redacted/);
		});
	});

	describe('GET /:appealId/audit', () => {
		it('should render the case history page with a row for each audit log entry', async () => {
			const appealId = 1;
			nock('http://test/').get(`/appeals/${appealId}/audit-trails`).reply(200, caseAuditLog);
			nock('http://test/')
				.get(`/appeals/${appealId}/audit-notifications`)
				.reply(200, caseNotificationAuditLog);
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=comment&pageNumber=1&pageSize=9999`)
				.times(7)
				.reply(200, { items: [{ represented: { email: 'test1@email.com' } }] });

			const response = await request.get(`${baseUrl}/${appealId}/audit`);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Case history</h1>');
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Case progressed to <strong class="govuk-tag govuk-tag--green">Ready to start</strong></td>'
			);
			expect(unprettifiedHtml).toContain('<td class="govuk-table__cell">Case updated</td>');
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">The case timeline was created</td>'
			);
			expect(unprettifiedHtml).toContain('<td class="govuk-table__cell">Case updated</td>');
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Case progressed to <strong class="govuk-tag govuk-tag--green">LPA questionnaire</strong></td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Case progressed to <strong class="govuk-tag govuk-tag--green">Statements</strong></td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">LPA questionnaire updated</td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Case progressed to <strong class="govuk-tag govuk-tag--green">Final comments</strong></td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Statements and IP comments shared</td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Appellant final comments accepted</td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">LPA final comments accepted</td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Case progressed to <strong class="govuk-tag govuk-tag--green">Site visit ready to set up</strong></td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Final comments shared</td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">The site visit was arranged for Thursday 2 October</td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Case progressed to <strong class="govuk-tag govuk-tag--yellow">Awaiting site visit</strong></td>'
			);
			expect(unprettifiedHtml).toContain(
				'<td class="govuk-table__cell">Case progressed to <strong class="govuk-tag govuk-tag--green">Issue decision</strong></td>'
			);
		});
	});
});
