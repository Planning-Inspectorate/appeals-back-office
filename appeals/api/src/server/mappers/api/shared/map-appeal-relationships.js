/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppealRelationship} AppealRelationship */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@pins/appeals').Address} Address */

import { isAwaitingLinkedAppeal } from '#utils/is-awaiting-linked-appeal.js';
import { hasChildAppeals, isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
import {
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED
} from '@pins/appeals/constants/support.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {{awaitingLinkedAppeal: boolean, linkedAppeals: Partial<AppealRelationship>[], otherAppeals: AppealRelationship[], isParentAppeal: boolean, isChildAppeal: boolean }}
 */
export const mapAppealRelationships = (data) => {
	const { appeal } = data;

	const appealRelationships = [...(appeal.parentAppeals || []), ...(appeal.childAppeals || [])];

	const parentAppeals =
		isLinkedAppealsActive(appeal) && appeal.parentAppeals?.length
			? appeal.parentAppeals
					.filter((relationship) => relationship.type === CASE_RELATIONSHIP_LINKED)
					.map((relationship) => {
						return mapLinkedAppeal(relationship, true);
					})
			: [];

	const childAppeals = hasChildAppeals(appeal)
		? // @ts-ignore
			appeal.childAppeals
				.filter((relationship) => relationship.type === CASE_RELATIONSHIP_LINKED)
				.map((relationship) => {
					return mapLinkedAppeal(relationship, false);
				})
		: [];

	const linkedAppeals = [...parentAppeals, ...childAppeals];

	const awaitingLinkedAppeal = Boolean(
		isLinkedAppealsActive(appeal) &&
		data.linkedAppeals?.length &&
		// @ts-ignore
		isAwaitingLinkedAppeal(appeal, [
			data.linkedAppeals[0].parent,
			...data.linkedAppeals.map((linkedAppeal) => linkedAppeal.child)
		])
	);

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
 * @param {{id: number | undefined, parent?: Appeal | null | undefined, child?: Appeal | null | undefined, linkingDate: Date, externalSource: boolean | null, externalAppealType: string | null, externalId: string | null}} relationship
 * @param {Boolean} isParentAppeal
 * @returns {Partial<AppealRelationship & {currentStatus: string, completedStateList: string[], inspectorDecision: string, address: Address | null}>}
 */
const mapLinkedAppeal = (relationship, isParentAppeal) => {
	const {
		id: relationshipId,
		linkingDate,
		externalSource,
		externalAppealType,
		externalId,
		parent,
		child
	} = relationship;
	const {
		id: appealId,
		appealStatus,
		reference: appealReference,
		appealType,
		address,
		inspectorDecision
	} = (isParentAppeal ? parent : child) || {};

	const currentStatus =
		appealStatus?.filter(({ valid }) => valid).map(({ status }) => status) || [];

	const completedStateList =
		appealStatus?.filter(({ valid }) => !valid).map(({ status }) => status) || [];

	return {
		appealId,
		appealReference,
		relationshipId,
		// @ts-ignore
		address,
		externalSource: externalSource === true,
		linkingDate: linkingDate.toISOString(),
		appealType: appealType?.type,
		externalAppealType,
		externalId,
		isParentAppeal,
		currentStatus: currentStatus[0] ?? undefined,
		completedStateList,
		inspectorDecision: inspectorDecision?.outcome ?? undefined
	};
};
