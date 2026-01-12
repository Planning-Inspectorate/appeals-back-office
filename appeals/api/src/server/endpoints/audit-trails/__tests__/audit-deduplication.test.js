import repository from '#repositories/audit-trail.repository.js';
import { jest } from '@jest/globals';
import { auditRequestCache, createAuditTrail } from '../audit-trails.service.js';

describe('Audit Trail Deduplication Proof', () => {
	const originalEnv = process.env.NODE_ENV;

	beforeAll(() => {
		jest.useFakeTimers();
		// @ts-ignore
		jest.spyOn(repository, 'findFirst').mockResolvedValue(null);
		// @ts-ignore
		jest.spyOn(repository, 'createAuditTrail').mockResolvedValue({});
	});

	beforeEach(() => {
		auditRequestCache.clear();
		process.env.NODE_ENV = 'production';
	});

	afterAll(() => {
		process.env.NODE_ENV = originalEnv;
		jest.useRealTimers();
	});

	test('should block identical audit trails for same appeal', async () => {
		const data = { appealId: 1, azureAdUserId: 'uuid', details: 'Status Changed' };

		await createAuditTrail(data);
		await createAuditTrail(data);

		expect(auditRequestCache.size).toBe(1);
	});

	test('should NOT block different details for same appeal', async () => {
		await createAuditTrail({ appealId: 1, azureAdUserId: 'u', details: 'Detail A' });
		await createAuditTrail({ appealId: 1, azureAdUserId: 'u', details: 'Detail B' });

		expect(auditRequestCache.size).toBe(2);
	});
});
