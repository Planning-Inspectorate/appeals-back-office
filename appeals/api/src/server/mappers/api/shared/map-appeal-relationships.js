/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppealRelationship} AppealRelationship */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import {
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED
} from '@pins/appeals/constants/support.js';
import { isAwaitingLinkedAppeal } from '#utils/is-awaiting-linked-appeal.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {{awaitingLinkedAppeal: boolean, linkedAppeals: Partial<AppealRelationship>[], otherAppeals: AppealRelationship[], isParentAppeal: boolean, isChildAppeal: boolean }}
 */
export const mapAppealRelationships = (data) => {
	const { appeal } = data;

	const appealRelationships = [...(appeal.parentAppeals || []), ...(appeal.childAppeals || [])];

	const parentAppeals =
		isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) && appeal.parentAppeals?.length
			? appeal.parentAppeals
					.filter((relationship) => relationship.type === CASE_RELATIONSHIP_LINKED)
					.map((relationship) => {
						return mapLinkedAppeal(relationship, true);
					})
			: [];

	const childAppeals =
		isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) && appeal.childAppeals?.length
			? appeal.childAppeals
					.filter((relationship) => relationship.type === CASE_RELATIONSHIP_LINKED)
					.map((relationship) => {
						return mapLinkedAppeal(relationship, false);
					})
			: [];

	const linkedAppeals = [...parentAppeals, ...childAppeals];

	const awaitingLinkedAppeal =
		isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) &&
		// @ts-ignore
		isAwaitingLinkedAppeal(appeal, data.linkedAppeals);

	const otherAppeals = appealRelationships.length
		? appealRelationships
				.filter((relationship) => relationship.type === CASE_RELATIONSHIP_RELATED)
				.map((relationship) => {
					const isChild = relationship.child !== undefined;
					const appealType = isChild
						? `${relationship.child?.appealType?.type} (${relationship.child?.appealType?.key})`
						: `${relationship.parent?.appealType?.type} (${relationship.parent?.appealType?.key})`;

					return {
						appealId: isChild ? relationship.childId : relationship.parentId,
						appealReference: isChild ? relationship.childRef : relationship.parentRef,
						externalSource: relationship.externalSource === true,
						linkingDate: relationship.linkingDate.toISOString(),
						appealType,
						externalAppealType: relationship.externalAppealType,
						relationshipId: relationship.id,
						externalId: relationship.externalId,
						isParentAppeal: !isChild
					};
				})
		: [];

	return {
		awaitingLinkedAppeal,
		linkedAppeals,
		otherAppeals,
		isChildAppeal: parentAppeals.length > 0,
		isParentAppeal: childAppeals.length > 0
	};
};

/**
 *
 * @param {{parent?: Appeal | null | undefined, child?: Appeal | null | undefined, linkingDate: Date, externalSource: boolean | null, externalAppealType: string | null, externalId: string | null}} relationship
 * @param {Boolean} isParentAppeal
 * @returns {Partial<AppealRelationship & {currentStatus: string, completedStateList: string[]}>}
 */
const mapLinkedAppeal = (relationship, isParentAppeal) => {
	const { linkingDate, externalSource, externalAppealType, externalId, parent, child } =
		relationship;
	const {
		id: appealId,
		appealStatus,
		reference: appealReference,
		appealType
	} = (isParentAppeal ? parent : child) || {};

	const currentStatus =
		appealStatus?.filter(({ valid }) => valid).map(({ status }) => status) || [];

	const completedStateList =
		appealStatus?.filter(({ valid }) => !valid).map(({ status }) => status) || [];

	return {
		appealId,
		appealReference,
		externalSource: externalSource === true,
		linkingDate: linkingDate.toISOString(),
		appealType: `${appealType?.type} (${appealType?.key})`,
		externalAppealType,
		externalId,
		isParentAppeal,
		currentStatus: currentStatus[0] ?? undefined,
		completedStateList
	};
};
