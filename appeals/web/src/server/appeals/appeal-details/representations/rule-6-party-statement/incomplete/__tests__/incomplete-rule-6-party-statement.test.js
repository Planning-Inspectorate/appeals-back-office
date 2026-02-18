import {
	appealDataFullPlanning,
	representationRejectionReasons
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

/** @type {{items: any[], itemCount: number}} */
let repsResponse = {
	items: [
		{
			id: 1,
			status: 'awaiting_review',
			author: 'Test Rule 6 Party',
			representationType: 'rule_6_party_statement',
			originalRepresentation: 'Test statement',
			represented: {
				id: 100
			},
			attachments: []
		}
	],
	itemCount: 1
};

describe('rule 6 party statement - incomplete', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				procedureType: 'inquiry',
				appealStatus: 'statements',
				appealRule6Parties: [
					{
						id: 1,
						serviceUserId: 100,
						partyName: 'Test Rule 6 Party',
						serviceUser: {
							organisationName: 'Test Rule 6 Party'
						}
					}
				],
				rule6PartyId: 1
			})
			.persist();

		nock('http://test/')
			.get('/appeals/2/reps?type=rule_6_party_statement')
			.reply(200, () => repsResponse)
			.persist();

		nock('http://test/')
			.get('/appeals/representation-rejection-reasons?type=rule_6_party_statement')
			.reply(200, representationRejectionReasons)
			.persist();

		nock('http://test/')
			.post('/appeals/add-business-days')
			.reply(200, JSON.stringify('2023-01-01T00:00:00.000Z'))
			.persist();
		nock('http://test/').patch('/appeals/2/reps/1/rejection-reasons').reply(200, {}).persist();
		nock('http://test/').patch('/appeals/2/reps/1').reply(200, {}).persist();
	});

	afterEach(teardown);

	describe('GET /incomplete/reasons', () => {
		it('should render the rejection reasons page', async () => {
			const response = await request.get(
				`${baseUrl}/2/rule-6-party-statement/1/incomplete/reasons`
			);

			expect(response.statusCode).toBe(200);
			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Why is the statement incomplete?</h1>');
		});
	});

	describe('POST /incomplete/reasons', () => {
		it('should redirect to set new date page when reasons are selected', async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/reasons`)
				.send({
					rejectionReason: '1',
					'rejectionReason-1': 'Test reason'
				});

			expect(response.statusCode).toBe(302);
			expect(response.header.location).toBe(
				`${baseUrl}/2/rule-6-party-statement/1/incomplete/date`
			);
		});

		it('should show error when no reason is selected', async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/reasons`)
				.send({});

			expect(response.statusCode).toBe(200);
			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('There is a problem</h2>');
			expect(unprettifiedHTML).toContain('Select why the statement is incomplete</a>');
		});
	});

	describe('GET /incomplete/date', () => {
		it('should render the set new date page', async () => {
			const response = await request.get(`${baseUrl}/2/rule-6-party-statement/1/incomplete/date`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
		});
	});

	describe('POST /incomplete/date', () => {
		it('should redirect to confirmation page', async () => {
			const response = await request
				.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/date`)
				.send({ setNewDate: 'yes' });

			expect(response.statusCode).toBe(302);
			expect(response.header.location).toBe(
				`${baseUrl}/2/rule-6-party-statement/1/incomplete/confirm`
			);
		});
	});

	describe('GET /incomplete/confirm', () => {
		it('should render the confirmation page', async () => {
			const agent = supertest.agent(app);

			await agent.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/reasons`).send({
				rejectionReason: '1',
				'rejectionReason-1': 'Test reason'
			});

			await agent
				.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/date`)
				.send({ setNewDate: 'no' });

			const response = await agent.get(`${baseUrl}/2/rule-6-party-statement/1/incomplete/confirm`);

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedHTML = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: 'body'
			}).innerHTML;

			expect(unprettifiedHTML).toContain('Check details and confirm statement is incomplete</h1>');
			expect(unprettifiedHTML).toContain('Received after deadline');
		});
	});

	describe('POST /incomplete/confirm', () => {
		it('should call APIs and redirect to appeal details with banner', async () => {
			const agent = supertest.agent(app);
			await agent.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/reasons`).send({
				rejectionReason: '1',
				'rejectionReason-1': 'Test reason'
			});

			await agent
				.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/date`)
				.send({ setNewDate: 'no' });

			const response = await agent
				.post(`${baseUrl}/2/rule-6-party-statement/1/incomplete/confirm`)
				.send({});

			expect(response.statusCode).toBe(302);
		});
	});
});
