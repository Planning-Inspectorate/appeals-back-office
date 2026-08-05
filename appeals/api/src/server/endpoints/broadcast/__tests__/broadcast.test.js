import { savedFolder } from '#tests/documents/mocks.js';
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';

describe('broadcast routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('/broadcast/appeal/{id}', () => {
		describe('POST', () => {
			test('404 for non-existing appeal', async () => {
				const response = await request.post('/appeals/broadcast/appeal/999');

				expect(response.status).toEqual(404);
				expect(response.text).toEqual('appeal 999 not found');
			});

			test('400 for invalid appeal id', async () => {
				const response = await request.post('/appeals/broadcast/appeal/invalid');

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({ errors: { appealId: 'must be a number' } });
				//@ts-ignore
				expect(mockBroadcasters.broadcastAppeal).not.toHaveBeenCalled();
			});
		});
	});

	describe('/broadcast/document/{documentGuid}', () => {
		describe('POST', () => {
			test('404 for non-existing document', async () => {
				const response = await request
					.post('/appeals/broadcast/document/005b86fb-abba-4b20-91a3-eac7ece155fd')
					.send({
						version: 1,
						updateType: 'Update'
					});

				expect(response.status).toEqual(404);
			});

			test('400 for unknown bad uuid', async () => {
				const response = await request.post(`/appeals/broadcast/document/1`).send({
					version: 1,
					updateType: 'Update'
				});

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({ errors: { documentGuid: 'must be a uuid' } });
				//@ts-ignore
				expect(mockBroadcasters.broadcastDocument).not.toHaveBeenCalled();
			});

			test('400 for unknown bad version', async () => {
				const response = await request
					.post(`/appeals/broadcast/document/${savedFolder.documents[0].id}`)
					.send({
						version: 'test',
						updateType: 'Update'
					});

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({ errors: { version: 'must be a number' } });
				//@ts-ignore
				expect(mockBroadcasters.broadcastDocument).not.toHaveBeenCalled();
			});

			test('400 for unknown bad updateType', async () => {
				const response = await request
					.post(`/appeals/broadcast/document/${savedFolder.documents[0].id}`)
					.send({
						version: 1,
						updateType: 'Invalid'
					});

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { updateType: 'must be one of Create, Update or Delete' }
				});
				//@ts-ignore
				expect(mockBroadcasters.broadcastDocument).not.toHaveBeenCalled();
			});
		});
	});

	describe('/broadcast/representation/{representationId}', () => {
		describe('POST', () => {
			test('404 for non-existing representation', async () => {
				const response = await request.post(`/appeals/broadcast/representation/999`).send({
					updateType: 'Update'
				});

				expect(response.status).toEqual(404);
				expect(response.text).toEqual('representation 999 not found');
			});

			test('400 for unknown bad updateType', async () => {
				const response = await request.post(`/appeals/broadcast/representation/1`).send({
					updateType: 'Invalid'
				});

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { updateType: 'must be one of Create, Update or Delete' }
				});
				//@ts-ignore
				expect(mockBroadcasters.broadcastRepresentation).not.toHaveBeenCalled();
			});
		});
	});

	describe('/broadcast/serviceUser/{serviceUserId}', () => {
		describe('POST', () => {
			test('400 for unknown bad updateType', async () => {
				const response = await request.post(`/appeals/broadcast/serviceUser/1`).send({
					updateType: 'Invalid',
					roleName: 'Test Role',
					caseReference: 'Test Case Reference'
				});

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { updateType: 'must be one of Create, Update or Delete' }
				});
				//@ts-ignore
				expect(mockBroadcasters.broadcastServiceUser).not.toHaveBeenCalled();
			});

			test('400 for missing roleName', async () => {
				const response = await request.post(`/appeals/broadcast/serviceUser/1`).send({
					updateType: 'Create',
					caseReference: 'Test Case Reference'
				});

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { roleName: 'must be a string' }
				});
				//@ts-ignore
				expect(mockBroadcasters.broadcastServiceUser).not.toHaveBeenCalled();
			});

			test('400 for missing caseReference', async () => {
				const response = await request.post(`/appeals/broadcast/serviceUser/1`).send({
					updateType: 'Create',
					roleName: 'Test Role'
				});

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: { caseReference: 'must be a string' }
				});
				//@ts-ignore
				expect(mockBroadcasters.broadcastServiceUser).not.toHaveBeenCalled();
			});
		});
	});
});
