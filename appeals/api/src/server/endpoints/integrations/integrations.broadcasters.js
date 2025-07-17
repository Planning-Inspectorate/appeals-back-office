import { broadcastServiceUser } from './integrations.broadcasters/service-users.js';
import { broadcastDocument } from './integrations.broadcasters/documents.js';
import { broadcastAppeal } from './integrations.broadcasters/appeal.js';
import { broadcastEvent } from './integrations.broadcasters/event.js';
import { broadcastEventEstimates } from './integrations.broadcasters/event-estimates.js';
import { broadcastRepresentation } from './integrations.broadcasters/representation.js';

export const broadcasters = {
	broadcastServiceUser,
	broadcastDocument,
	broadcastAppeal,
	broadcastEvent,
	broadcastEventEstimates,
	broadcastRepresentation
};
