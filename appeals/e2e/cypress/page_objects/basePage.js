// @ts-nocheck
import { urlPaths } from '../support/urlPaths.js';
import { assertType } from '../support/utils/assertType';

// @ts-nocheck
export class Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	selectors = {
		// accordion: '.govuk-accordion__section-heading-text-focus',
		// accordionButton: '.govuk-accordion__section-button',
		// accordionToggleText: '.govuk-accordion__section-toggle-text',
		// accordionSectionHeader: '.govuk-accordion__section-header',
		// accordionSectionExpanded: 'govuk-accordion__section.govuk-accordion__section--expanded',
		backLink: '.govuk-back-link',
		bannerHeader: '.govuk-notification-banner__heading',
		bannerLink: '.govuk-notification-banner__link',
		publish_bannerHeader: '#main-content > div > div > div > h1', // TODO Use specific data-cy selector
		button: '.govuk-button',
		body: '.govuk-body',
		caption: '.govuk-caption-m',
		centralCol: '.pins-column--central',
		checkbox: '.govuk-checkboxes__item',
		errorMessage: '.govuk-error-message',
		inLineErrorMessage: '.govuk-form-group--error .govuk-error-message',
		formGroup: '.govuk-form-group',
		fullColumn: '.govuk-grid-column-full',
		twoThirdColumn: '.govuk-grid-column-two-thirds',
		headingLeft: '.govuk-heading-l',
		input: '.govuk-input',
		leftCol: '.pins-column--left',
		link: '.govuk-link',
		list: '.govuk-list',
		mediumHeader: '.govuk-heading-m',
		panel: '.govuk-panel',
		panelBody: '.govuk-notification-banner__heading',
		panelTitle: '#govuk-notification-banner-title',
		radio: '.govuk-radios__item',
		rightCol: '.pins-column--right',
		select: '.govuk-select',
		smallHeader: '.govuk-heading-s',
		table: '.govuk-table',
		tableBody: '.govuk-table__body',
		tableCell: '.govuk-table__cell',
		tableHeader: '.govuk-table__header',
		publishtableHeader: '#main-content > div > div > div > div > p', // TODO Use specific data-cy selector
		tableRow: '.govuk-table__row',
		tab: '.govuk-tabs__tab',
		tag: '#main-content .govuk-tag',
		textArea: '.govuk-textarea',
		status: '#main-content .govuk-tag',
		successBanner: '.govuk-notification-banner--success',
		summaryCardActions: '.govuk-summary-card__actions',
		summaryListActions: '.govuk-summary-list__actions',
		summaryListKey: '.govuk-summary-list__key',
		summaryListValue: '.govuk-summary-list__value',
		summaryDetails: '.govuk-details__summary',
		summaryErrorMessages: '.govuk-list.govuk-error-summary__list',
		xlHeader: '.govuk-heading-xl',
		projectManagement: 'span.font-weight--700:nth-child(2)', // TODO Use specific data-cy selector
		unpublish: 'a.govuk-button:nth-child(5)', // TODO Use specific data-cy selector
		caseObjTraining: ':nth-child(2) > .govuk-table__body > :nth-child(1) > :nth-child(2)', // TODO Use specific data-cy selector
		serviceHeader: '.pins-header-domainname',
		users: '#users'
	};

	basePageElements = {
		// accordion: (text) =>
		// 	cy.get(this.selectors.accordion).contains('span', text, { matchCase: false }),
		// accordionButton: (text) =>
		// 	cy.get(this.selectors.accordionButton).contains('span', text, { matchCase: false }),
		additionalDocumentsAdd: () => cy.get(this.selectors.summaryCardActions).children().last(),
		additonalDocumentManage: () => cy.get(this.selectors.summaryCardActions).children().first(),
		answerCell: (question, options) => {
			const { matchQuestionCase = false } = options || {};
			return cy
				.contains(this.selectors.summaryListKey, question, { matchCase: matchQuestionCase })
				.next();
		},
		applicationHeaderCentral: () => cy.get(`${this.selectors.centralCol} > p`),
		backLink: () => cy.get(this.selectors.backLink),
		bannerHeader: () => cy.get(this.selectors.bannerHeader),
		bannerLink: () => cy.get(this.selectors.bannerLink),
		publishBannerHeader: () => cy.get(this.selectors.publish_bannerHeader),
		button: () => cy.get(this.selectors.button),
		buttonByLabelText: (buttonText) =>
			cy.contains(this.selectors.button, buttonText, { matchCase: false }),
		checkbox: () => cy.get(this.selectors.checkbox).find('input'),
		changeLink: (question) =>
			cy.contains(this.selectors.tableCell, question, { matchCase: false }).nextUntil('a'),
		enterDate: () => cy.get(this.selectors.dateInput),
		errorMessage: () => cy.get(this.selectors.errorMessage),
		inLineErrorMessage: () => cy.get(this.selectors.inLineErrorMessage),
		summaryErrorMessages: () => cy.get(this.selectors.summaryErrorMessages),
		input: () => cy.get(this.selectors.input),
		linkByText: (text) => cy.contains(this.selectors.link, text, { matchCase: true }),
		loggedInUser: () => cy.get(`${this.selectors.rightCol} > span`),
		panelBody: () => cy.get(`${this.selectors.panelBody}`),
		panelTitle: () => cy.get(`${this.selectors.panelTitle}`),
		radioButton: () => cy.get(this.selectors.radio),
		sectionHeader: () => cy.get(this.selectors.headingLeft),
		selectElem: () => cy.get(this.selectors.select),
		saveAndContinue: () => this.clickButtonByText('Save and Continue'),
		successBanner: () => cy.get(this.selectors.successBanner),
		status: () => cy.get(this.selectors.status),
		summaryListActions: () => cy.get(this.selectors.summaryListActions),
		summaryListKey: () => cy.get(this.selectors.summaryListKey),
		summaryListValue: () => cy.get(this.selectors.summaryListValue),
		signOutLink: () =>
			cy.contains(`${this.selectors.rightCol} ${this.selectors.link}`, 'Sign Out', {
				matchCase: false
			}),
		clearSearchResultsLink: () => cy.get('a.govuk-link').contains('Clear search'),
		tabByText: (tabText) => cy.contains(this.selectors.tab, tabText, { matchCase: false }),
		table: () => cy.get(this.selectors.table),
		tableBody: () => cy.get(this.selectors.tableBody),
		tableRow: () => cy.get(this.selectors.tableRow),
		tableHeader: () => cy.get(this.selectors.tableHeader),
		tableCell: () => cy.get(this.selectors.tableCell),
		textArea: () => cy.get(this.selectors.textArea),
		genericText: () => cy.get(this.selectors.body),
		projectManagement: () => cy.get(this.selectors.projectManagement),
		unpublishLink: () => cy.get(this.selectors.unpublish),
		errorMessageLink: (link) => cy.get(`a[href='#${link}']`),
		serviceHeader: () => cy.get(this.selectors.serviceHeader),
		xlHeader: () => cy.get(this.selectors.xlHeader),
		twoThirdColumn: () => cy.get(this.selectors.twoThirdColumn),
		link: () => cy.get(this.selectors.link),
		usersInput: () => cy.get(this.selectors.users),
		summaryDetails: () => cy.get(this.selectors.summaryDetails)
	};

	/********************************************************
	 ************************ Actions ************************
	 *********************************************************/

	chooseSummaryListValue(value) {
		this.basePageElements.summaryListValue(value);
	}

	chooseCheckboxByIndex(indexNumber) {
		this.basePageElements.checkbox().eq(indexNumber).check();
	}

	chooseCheckboxByText(value) {
		cy.contains('label', value)
			.invoke('attr', 'for')
			.then((id) => {
				cy.get(`#${id}`).check();
			});
	}

	checkEmailRelevantParties(index) {
		this.basePageElements.checkbox(index).check();
	}

	clickChangeLink(question) {
		this.basePageElements.changeLink(question).click();
	}

	clearAllCheckboxes() {
		this.basePageElements
			.checkbox()
			.each(($checkbox) => cy.wrap($checkbox).uncheck({ force: true }));
	}

	selectCheckbox() {
		this.basePageElements.checkbox().check({ force: true });
	}

	// clickAccordionByText(text) {
	// 	this.basePageElements.accordion(text).click();
	// }

	// clickAccordionByButton(text) {
	// 	this.basePageElements.accordionButton(text).click();
	// }

	clickBackLink(buttonText) {
		this.basePageElements.backLink().click();
	}

	clickButtonByText(buttonText) {
		this.basePageElements.buttonByLabelText(buttonText).click();
	}

	clickContinue() {
		this.clickButtonByText('Continue');
	}

	clickSaveAndContinue() {
		this.clickButtonByText('Save And Continue');
	}

	clickLinkByText(linkText) {
		this.basePageElements.linkByText(linkText).click();
	}

	clickTabByText(tabText) {
		this.basePageElements.tabByText(tabText).click();
	}

	chooseRadioBtnByIndex(indexNumber) {
		this.basePageElements.radioButton().find('input').eq(indexNumber).check();
	}

	checkStatusOfCase(text, index = 0) {
		this.basePageElements.status().eq(index).contains(text);
	}

	chooseSelectItemByIndex(optionNumber) {
		this.basePageElements.selectElem().select(optionNumber);
	}

	fillInput(text, index = 0) {
		this.basePageElements.input().eq(index).clear().type(text);
	}

	fillTextArea(text, index = 0) {
		this.basePageElements.textArea().eq(index).clear().type(text);
	}

	fillUsersInput(text, index = 0) {
		this.basePageElements.usersInput().type(text);
	}

	clearSearchResults() {
		this.basePageElements.clearSearchResultsLink().click();
	}

	selectRadioButtonByValue(value) {
		this.basePageElements.radioButton().contains(value, { matchCase: false }).click();
	}

	exactMatch(value) {
		return new RegExp(`^\\s*${value}\\s*$`, 'm');
	}

	/***************************************************************
	 ************************ Verfifications ************************
	 ****************************************************************/

	verifyTableCellText(options) {
		this.basePageElements
			.tableBody()
			.find(this.selectors.tableRow)
			.eq(options.rowIndex)
			.find(this.selectors.tableCell)
			.eq(options.cellIndex)
			.then(($cell) => {
				const text = $cell.text().trim();
				options.strict
					? expect(text).to.equal(options.textToMatch)
					: expect(text).to.include(options.textToMatch);
			});
	}

	validateConfirmationPanel(title) {
		//TODO: Replace with check for success banner
		// let panelTitle = this.basePageElements.panelTitle().invoke('prop', 'innerText');
		// panelTitle.should('eq', title);
	}

	validateConfirmationPanelMessage(title, body) {
		this.basePageElements.panelTitle().should('contain.text', title);
		this.basePageElements.panelBody().should('contain.text', body);
	}

	validateBannerMessage(title, message) {
		cy.get('.govuk-notification-banner').then(($banners) => {
			const matchingBanners = $banners.filter((index, banner) => {
				const bannerText = Cypress.$(banner).text().trim();
				return bannerText.includes(title) && bannerText.includes(message);
			});

			expect(
				matchingBanners.length,
				`Expected to find a banner with title "${title}" and message "${message}"`
			).to.be.at.eq(1);
		});
	}

	validatePublishBannerMessage(successMessage) {
		this.basePageElements.publishBannerHeader().then(($banner) => {
			expect($banner.text().trim()).eq(successMessage);
		});
	}

	validateErrorMessage(errorMessage) {
		this.basePageElements.errorMessage().contains(errorMessage).should('exist');
	}

	validateInLineErrorMessage(errorMessage) {
		this.basePageElements.errorMessage().contains(errorMessage).should('exist');
	}

	validateErrorMessageIsInSummary(errorMessage) {
		const messages = [];
		this.basePageElements
			.summaryErrorMessages()
			.each((message) => {
				messages.push(message.text().trim());
			})
			.then(() => {
				expect(messages).to.include(errorMessage);
			});
	}

	validateErrorMessageCountOnPage(numberOfErrors) {
		this.basePageElements.errorMessage().should('have.length', numberOfErrors);
	}

	validateNumberOfCheckboxes(checkboxCount) {
		this.basePageElements.checkbox().should('have.length', checkboxCount);
	}

	validateNumberOfRadioBtn(radioCount) {
		this.basePageElements.radioButton().should('have.length', radioCount);
	}

	verifyDocumentUploaded(fileName) {
		this.basePageElements.tableCell().contains(fileName).should('exist');
	}

	// showAllSections() {
	// 	cy.get('body').then(($body) => {
	// 		const exists = $body.find('span:contains(Show all sections)').length > 0;
	// 		if (exists) {
	// 			this.clickAccordionByText('Show all sections');
	// 		}
	// 	});
	// }

	validateSuccessPanelTitle(successMessage, exactMatch = false) {
		this.basePageElements.panelTitle().should(assertType(exactMatch), successMessage);
	}

	validateSuccessPanelBody(successMessage) {
		this.basePageElements.panelBody().contains(successMessage);
	}

	navigateToAppealsService() {
		cy.visit(urlPaths.appealsList);
	}

	goToFolderDocumentPage() {
		this.basePageElements.projectManagement().click();
	}

	validateAnswer(question, answer, options) {
		this.basePageElements.answerCell(question, options).then(($elem) => {
			cy.wrap($elem)
				.invoke('text')
				.then((text) => expect(text.trim()).to.equal(answer));
		});
	}

	validateSectionHeader(sectionHeader) {
		this.basePageElements.sectionHeader().should('have.text', sectionHeader);
	}

	checkErrorMessageDisplays(errorMessage) {
		cy.get('li').contains(errorMessage).should('be.visible');
	}

	verifyInlineErrorMessage(element) {
		cy.get(`#${element}`).should('be.visible');
	}

	verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(link, attribute, value) {
		this.basePageElements.errorMessageLink(link).click();
		cy.focused().should('have.attr', attribute, value);
	}

	verifyErrorMessages(options) {
		options.messages.forEach((message) => {
			this.checkErrorMessageDisplays(message);
		});

		options.fields.forEach((field) => {
			this.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(field, 'id', field);
			if (options.verifyInlineErrors) {
				this.verifyInlineErrorMessage(`${field}-error`);
			}
		});
	}

	verifyTagOnPersonalListPage(caseObj, expectedTagText) {
		cy.get(this.selectors.link)
			.contains(caseObj)
			.parents('tr')
			.find('.govuk-tag')
			.last()
			.should('have.text', expectedTagText);
	}

	verifyTagOnAllCasesPage(caseObj, expectedTagText, index = 0) {
		cy.getByData(caseObj)
			.parent('td')
			.siblings('.govuk-table__cell')
			.find('.govuk-tag')
			.eq(index)
			.should('have.text', expectedTagText);
	}

	verifyRowExists(rowName, bool) {
		let state = bool ? 'exist' : 'not.exist';

		this.basePageElements.summaryListKey().contains(rowName).should(state);
	}
}
