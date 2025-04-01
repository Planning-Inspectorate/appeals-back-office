import { buildHtmlList } from '../tag-builders.js';

describe('tag-builders', () => {
	describe('buildHtmlList', () => {
		it('should render an empty string if no item parameter is passed', () => {
			expect(buildHtmlList({})).toEqual('');
		});

		it('should render an empty string if an empty array of items is passed', () => {
			expect(buildHtmlList({ items: [] })).toEqual('');
		});

		it('should render an unordered list with the default classes, with a list item containing each supplied item, if only the items parameter is passed', () => {
			expect(
				buildHtmlList({
					items: ['first item', 'second item']
				})
			).toEqual(
				'<ul class="govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0"><li>first item</li><li>second item</li></ul>'
			);
		});

		it('should render the supplied classes on the list tag if the listClasses parameter is passed', () => {
			expect(
				buildHtmlList({
					items: ['first item', 'second item'],
					listClasses: 'test-class'
				})
			).toEqual('<ul class="test-class"><li>first item</li><li>second item</li></ul>');
		});

		it('should render an ordered list if the isOrderedList parameter is passed with a value of "true"', () => {
			expect(
				buildHtmlList({
					items: ['first item', 'second item'],
					isOrderedList: true
				})
			).toEqual(
				'<ol class="govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0"><li>first item</li><li>second item</li></ol>'
			);
		});

		it('should render the "govuk-list--number" modifier class on the list tag if the isNumberedList parameter is passed with a value of "true"', () => {
			expect(
				buildHtmlList({
					items: ['first item', 'second item'],
					isNumberedList: true
				})
			).toEqual(
				'<ul class="govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0 govuk-list--number"><li>first item</li><li>second item</li></ul>'
			);
		});

		it('should render an ordered list with the "govuk-list--number" modifier class on the list tag if the isOrderedList and isNumberedList parameters are both passed with values of "true"', () => {
			expect(
				buildHtmlList({
					items: ['first item', 'second item'],
					isOrderedList: true,
					isNumberedList: true
				})
			).toEqual(
				'<ol class="govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0 govuk-list--number"><li>first item</li><li>second item</li></ol>'
			);
		});

		it('should render a nested list with the supplied items if an array of string arrays is passed as the items parameter', () => {
			expect(
				buildHtmlList({
					items: ['first item', ['first nested item', 'second nested item']]
				})
			).toEqual(
				'<ul class="govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0"><li>first item</li><li><ul class=""><li>first nested item</li><li>second nested item</li></ul></li></ul>'
			);
		});
	});
});
