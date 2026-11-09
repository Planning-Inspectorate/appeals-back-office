// @ts-nocheck
import { checkCostsAppliedFor } from '#utils/check-costs-applied-for.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('check costs applied for', () => {
	const noDocuments = [
		{ path: 'costs/appellantCostsApplication', _count: { documents: 0 } },
		{ path: 'costs/appellantCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/appellantCostsWithdrawal', _count: { documents: 0 } },
		{ path: 'costs/lpaCostsApplication', _count: { documents: 0 } },
		{ path: 'costs/lpaCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/lpaCostsWithdrawal', _count: { documents: 0 } }
	];

	const moreApplications = [
		{ path: 'costs/appellantCostsApplication', _count: { documents: 2 } },
		{ path: 'costs/appellantCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/appellantCostsWithdrawal', _count: { documents: 1 } },
		{ path: 'costs/lpaCostsApplication', _count: { documents: 1 } },
		{ path: 'costs/lpaCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/lpaCostsWithdrawal', _count: { documents: 0 } }
	];

	const moreWithdrawals = [
		{ path: 'costs/appellantCostsApplication', _count: { documents: 0 } },
		{ path: 'costs/appellantCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/appellantCostsWithdrawal', _count: { documents: 1 } },
		{ path: 'costs/lpaCostsApplication', _count: { documents: 1 } },
		{ path: 'costs/lpaCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/lpaCostsWithdrawal', _count: { documents: 2 } }
	];

	const equalApplicationsAndWithdrawals = [
		{ path: 'costs/appellantCostsApplication', _count: { documents: 1 } },
		{ path: 'costs/appellantCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/appellantCostsWithdrawal', _count: { documents: 1 } },
		{ path: 'costs/lpaCostsApplication', _count: { documents: 4 } },
		{ path: 'costs/lpaCostsDecisionLetter', _count: { documents: 0 } },
		{ path: 'costs/lpaCostsWithdrawal', _count: { documents: 4 } }
	];

	it.each([
		[false, 'no costs documents', noDocuments],
		[true, 'more costs applications than withdrawals', moreApplications],
		[false, 'more costs withdrawals than applications', moreWithdrawals],
		[false, 'equal costs applications and withdrawals', equalApplicationsAndWithdrawals]
	])(
		'should return appellantCostsAppliedFor and lpaCostsAppliedFor as %s if there are %s',
		async (expectedValue, _, documents) => {
			databaseConnector.folder.findMany.mockResolvedValue(documents);
			const result = await checkCostsAppliedFor(123);
			expect(result).toEqual({
				appellantCostsAppliedFor: expectedValue,
				lpaCostsAppliedFor: expectedValue
			});
		}
	);
});
