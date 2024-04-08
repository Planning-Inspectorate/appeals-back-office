import { faker } from '@faker-js/faker';
import { snakeCase } from 'lodash-es';

/** @typedef {import('@pins/platform').PlanningInspectorAccountInfo} AccountInfo */
/** @typedef {Omit<AccountInfo, 'idTokenClaims'> & { groups?: string[] }} AccountInfoOptions */

/**
 * @param {Partial<AccountInfoOptions>} [options={}]
 * @returns {AccountInfo}
 */
export function createAccountInfo({
	homeAccountId = faker.datatype.uuid(),
	name = `${faker.name.firstName()} ${faker.name.lastName()}`,
	environment = 'login.planninginspectorate.gov.uk',
	tenantId = 'PlanningInspectorate',
	username = snakeCase(name),
	localAccountId = faker.datatype.uuid(),
	groups = ['appeals_case_officer', 'appeals_inspector']
} = {}) {
	return {
		homeAccountId,
		environment,
		tenantId,
		username,
		localAccountId,
		name,
		idTokenClaims: {
			groups
		}
	};
}
