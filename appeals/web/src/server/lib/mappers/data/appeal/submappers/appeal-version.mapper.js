/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('#app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealVersion = ({ appealDetails }) => ({
	id: 'appeal-version',
	display: {
		summaryListItem: {
			key: {
				text: 'Appeal version'
			},
			value: {
				text: appealDetails.appealVersion
			},
			classes: 'appeal-appeal-version'
		},
		statusTag: {
			status: (() => {
				if (!appealDetails?.appealVersion) {
					return '';
				}

				return 'Version ' + appealDetails.appealVersion;
			})(),
			classes: 'govuk-!-margin-bottom-4'
		}
	}
});
