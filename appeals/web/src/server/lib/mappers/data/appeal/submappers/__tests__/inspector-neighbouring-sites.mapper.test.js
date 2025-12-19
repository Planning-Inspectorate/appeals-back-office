import { permissionNames } from '#environment/permissions.js';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { mapInspectorNeighbouringSites } from '../inspector-neighbouring-sites.mapper.js';

/** @typedef {import('../../mapper.js').SubMapperParams} SubMapperParams */
/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal */
/** @typedef {import('#app/auth/auth-session.service').SessionWithAuth} SessionWithAuth */

describe('mapInspectorNeighbouringSites', () => {
	/** @type {WebAppeal} */
	let appealDetails;
	/** @type {string} */
	let currentRoute;
	/** @type {any} */
	let session;
	/** @type {any} */
	let request;

	beforeEach(() => {
		appealDetails = structuredClone(appealData);
		currentRoute = '/appeals-service/appeal-details/1';
		session = {
			permissions: {}
		};
		request = {};
	});

	it('should return "No addresses" when neighbouringSites is empty', () => {
		appealDetails.neighbouringSites = [];

		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: false,
			skipAssignedUsersData: false,
			request
		};
		const result = mapInspectorNeighbouringSites(params);
		expect(result.display.summaryListItem?.value.html).toBe('No addresses');
	});

	it('should format addresses when neighbouringSites are present', () => {
		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: false,
			skipAssignedUsersData: false,
			request
		};

		const result = mapInspectorNeighbouringSites(params);

		expect(result.display.summaryListItem?.value?.html).toContain('1 Grove Cottage');
		expect(result.display.summaryListItem?.value?.html).toContain('NR35 2ND');
		expect(result.display.summaryListItem?.value?.html).toContain('2 Grove Cottage');
		expect(result.display.summaryListItem?.value?.html).toContain('NR35 2ND');
	});

	it('should include "Manage" action when user has permission and sites exist', () => {
		session.permissions[permissionNames.updateCase] = true;

		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: true,
			skipAssignedUsersData: false,
			request
		};

		const result = mapInspectorNeighbouringSites(params);

		const actions = result.display.summaryListItem?.actions.items;
		expect(actions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: 'Manage',
					href: `${currentRoute}/neighbouring-sites/manage`,
					visuallyHiddenText: 'Interested party and neighbour addresses',
					attributes: { 'data-cy': 'manage-neighbouring-sites-inspector' }
				})
			])
		);
	});

	it('should NOT include "Manage" action when user lacks permission', () => {
		session.permissions[permissionNames.updateCase] = false;

		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: false,
			skipAssignedUsersData: false,
			request
		};

		const result = mapInspectorNeighbouringSites(params);

		const actions = result.display.summaryListItem?.actions.items;
		expect(actions).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: 'Manage'
				})
			])
		);
	});

	it('should NOT include "Manage" action when no sites exist, even with permission', () => {
		session.permissions[permissionNames.updateCase] = true;
		appealDetails.neighbouringSites = [];

		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: true,
			skipAssignedUsersData: false,
			request
		};

		const result = mapInspectorNeighbouringSites(params);

		const actions = result.display.summaryListItem?.actions.items;
		expect(actions).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: 'Manage'
				})
			])
		);
	});

	it('should include "Add" action when user has permission', () => {
		session.permissions[permissionNames.updateCase] = true;

		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: true,
			skipAssignedUsersData: false,
			request
		};

		const result = mapInspectorNeighbouringSites(params);

		const actions = result.display.summaryListItem?.actions.items;
		expect(actions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: 'Add',
					href: `${currentRoute}/neighbouring-sites/add/back-office`,
					visuallyHiddenText: 'Interested party and neighbour addresses',
					attributes: { 'data-cy': 'add-neighbouring-sites-inspector' }
				})
			])
		);
	});

	it('should NOT include "Add" action when user lacks permission', () => {
		session.permissions[permissionNames.updateCase] = false;

		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: false,
			skipAssignedUsersData: false,
			request
		};

		const result = mapInspectorNeighbouringSites(params);

		const actions = result.display.summaryListItem?.actions.items;
		expect(actions).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: 'Add'
				})
			])
		);
	});

	it('should check for specific key text as requested', () => {
		/** @type {SubMapperParams} */
		const params = {
			appealDetails,
			currentRoute,
			session,
			userHasUpdateCasePermission: false,
			skipAssignedUsersData: false,
			request
		};
		const result = mapInspectorNeighbouringSites(params);
		expect(result.display.summaryListItem?.key.text).toBe(
			'Interested party and neighbour addresses'
		);
	});
});
