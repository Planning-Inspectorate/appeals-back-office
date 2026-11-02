import { faker } from '@faker-js/faker';
import { snakeCase } from 'lodash-es';

/** @typedef {import('@pins/platform').PlanningInspectorAccountInfo} AccountInfo */
/** @typedef {Omit<AccountInfo, 'idTokenClaims'> & { groups?: string[] }} AccountInfoOptions */

/**
 * @param {Partial<AccountInfoOptions>} [options={}]
 * @returns {AccountInfo}
 */
export function createAccountInfo({
	homeAccountId = faker.string.uuid(),
	name = `${faker.person.firstName()} ${faker.person.lastName()}`,
	environment = 'login.planninginspectorate.gov.uk',
	tenantId = 'PlanningInspectorate',
	username = snakeCase(name),
	localAccountId = faker.string.uuid(),
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
