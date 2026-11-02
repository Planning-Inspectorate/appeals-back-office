// @ts-nocheck
import { mapCaseTeam } from '#lib/mappers/data/appeal/submappers/team.mapper.js';

describe('team.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			appealDetails: {
				assignedTeam: {
					name: 'Team Alpha',
					email: 'team-alpha@pins.test'
				}
			},
			currentRoute: '/test',
			userHasUpdateCasePermission: true
		};
	});

	it('should display team with Change link when team is assigned', () => {
		const mappedData = mapCaseTeam(data);
		expect(mappedData.display.summaryListItem.actions.items[0].text).toBe('Change');
		expect(mappedData.display.summaryListItem.value.html).toContain('Team Alpha');
	});

	it('should display team with Assign link when team is not assigned (assignedTeam undefined)', () => {
		const mappedData = mapCaseTeam({
			...data,
			appealDetails: {}
		});
		expect(mappedData.display.summaryListItem.actions.items[0].text).toBe('Assign');
		expect(mappedData.display.summaryListItem.value.html).toContain('Not assigned');
	});

	it('should display team with Assign link when team is not assigned (assignedTeam null)', () => {
		const mappedData = mapCaseTeam({
			...data,
			appealDetails: { assignedTeam: null }
		});
		expect(mappedData.display.summaryListItem.actions.items[0].text).toBe('Assign');
		expect(mappedData.display.summaryListItem.value.html).toContain('Not assigned');
	});
});
