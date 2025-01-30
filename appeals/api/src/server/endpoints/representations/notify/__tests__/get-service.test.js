import { getNotifyService } from '../get-service.js';
import { jest } from '@jest/globals';

jest.unstable_mockModule('./src/server/endpoints/representations/notify/service-map.js', () => ({
	serviceMap: [
		{
			status: 'status-a',
			type: 'type-a',
			service: jest.fn(() => 'notify for status-a and type-a')
		},
		{
			status: 'status-a',
			type: 'type-b',
			service: jest.fn(() => 'notify for status-a and type-b')
		},
		{
			status: 'status-b',
			type: 'type-a',
			service: jest.fn(() => 'notify for status-b and type-a')
		},
		{
			status: 'status-b',
			type: 'type-b',
			service: jest.fn(() => 'notify for status-b and type-b')
		}
	]
}));

describe('getNotifyService', () => {
	it.each([
		['status-a', 'type-a', 'notify for status-a and type-a'],
		['status-a', 'type-b', 'notify for status-a and type-b'],
		['status-b', 'type-a', 'notify for status-b and type-a'],
		['status-b', 'type-b', 'notify for status-b and type-b']
	])(
		'returns the service function specific to the given combination of rep type and status',
		(status, type, serviceResolution) => {
			const service = getNotifyService(status, type);

			// @ts-ignore
			expect(service()).toEqual(serviceResolution);
		}
	);
});
