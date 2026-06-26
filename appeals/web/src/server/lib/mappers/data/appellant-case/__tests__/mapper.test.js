// @ts-nocheck
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { initialiseAndMapData } from '../mapper.js';

describe('appellant-case mapper', () => {
	const mockSession = {
		account: {
			name: 'Test User',
			idTokenClaims: {
				groups: ['update-case-group']
			}
		}
	};

	const mockRequest = {};

	it('should include statementCommonGround for standard S78 appeal', () => {
		const appellantCaseData = {
			...appellantCaseDataNotValidated,
			applicationDate: '2026-03-01T00:00:00.000Z',
			applicationDecision: 'refused',
			typeOfPlanningApplication: 'full-appeal',
			documents: {
				...appellantCaseDataNotValidated.documents,
				statementCommonGround: { folderId: 123 }
			}
		};

		const appealDetails = {
			...appealData,
			appealType: APPEAL_TYPE.S78,
			validAt: '2026-03-01T00:00:00.000Z'
		};

		const result = initialiseAndMapData(
			appellantCaseData,
			appealDetails,
			'/test-route',
			mockSession,
			mockRequest
		);

		expect(result.statementCommonGround).toBeDefined();
	});

	it('should NOT include statementCommonGround for S78 expedited appeal', () => {
		const appellantCaseData = {
			...appellantCaseDataNotValidated,
			applicationDate: '2026-04-02T00:00:00.000Z',
			applicationDecision: 'refused',
			typeOfPlanningApplication: 'full-appeal',
			documents: {
				...appellantCaseDataNotValidated.documents,
				statementCommonGround: { folderId: 123 }
			}
		};

		const appealDetails = {
			...appealData,
			appealType: APPEAL_TYPE.S78,
			validAt: '2026-04-02T00:00:00.000Z'
		};

		const result = initialiseAndMapData(
			appellantCaseData,
			appealDetails,
			'/test-route',
			mockSession,
			mockRequest
		);

		expect(result.statementCommonGround).toBeUndefined();
	});
});
