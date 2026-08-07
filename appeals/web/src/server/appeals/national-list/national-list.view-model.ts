import type { Address as AddressViewModel } from '@pins/appeals';
import type { Address } from '@pins/appeals-database/src/client/client';
import type { PaginationParameters } from '../../lib/pagination-utilities.js';
import type { GetAppealsResponse } from './national-list.service.ts';

export namespace NationalList {
	/**
	 * View model used by nationalListPage mapper
	 */
	export interface ViewModel {
		// all caseOfficers from this appeal search (not just this page) - for filter options
		caseOfficers: UserViewModel[];
		// all inspectors from this appeal search (not just this page) - for filter options
		inspectors: UserViewModel[];
		// all padsInspectors from this appeal search (not just this page) - for filter options
		padsInspectors: PadsUserModel[];
		// all lpas from this appeal search (not just this page) - for filter options
		lpas: LpaViewModel[];
		// all appeal statuses in the national list - for filter options
		statusesInNationalList: string[];

		itemCount: number;
		items: AppealViewModel[];
		page: number;
		pageCount: number;
		pageSize: number;
	}

	export interface AppealViewModel {
		// for appeal link
		appealId: number;
		// for table
		appealReference: string;
		appealType: string;
		enforcementReference?: string | null;
		planningApplicationReference: string | null;
		localPlanningDepartment: string;
		appealSite: AddressViewModel;
		appealStatus: string;
		// for status tag which can include procedure
		procedureType?: string;
	}

	export interface LpaViewModel {
		name: string;
		lpaCode: string;
	}

	export interface UserViewModel {
		// id is used for the select value
		id: number;
		// to look up the users name via Entra
		azureAdUserId: string | null;
	}

	export interface PadsUserModel {
		name: string;
		sapId: string;
	}
}

/**
 * Map the database results to the view model
 */
export function toNationalListViewModel(
	results: GetAppealsResponse,
	paginationParameters: PaginationParameters,
	appealsStatusesInNationalList: string[]
): NationalList.ViewModel {
	const { allAppeals, appealsPage } = results;

	const caseOfficers = allAppeals.map((appeal) => appeal.caseOfficer);
	const inspectors = allAppeals.map((appeal) => appeal.inspector);
	const allPadsUsers = allAppeals.map((appeal) => appeal.padsInspector);
	const allLpas = allAppeals.map((appeal) => appeal.lpa);

	const count = allAppeals.length;
	const pageSize = paginationParameters.pageSize;
	return {
		itemCount: count,
		items: toAppealViewModel(appealsPage),
		page: paginationParameters.pageNumber,
		pageSize: paginationParameters.pageSize,
		pageCount: Math.ceil(count / pageSize),
		caseOfficers: unique(caseOfficers, 'id'),
		inspectors: unique(inspectors, 'id'),
		padsInspectors: unique(allPadsUsers, 'sapId'),
		lpas: unique(allLpas, 'lpaCode'),
		statusesInNationalList: appealsStatusesInNationalList
	};
}

function toAppealViewModel(
	appealsPage: GetAppealsResponse['appealsPage']
): NationalList.AppealViewModel[] {
	return appealsPage.map((appeal) => {
		return {
			appealId: appeal.id,
			appealReference: appeal.reference,
			appealType: appeal.appealType?.type || '',
			enforcementReference: appeal.appellantCase?.enforcementReference,
			planningApplicationReference: appeal.applicationReference,
			localPlanningDepartment: appeal.lpa.name,
			appealSite: formatAddress(appeal.address),
			appealStatus: appeal.currentStatus,
			procedureType: appeal.procedureType?.name
		};
	});
}

// similar to appeals/api/src/server/utils/format-address.js
function formatAddress(address: Address | null): AddressViewModel {
	const { addressLine1, addressLine2, addressTown, addressCounty, postcode } = address || {};
	return {
		addressLine1: addressLine1 || '',
		addressLine2: addressLine2 || undefined,
		town: addressTown || undefined,
		county: addressCounty || undefined,
		postCode: postcode || ''
	};
}

/**
 * Returns all unique values in the array based on the unique field name, and removes null entries
 */
function unique<T extends Record<string, any>>(list: (T | null)[], uniqueFieldName: keyof T) {
	const unique = [];
	const ids = new Set();
	for (const item of list) {
		if (item === null) {
			continue;
		}
		const id = item[uniqueFieldName];
		if (ids.has(id)) {
			continue;
		}
		ids.add(id);
		unique.push(item);
	}
	return unique;
}
