# Linked appeals

## Overview

Due to the way that linked appeals covers all areas of the codebase, any new functionality should consider how it will affect linked appeals

There are two types of linked appeals: 'normal' linking and enforcement multiple appellants. Mostly these are considered in the same way in the codebase but there are places where they are dealt with differently.

Note that the decision was made to rename 'child' appeals to 'linked' appeals and so these terms can be used interchangeably. Currently, throughout the codebase, we continue to use 'child' to mean the appeal under the lead. Linked appeals has been used to refer to the group of linked appeals (the lead and all the child appeals)

You can add child appeals to your appeal using `checkAppealExistsByIdAndAddPartialToRequest` with `'childAppeals'`, this returns something like the following:

```
childAppeals: [
  {
    id: 4021,
    type: 'linked',
    parentRef: '6004162',
    childRef: '6004163',
    parentId: 4162,
    childId: 4163,
    externalSource: false,
    externalAppealType: null,
    externalId: null,
    linkingDate: 2026-03-16T15:00:41.959Z,
    child: {
      id: 4163,
      reference: '6004163',
      submissionId: '4b78fc58-fcb0-70d6-5dea-b9b774f802d6',
      appealTypeId: 2,
      procedureTypeId: null,
      addressId: 6199,
      lpaId: 1,
      applicationReference: '43010/APP/1/290572',
      caseCreatedDate: 2026-03-16T15:00:41.539Z,
      caseUpdatedDate: 2026-03-16T15:30:02.758Z,
      caseValidDate: 2026-01-26T00:00:00.000Z,
      caseExtensionDate: null,
      caseStartedDate: null,
      casePublishedDate: null,
      caseCompletedDate: null,
      withdrawalRequestDate: null,
      caseResubmittedTypeId: null,
      caseTransferredId: null,
      eiaScreeningRequired: null,
      allocationId: null,
      appellantId: 5776,
      agentId: 5775,
      caseOfficerUserId: 5,
      inspectorUserId: null,
      padsInspectorUserId: null,
      assignedTeamId: null,
      appealType: [Object],
      appealStatus: [Array],
      lpaQuestionnaire: null,
      appellantCase: [Object],
      inspectorDecision: null,
      address: [Object],
      appellant: [Object],
      agent: [Object]
    }
  },
  {
    id: ...
  }
]
```

Note here that the top level `id` is the id of the relationship and NOT of the child appeal. The id of the child is stored as childId and the information about the child can be found under the `child` property.

## Helper functions

There are various helper functions relating to linked appeals which can be found in:

- appeals/web/src/server/lib/mappers/utils (on the web side)
  - is-linked-appeal.js
- appeals/api/src/server/utils (on the api side)
  - is-awaiting-linked-appeal.js
  - is-linked-appeal.js
  - link-appeals.js

## Information stored on each appeal

In order to keep the unlinking and changing lead actions as low in complexity as possible we keep the child appeals up to date with the same information as the lead except for:

- Documents
  - Documents are copied on unlinking or changing the lead
  - They are copied in the blob storage to the relevant folder
  - New values are created in the correct database tables to link them to the new appeal they are on
  - Any filename conflicts are resolved by adding the appeal number they came from to the end of the filename
  - Documents are not removed from the previous lead when changing the lead (so swapping back and forth can create a large number of documents)
- IP comments
  - IP comments can be submitted on any of the appeals in the linked group
  - In the database they are stored against the appeal which they were submitted to
  - When viewing the lead appeal, all the comments for the group are shown and any actions made there are updated to the correct representation in the database
  - When unlinking...
- Case history
  - Currently, the case history is not copied onto the child- and in many cases it does not get information following actions on the lead
  - A change to this is being considered post MVP

## Transitioning between states

If a specific transition isn't mentioned here, it is most likely driven by the lead appeal and information copied across to the child appeals.

### Assign case officer

- Assigned on the lead, information copied to the child appeals, they then all transition

### Validation

- Validated on the lead, information copied to the child appeals, they then all transition

### Start case

- Started on the lead, information copied to the child appeals, they then all transition

### LPAQ

- For enforcement with multiple appellants:
  - LPAQ submitted and reviewed on the lead, information copied to the child appeals, they then all transition
- For 'normal' linked appeals:
  - LPAQ submitted and reviewed on each appeal
  - Any which have been reviewed before the whole group of LPAQs has been reviewed will be 'awaiting linked appeal'
  - Once all the appeals in the linked group have had the LPAQ submitted and reviewed, they all transition

### Statements

- IP comments:
  - Submitted on each appeal, reviewed on the lead - see 'Information stored on each appeal' section above for more detail
- LPA/appellant statement:
  - Submitted and reviewed on the lead, information copied to the child appeals
- After all have been reviewed on the lead, they then all transition

### Final comments

- Submitted and reviewed on the lead, information copied to the child appeals, they then all transition

### Set up event

- Event set up on the lead, information copied to the child appeals, they then all transition

### Awaiting event

- They all transition when the date of the event is reached

### Issue decision

- Decision given on the lead, information copied to the child appeals, then they all transition
