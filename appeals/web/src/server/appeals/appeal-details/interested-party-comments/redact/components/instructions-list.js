import { simpleHtmlComponent } from '#lib/mappers/index.js';

const instructionsListMarkup = `
<ol class="govuk-list govuk-list--number">
  <li>
    Use the ‘redacted comment’ box to select the words you want to redact.
  </li>
  <li>
    Select ‘redact’ to confirm your redaction. Repeat until you have finished.  
  </li>
  <li>
    Select ‘continue’ when you have finished redacting.
  </li>
</ol>
`;

export const instructionsList = simpleHtmlComponent(instructionsListMarkup);
