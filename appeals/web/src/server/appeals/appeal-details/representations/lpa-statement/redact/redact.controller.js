import { render } from '../../common/render.js';
import { redactLpaStatementPage } from './redact.mapper.js';

export const renderRedact = render(redactLpaStatementPage, 'patterns/display-page.pattern.njk');
