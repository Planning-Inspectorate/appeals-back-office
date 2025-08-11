import { request } from '../../../app-test.js';

describe('business day validation routes', () => {
	describe('/appeals/validate-business-date', () => {
		describe('POST', () => {
			test('valid business day', async () => {
				const payload = {
					inputDate: '2024-12-20T23:59:00.000Z'
				};

				const response = await request.post('/appeals/validate-business-date').send(payload);

				expect(response.status).toEqual(200);
			});

			test('invalid business day', async () => {
				const payload = {
					inputDate: '2024-12-25T23:59:00.000Z'
				};

				const response = await request.post('/appeals/validate-business-date').send(payload);

				expect(response.status).toEqual(400);
			});

			test('BST weekend day', async () => {
				const payload = {
					inputDate: '2024-10-25T23:00:00.000Z'
				};

				const response = await request.post('/appeals/validate-business-date').send(payload);

				expect(response.status).toEqual(400);
			});

			test('BST business day', async () => {
				const payload = {
					inputDate: '2024-10-24T23:00:00.000Z'
				};

				const response = await request.post('/appeals/validate-business-date').send(payload);

				expect(response.status).toEqual(200);
			});

			test('another valid business day', async () => {
				const payload = {
					inputDate: '2024-03-28T23:59:00.000Z'
				};

				const response = await request.post('/appeals/validate-business-date').send(payload);

				expect(response.status).toEqual(200);
			});
		});
	});

	describe('/appeals/add-business-days', () => {
		describe('POST', () => {
			test('valid date', async () => {
				const payload = {
					inputDate: '2024-11-13T23:59:00.000Z',
					numDays: 7
				};

				const response = await request.post('/appeals/add-business-days').send(payload);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual('2024-11-22T00:00:00.000Z');
			});

			test('invalid date', async () => {
				const payload = {
					inputDate: 'not valid',
					numDays: 7
				};

				const response = await request.post('/appeals/add-business-days').send(payload);

				expect(response.status).toEqual(400);
			});
		});
	});
});
