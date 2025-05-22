import { booleanSummaryListItem } from '#lib/mappers/index.js';
/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} SingleLPAQuestionnaireResponse
 */

/**
 * @typedef {Object} SubMapperParams
 * @property {SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @property {string} currentRoute
 * @property {boolean} userHasUpdateCase
 */

/**
 * @typedef {SubMapperParams & { index: number }} SubMapperParamsWithIndex
 */

/**
 * @typedef {(params: SubMapperParamsWithIndex) => () => Instructions} SubMapper
 */

/** @type {SubMapper} */
const mapLoanToPreserveListedBuilding = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase,
	index
}) => {
	if (lpaQuestionnaireData?.listedBuildingDetails?.[index]?.listEntry === undefined) {
		throw new Error('listedBuildingDetails listEntry is undefined');
	}

	if (lpaQuestionnaireData.listedBuildingDetails[index].affectsListedBuilding === false) {
		return () =>
			booleanSummaryListItem({
				id: `loan-to-preserve-listed-building-${lpaQuestionnaireData?.listedBuildingDetails?.[index].listEntry}`,
				text: `Was a grant or loan made to preserve the listed building ${lpaQuestionnaireData?.listedBuildingDetails?.[index].listEntry}?`,
				value: lpaQuestionnaireData?.listedBuildingDetails?.[index]?.loanToPreserveListedBuilding,
				defaultText: '',
				addCyAttribute: true,
				link: `${currentRoute}/loan-to-preserve-listed-building-${lpaQuestionnaireData?.listedBuildingDetails?.[index].listEntry}/change`,
				editable: userHasUpdateCase
			});
	} else {
		return () =>
			booleanSummaryListItem({
				id: `affects-loan-to-preserve-listed-building-${lpaQuestionnaireData?.listedBuildingDetails?.[index].listEntry}`,
				text: `Was a grant or loan made to preserve the listed building ${lpaQuestionnaireData?.listedBuildingDetails?.[index].listEntry}?`,
				value: lpaQuestionnaireData?.listedBuildingDetails?.[index]?.loanToPreserveListedBuilding,
				defaultText: '',
				addCyAttribute: true,
				link: `${currentRoute}/loan-to-preserve-listed-building-${lpaQuestionnaireData?.listedBuildingDetails?.[index].listEntry}/change`,
				editable: userHasUpdateCase
			});
	}
};

/** @type {(params: SubMapperParams) => Record<string, SubMapper>} */
export const generateLoanToPreserveListedBuildingSubMaps = ({ lpaQuestionnaireData }) => {
	/** @type {Record<string, SubMapper>} */
	const loanToPreserveListedBuildings = {};
	lpaQuestionnaireData.listedBuildingDetails?.forEach((building) => {
		loanToPreserveListedBuildings[`loanToPreserveListedBuilding${building.listEntry}`] =
			mapLoanToPreserveListedBuilding;
	});
	return loanToPreserveListedBuildings;
};
