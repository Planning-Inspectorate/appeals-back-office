/**
 * @typedef Instructions
 * A series of instructions pages where you display data, input data, and the API associated with that data
 * @type {object}
 * @property {string} id
 * @property {DisplayInstructions} display Collection of display instructions
 * @property {InputInstructions} [input] Collection of input instructions
 * @property {string} [submitApi]
 * @property {string} [inputItemApi]
 */

/**
 * @typedef DisplayInstructions
 * Display Instructions
 * @type {object}
 * @property {SummaryListRowProperties} [summaryListItem] To create a row in a summary list
 * @property {SummaryListRowProperties[]} [summaryListItems] To create an array of rows in a summary list
 * @property {CardProperties} [cardItem] To create a card
 * @property {StatusTagProperties} [statusTag] To create a Status Tag
 * @property {TableCellProperties[]} [tableItem] To create a table row
 * @property {HtmlPageComponent} [htmlItem]
 * @property {ButtonPageComponent} [buttonItem]
 */

/**
 * @typedef {Object<string, Instructions>} MappedInstructions
 */

/**
 * @typedef MappedAppealInstructions
 * @type {object}
 * @property {MappedInstructions} appeal
 */
/**
 * @typedef MappedLPAQInstructions
 * @type {object}
 * @prop {MappedInstructions} lpaq
 */

/**
 * @typedef {Object} CheckboxesInputInstruction
 * @property {'checkboxes'} type
 * @property {CheckboxesProperties} properties
 */
/**
 * @typedef {Object} RadiosInputInstruction
 * @property {'radios'} type
 * @property {RadiosProperties} properties
 */
/**
 * @typedef {Object} InputInputInstruction
 * @property {'input'} type
 * @property {InputProperties} properties
 */
/**
 * @typedef {Object} FieldsetInputInstruction
 * @property {'fieldset'} type
 * @property {FieldsetProperties} properties
 */

/**
 * @typedef InputInstruction
 * @type {CheckboxesInputInstruction | RadiosInputInstruction | InputInputInstruction | FieldsetInputInstruction}
 */

/**
 * @typedef {Object} InputInstructions
 * @property {InputInstruction[]} instructions
 * @property {string} [displayName]
 */

/**
 * @typedef {Object} PageComponentWrapperHtml
 * @property {string} opening
 * @property {string} closing
 */

/**
 * @typedef {Object} SharedPageComponentProperties
 * @property {PageComponentWrapperHtml} [wrapperHtml]
 */

/**
 * @typedef {Object} AccordionPageComponent
 * @property {'accordion'} type
 * @property {AccordionProperties} parameters
 */

/**
 * @typedef {Object} BackLinkPageComponent
 * @property {'back-link'} type
 * @property {BackLinkProperties} parameters
 */

/**
 * @typedef {Object} BreadcrumbsPageComponent
 * @property {'breadcrumbs'} type
 * @property {BreadcrumbsProperties} parameters
 */

/**
 * @typedef {Object} ButtonPageComponent
 * @property {'button'} type
 * @property {ButtonProperties} parameters
 */

/**
 * @typedef {Object} CharacterCountPageComponent
 * @property {'character-count'} type
 * @property {CharacterCountProperties} parameters
 */

/**
 * @typedef {Object} CheckboxesPageComponent
 * @property {'checkboxes'} type
 * @property {CheckboxesProperties} parameters
 */

/**
 * @typedef {Object} CookieBannerPageComponent
 * @property {'cookie-banner'} type
 * @property {CookieBannerProperties} parameters
 */

/**
 * @typedef {Object} DateInputPageComponent
 * @property {'date-input'} type
 * @property {DateInputProperties} parameters
 */

/**
 * @typedef {Object} DetailsPageComponent
 * @property {'details'} type
 * @property {DetailsProperties} parameters
 */

/**
 * @typedef {Object} ErrorMessagePageComponent
 * @property {'error-message'} type
 * @property {ErrorMessageProperties} parameters
 */

/**
 * @typedef {Object} ErrorSummaryPageComponent
 * @property {'error-summary'} type
 * @property {ErrorSummaryProperties} parameters
 */

/**
 * @typedef {Object} ExitThisPagePageComponent
 * @property {'exit-this-page'} type
 * @property {ExitThisPageProperties} parameters
 */

/**
 * @typedef {Object} FieldsetPageComponent
 * @property {'fieldset'} type
 * @property {FieldsetProperties} parameters
 */

/**
 * @typedef {Object} FileUploadPageComponent
 * @property {'file-upload'} type
 * @property {FileUploadProperties} parameters
 */

/**
 * @typedef {Object} HintPageComponent
 * @property {'hint'} type
 * @property {HintProperties} parameters
 */

/**
 * @typedef {Object} InputPageComponent
 * @property {'input'} type
 * @property {InputProperties} parameters
 */

/**
 * @typedef {Object} InsetTextPageComponent
 * @property {'inset-text'} type
 * @property {InsetTextProperties} parameters
 */

/**
 * @typedef {Object} LabelPageComponent
 * @property {'label'} type
 * @property {LabelProperties} parameters
 */

/**
 * @typedef {Object} NotificationBannerPageComponent
 * @property {'notification-banner'} type
 * @property {NotificationBannerProperties} parameters
 */

/**
 * @typedef {Object} PaginationPageComponent
 * @property {'pagination'} type
 * @property {PaginationProperties} parameters
 */

/**
 * @typedef {Object} PanelPageComponent
 * @property {'panel'} type
 * @property {PanelProperties} parameters
 */

/**
 * @typedef {Object} PhaseBannerPageComponent
 * @property {'phase-banner'} type
 * @property {PhaseBannerProperties} parameters
 */

/**
 * @typedef {Object} RadiosPageComponent
 * @property {'radios'} type
 * @property {RadiosProperties} parameters
 */

/**
 * @typedef {Object} SelectPageComponent
 * @property {'select'} type
 * @property {SelectProperties} parameters
 */

/**
 * @typedef {Object} SkipLinkPageComponent
 * @property {'skip-link'} type
 * @property {SkipLinkProperties} parameters
 */

/**
 * @typedef {Object} SummaryListPageComponent
 * @property {'summary-list'} type
 * @property {SummaryListProperties} parameters
 */

/**
 * @typedef {Object} TablePageComponent
 * @property {'table'} type
 * @property {TableProperties} parameters
 */

/**
 * @typedef {Object} TabsPageComponent
 * @property {'tabs'} type
 * @property {TabsProperties} parameters
 */

/**
 * @typedef {Object} TagPageComponent
 * @property {'tag'} type
 * @property {TagProperties} parameters
 */

/**
 * @typedef {Object} TextareaPageComponent
 * @property {'textarea'} type
 * @property {TextareaProperties} parameters
 */

/**
 * @typedef {Object} WarningTextPageComponent
 * @property {'warning-text'} type
 * @property {WarningTextProperties} parameters
 */

/**
 * @typedef {Object} StatusTagPageComponent
 * @property {'status-tag'} type
 * @property {StatusTagProperties} parameters
 */

/**
 * @typedef {Object} TimeInputPageComponent
 * @property {'time-input'} type
 * @property {TimeInputProperties} parameters
 */

/**
 * @typedef {Object} HtmlPageComponent
 * @property {'html'} type
 * @property {HtmlProperty} parameters
 */

/**
 * @typedef SharedShowMoreProperties
 * @type {Object<string, any>}
 * @property {string} labelText
 * @property {string} [maximumBeforeHiding]
 * @property {string} [toggleTextCollapsed]
 * @property {string} [toggleTextExpanded]
 */

/**
 * @typedef ShowMoreTextProperties
 * @type {Object<string, any>}
 * @property {string} text
 */

/**
 * @typedef ShowMoreHtmlProperties
 * @type {Object<string, any>}
 * @property {string} html
 * @property {string} contentRowSelector
 */

/**
 * @typedef {Object} ShowMorePageComponent
 * @property {'show-more'} type
 * @property {SharedShowMoreProperties & (ShowMoreTextProperties | ShowMoreHtmlProperties)} parameters
 */

/**
 * @typedef {Object} CaseNotesPageComponent
 * @property {'case-notes'} type
 * @property {CaseNotesProperties} parameters
 */

/**
 * @typedef {SharedPageComponentProperties & (AccordionPageComponent | BackLinkPageComponent | BreadcrumbsPageComponent | ButtonPageComponent | CharacterCountPageComponent | CheckboxesPageComponent | CookieBannerPageComponent | DateInputPageComponent | DetailsPageComponent | ErrorMessagePageComponent | ErrorSummaryPageComponent | ExitThisPagePageComponent | FieldsetPageComponent | FileUploadPageComponent | HintPageComponent | InputPageComponent | InsetTextPageComponent | LabelPageComponent | NotificationBannerPageComponent | PaginationPageComponent | PanelPageComponent | PhaseBannerPageComponent | RadiosPageComponent | SelectPageComponent | SkipLinkPageComponent | SummaryListPageComponent | TablePageComponent | TabsPageComponent | TagPageComponent | TextareaPageComponent | WarningTextPageComponent | StatusTagPageComponent | TimeInputPageComponent | HtmlPageComponent | ShowMorePageComponent | CaseNotesPageComponent)} PageComponent
 */

/**
 * @typedef {Object} PageContent
 * @property {string} [title] Title of the page
 * @property {string} [backLinkUrl] Url of back button
 * @property {string} [backLinkText] Back button text
 * @property {string} [preHeading] Preheading (Usually 'Appeal ${shortAppealReference}')
 * @property {string} [heading]
 * @property {string} [headingClasses]
 * @property {string} [submitButtonText]
 * @property {ButtonProperties} [submitButtonProperties]
 * @property {string} [skipButtonUrl]
 * @property {PageComponent[]} [pageComponents]
 * @property {boolean} [forceRenderSubmitButton]
 * @property {PageComponent[]} [prePageComponents]
 * @property {PageComponent[]} [postPageComponents]
 * @property {string} [hint]
 * @property {string} [formWrapperColumnClass]
 * @property {string} [prePageWrapperColumnClass]
 * @property {string} [postPageWrapperColumnClass]
 */

/**
 * @typedef {Object} PageBodyRow
 * @property {string} text
 * @property {string} [href]
 */
