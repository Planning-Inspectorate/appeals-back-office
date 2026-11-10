// @ts-nocheck
import { databaseConnector } from '#utils/database-connector.js';
import { jest } from '@jest/globals';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import {
	getRepresentationTypesToPublish,
	loadAppealForPublishing,
	validateRepresentationsToPublish
} from '../representations.middleware.js';

describe('representation publishing middleware', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('selects statement representation types only', () => {
		expect(getRepresentationTypesToPublish(APPEAL_CASE_STATUS.STATEMENTS)).toEqual(
			expect.arrayContaining([
				APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
			])
		);
		expect(getRepresentationTypesToPublish(APPEAL_CASE_STATUS.STATEMENTS)).not.toContain(
			APPEAL_REPRESENTATION_TYPE.COMMENT
		);
		expect(getRepresentationTypesToPublish(APPEAL_CASE_STATUS.STATEMENTS)).not.toContain(
			APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		);
	});

	it('checks whether IP comments await review without loading them', async () => {
		const req = {
			appeal: {
				id: 2,
				currentStatus: APPEAL_CASE_STATUS.STATEMENTS,
				appealTimetable: {
					ipCommentsDueDate: new Date('2000-01-01'),
					lpaStatementDueDate: new Date('2000-01-01')
				},
				representations: []
			}
		};
		const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
		const next = jest.fn();
		databaseConnector.representation.findFirst.mockResolvedValue({ id: 5 });

		await validateRepresentationsToPublish(req, res, next);

		expect(databaseConnector.representation.findFirst).toHaveBeenCalledWith({
			where: {
				appealId: 2,
				representationType: { in: [APPEAL_REPRESENTATION_TYPE.COMMENT] },
				status: 'awaiting_review'
			},
			select: { id: true }
		});
		expect(res.status).toHaveBeenCalledWith(400);
		expect(next).not.toHaveBeenCalled();
	});

	it.each([
		[
			APPEAL_CASE_STATUS.FINAL_COMMENTS,
			[
				APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
				APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
			]
		],
		[
			APPEAL_CASE_STATUS.EVIDENCE,
			[
				APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
				APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
				APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
			]
		]
	])('selects only %s representation types', (status, types) => {
		expect(getRepresentationTypesToPublish(status)).toEqual(types);
	});

	it('filters the full appeal lookup to types needed for current status', async () => {
		const req = {
			params: { appealId: '2' },
			query: {},
			appeal: { currentStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS }
		};
		const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
		const next = jest.fn();
		databaseConnector.appeal.findUnique.mockResolvedValue({
			id: 2,
			appealType: { key: 'D' }
		});

		await loadAppealForPublishing(req, res, next);

		expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				include: expect.objectContaining({
					representations: {
						where: {
							representationType: {
								in: [
									APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
									APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
								]
							}
						}
					}
				})
			})
		);
		expect(next).toHaveBeenCalled();
	});

	it('does not perform a full lookup for an unsupported status', async () => {
		const req = { appeal: { currentStatus: 'unknown' } };
		const res = {};
		const next = jest.fn();

		await loadAppealForPublishing(req, res, next);

		expect(databaseConnector.appeal.findUnique).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});
});
