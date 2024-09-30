import { request } from '../../../app-test.js';

describe('business day validation routes', () => {
	describe('/appeals/validate-business-date', () => {
		describe('POST', () => {
			test('valid business day', async () => {
				const payload = {
					inputDate: '2023-12-20T23:59:00.000Z'
				};

				const response = await request.post('/appeals/validate-business-date').send(payload);

				expect(response.status).toEqual(200);
			});

			test('invalid business day', async () => {
				const payload = {
					inputDate: '2023-12-25T23:59:00.000Z'
				};

				const response = await request.post('/appeals/validate-business-date').send(payload);

				expect(response.status).toEqual(400);
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
});
