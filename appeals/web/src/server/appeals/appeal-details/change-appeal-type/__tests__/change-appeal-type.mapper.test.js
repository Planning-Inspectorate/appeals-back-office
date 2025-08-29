import { appealData } from '#testing/app/fixtures/referencedata.js';
import { appealTypePage } from '../change-appeal-type.mapper.js';

const appealTypes = [
	{
		id: 1016,
		type: 'Householder',
		changeAppealType: 'Householder',
		key: 'D',
		processCode: 'HAS',
		enabled: true
	},
	{
		id: 1020,
		type: 'Advertisement appeal',
		changeAppealType: 'Advertisement',
		key: 'H',
		processCode: null,
		enabled: false
	}
];

describe('change-appeal-type.mapper', () => {
	describe('appealTypePage', () => {
		const expectedPageItems = [
			{ value: '1016', text: 'Householder', checked: true },
			{ value: '1020', text: 'Advertisement', checked: false }
		];
		let expectedResponse = {
			title: 'What type should this appeal be? - 351062',
			backLinkUrl: '/appeals-service/appeal-details/1',
			preHeading: 'Appeal 351062 - update appeal type',
			pageComponents: [
				{
					type: 'radios',
					parameters: {
						name: 'appealType',
						idPrefix: 'appeal-type',
						fieldset: expect.any(Object),
						errorMessage: undefined,
						items: expectedPageItems
					}
				}
			]
		};

		it('should return page items with existing appeal type checked where change appeal is undefined', () => {
			const changeAppeal = undefined;
			const result = appealTypePage(appealData, appealTypes, changeAppeal, undefined);

			expect(result).toMatchObject(expectedResponse);
			expect(result.pageComponents).toBeDefined();
			expect(result.pageComponents?.[0].parameters.items).toBeDefined();
			expect(result.pageComponents?.[0].parameters.items).toEqual(expectedPageItems);
		});

		it('should return page items with existing appeal type checked where change appeal is an empty object', () => {
			const changeAppeal = {};
			const result = appealTypePage(appealData, appealTypes, changeAppeal, undefined);

			expect(result).toMatchObject(expectedResponse);
			expect(result.pageComponents).toBeDefined();
			expect(result.pageComponents?.[0].parameters.items).toBeDefined();
			expect(result.pageComponents?.[0].parameters.items).toEqual(expectedPageItems);
		});

		it('should return page items with new appeal type checked where change appeal exists', () => {
			const advertisementSelectedPageItems = [
				{ value: '1016', text: 'Householder', checked: false },
				{ value: '1020', text: 'Advertisement', checked: true }
			];
			expectedResponse.pageComponents[0].parameters.items = advertisementSelectedPageItems;
			const changeAppeal = {
				appealId: '1139',
				appealTypeId: 1020
			};

			const result = appealTypePage(appealData, appealTypes, changeAppeal, undefined);

			expect(result).toMatchObject(expectedResponse);
			expect(result.pageComponents).toBeDefined();
			expect(result.pageComponents?.[0].parameters.items).toBeDefined();
			expect(result.pageComponents?.[0].parameters.items).toEqual(advertisementSelectedPageItems);
		});
	});
});
