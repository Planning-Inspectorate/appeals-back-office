// @ts-nocheck
import { mapStatusDependentNotifications } from '#appeals/appeal-details/accordions/utils/index.js';

function getDateDaysInFutureISO(days) {
	const date = new Date(new Date().setDate(new Date().getDate() + days));
	return date.toISOString();
}

describe('mapStatusDependentNotifications', () => {
	let appealDetails;
	let representationTypesAwaitingReview;
	beforeEach(() => {
		appealDetails = {};
		representationTypesAwaitingReview = {};
	});
	describe('when status is "statements"', () => {
		beforeEach(() => {
			appealDetails.appealStatus = 'statements';
			appealDetails.appealTimetable = {
				lpaStatementDueDate: getDateDaysInFutureISO(1),
				ipCommentsDueDate: getDateDaysInFutureISO(1)
			};
			appealDetails.documentationSummary = {
				lpaStatement: {
					representationStatus: 'complete'
				}
			};
			representationTypesAwaitingReview.lpaStatement = true;
			representationTypesAwaitingReview.ipComments = true;
			appealDetails.documentationSummary.ipComments = {
				counts: {
					valid: 1
				}
			};
		});

		describe('when the ip comments and LPA statement due dates are in the past', () => {
			beforeEach(() => {
				appealDetails.appealTimetable.ipCommentsDueDate = getDateDaysInFutureISO(-1);
				appealDetails.appealTimetable.lpaStatementDueDate = getDateDaysInFutureISO(-1);
			});

			it('should return the "Update LPA statement" notification', () => {
				appealDetails.documentationSummary.lpaStatement.representationStatus = 'incomplete';
				const banners = mapStatusDependentNotifications(
					appealDetails,
					representationTypesAwaitingReview
				);
				expect(banners).toMatchSnapshot();

				expect(banners.length).toEqual(2);

				banners.forEach((banner) => {
					expect(banner.type).toEqual('notification-banner');
				});

				expect(banners[0].parameters.html).toEqual(
					expect.stringContaining('>Update LPA statement</a>')
				);
				expect(banners[1].parameters.html).toEqual(
					expect.stringContaining('>interested party comments</span></a>')
				);
			});

			describe('and neither LPA Statement or IP Comments are awaiting a review', () => {
				beforeEach(() => {
					representationTypesAwaitingReview.lpaStatement = false;
					representationTypesAwaitingReview.ipComments = false;
				});

				it('should return the "Share IP comments and LPA statement" notification', () => {
					const banners = mapStatusDependentNotifications(
						appealDetails,
						representationTypesAwaitingReview
					);

					expect(banners).toMatchSnapshot();

					expect(banners.length).toEqual(1);

					const [banner] = banners;
					expect(banner.type).toEqual('notification-banner');
					expect(banner.parameters.html).toEqual(
						expect.stringContaining('>Share IP comments and LPA statement</a>')
					);
				});

				it('should return the "Progress to final comments" notification', () => {
					appealDetails.documentationSummary.ipComments.status = 'not_received';
					appealDetails.documentationSummary.lpaStatement.status = 'not_received';
					appealDetails.documentationSummary.ipComments.counts.valid = 0;

					const banners = mapStatusDependentNotifications(
						appealDetails,
						representationTypesAwaitingReview
					);

					expect(banners).toMatchSnapshot();

					expect(banners.length).toEqual(1);

					const [banner] = banners;

					expect(banner.type).toEqual('notification-banner');
					expect(banner.parameters.html).toEqual(
						expect.stringContaining('>Progress to final comments</a>')
					);
				});
			});
		});

		it('should return the "Interested party comments awaiting review" notification', () => {
			representationTypesAwaitingReview.lpaStatement = false;
			representationTypesAwaitingReview.ipComments = true;
			const banners = mapStatusDependentNotifications(
				appealDetails,
				representationTypesAwaitingReview
			);

			expect(banners).toMatchSnapshot();

			expect(banners.length).toEqual(1);

			const [banner] = banners;
			expect(banner.type).toEqual('notification-banner');
			expect(banner.parameters.html).toEqual(
				expect.stringContaining('>interested party comments</span></a>')
			);
		});

		it('should return the "LPA statement awaiting review" notification', () => {
			representationTypesAwaitingReview.lpaStatement = true;
			representationTypesAwaitingReview.ipComments = false;
			appealDetails.appealTimetable.lpaStatementDueDate = new Date().toISOString();
			const banners = mapStatusDependentNotifications(
				appealDetails,
				representationTypesAwaitingReview
			);

			expect(banners).toMatchSnapshot();

			expect(banners.length).toEqual(1);

			const [banner] = banners;
			expect(banner.type).toEqual('notification-banner');
			expect(banner.parameters.html).toEqual(expect.stringContaining('>LPA statement</span></a>'));
		});
	});
});
