import { CaseDetailsPage } from '../caseDetailsPage';

export class cyaBaseLocators extends CaseDetailsPage {
	Selectors = {
		subheadingSelector: '.govuk-summary-list__key',
		summaryRowSelector: '.govuk-summary-list__row',
		summaryActionLinkSelector: '.govuk-summary-list__actions .govuk-link',
		captionSelector: '.govuk-caption-l',
		inputDataSelector: '.govuk-summary-list__value',

		//Buttons & links
		button: '.govuk-button',
		link: '.govuk-link'
	};
}
