import { broadcastAppeal } from './integrations.broadcasters/appeal.js';
import { broadcastDocument } from './integrations.broadcasters/documents.js';
import { broadcastEventEstimates } from './integrations.broadcasters/event-estimates.js';
import { broadcastEvent } from './integrations.broadcasters/event.js';
import { broadcastRepresentation } from './integrations.broadcasters/representation.js';
import { broadcastServiceUser } from './integrations.broadcasters/service-users.js';

export const broadcasters = {
	broadcastServiceUser,
	broadcastDocument,
	broadcastAppeal,
	broadcastEvent,
	broadcastEventEstimates,
	broadcastRepresentation
};
