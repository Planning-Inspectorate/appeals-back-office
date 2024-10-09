import { APPEAL_ORIGIN } from 'pins-data-model';
import formatAddress from '#utils/format-address.js';
import { formatName } from '#utils/format-name.js';

/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Api.RepResponse} FormattedRep */

/**
 *
 * @param {Representation} rep
 * @returns {FormattedRep}
 */
export const formatRepresentation = (rep) => {
	/** @type {FormattedRep} */
	const formatted = {
		id: rep.id,
		origin: rep.lpa ? APPEAL_ORIGIN.LPA : APPEAL_ORIGIN.CITIZEN,
		author: formatRepresentationSource(rep),
		status: rep.status,
		originalRepresentation: rep.originalRepresentation,
		redactedRepresentation: rep.redactedRepresentation || '',
		created: rep.dateCreated.toISOString(),
		notes: rep.notes || '',
		attachments: rep.attachments || [],
		representationType: rep.representationType
	};

	if (rep.represented) {
		formatted.represented = {
			id: rep.represented.id,
			name: formatName(rep.represented),
			email: rep.represented.email ?? undefined,
			address: formatAddress(rep.represented.address)
		};
	}

	return formatted;
};

/**
 *
 * @param {Representation} rep
 * @returns {string}
 */
const formatRepresentationSource = (rep) => {
	if (rep.lpa) {
		return rep.lpa.name;
	}

	if (!rep.represented && rep.representative) {
		return `${rep.representative?.firstName} ${rep.representative?.lastName}`;
	}

	return `${rep.represented?.firstName} ${rep.represented?.lastName}`;
};
