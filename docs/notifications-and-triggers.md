# Notifications and triggers

The following notifications are sent from the back-office using these [Notify Templates](../appeals/api/src/server/notify/templates):

## Change appeal type

### Appeal type change

- **Appeal type:** all
- **Notify Template:** [appeal-type-change-non-has](../appeals/api/src/server/notify/templates/appeal-type-change-non-has.content.md)
- **Trigger:** Click "Change" in the Appeal type row within the overview section, select the new type, select yes to resubmit and confirm.

## Withdrawal

### Appeal withdrawn appellant

- **Appeal type:** all
- **Notify Template:** [appeal-withdrawn-appellant](../appeals/api/src/server/notify/templates/appeal-withdrawn-appellant.content.md)
- **Trigger:** Click "Start" in the Appeal withdrawal row within the case management section and confirm.

### Appeal withdrawn lpa

- **Appeal type:** all
- **Notify Template:** [appeal-withdrawn-lpa](../appeals/api/src/server/notify/templates/appeal-withdrawn-lpa.content.md)
- **Trigger:** Click "Start" in the Appeal withdrawal row within the case management section and confirm.

## Validation

### Appeal incomplete

- **Appeal type:** all
- **Notify Template:** [appeal-incomplete](../appeals/api/src/server/notify/templates/appeal-incomplete.content.md)
- **Trigger:** Select "Incomplete" when answering "What is the outcome of your review?", Pick some reasons and then confirm.

### Appeal invalid

- **Appeal type:** all
- **Notify Template:** [appeal-invalid](../appeals/api/src/server/notify/templates/appeal-invalid.content.md)
- **Trigger:** Select "Invalid" when answering "What is the outcome of your review?", Pick some reasons and then confirm.

### Appeal confirmed

- **Appeal type:** all
- **Notify Template:** [appeal-confirmed](../appeals/api/src/server/notify/templates/appeal-confirmed.content.md)
- **Trigger:** Select "Confirmed" when answering "What is the outcome of your review?", and then confirm.

## Ready to start

### Appeal valid start case s78 appellant

- **Appeal type:** s78
- **Notify Template:** [appeal-valid-start-case-s78-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-appellant.content.md)
- **Trigger:** Start a full planning case, select an appeal procedure, and confirm.

### Appeal valid start case s78 lpa

- **Appeal type:** s78
- **Notify Template:** [appeal-valid-start-case-s78-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-lpa.content.md)
- **Trigger:** Start a full planning case, select an appeal procedure, and confirm.

### Appeal valid start case householder appellant

- **Appeal type:** householder
- **Notify Template:** [appeal-valid-start-case-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-appellant.content.md)
- **Trigger:** Start a householder case, select an appeal procedure, and confirm.

### Appeal valid start case householder lpa

- **Appeal type:** householder
- **Notify Template:** [appeal-valid-start-case-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-lpa.content.md)
- **Trigger:** Start a householder case, select an appeal procedure, and confirm.

## LPA questionnaire

### Appeal start date change appellant

- **Appeal type:** all
- **Notify Template:** [appeal-start-date-change-appellant](../appeals/api/src/server/notify/templates/appeal-start-date-change-appellant.content.md)
- **Trigger:** Click "Change" in the Start date row within the timetable and confirm.

### Appeal start date change lpa

- **Appeal type:** all
- **Notify Template:** [appeal-start-date-change-lpa](../appeals/api/src/server/notify/templates/appeal-start-date-change-lpa.content.md)
- **Trigger:** Click "Change" in the Start date row within the timetable and confirm.

### Lpaq complete s78 appellant

- **Appeal type:** s78
- **Notify Template:** [lpaq-complete-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-appellant.content.md)
- **Trigger:** Review a Lpaq and mark it as complete by selecting "Complete" and continue

### Lpaq complete householder appellant

- **Appeal type:** householder
- **Notify Template:** [lpaq-complete-has-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-has-appellant.content.md)
- **Trigger:** Review a Lpaq and mark it as complete by selecting "Complete" and continue

### Lpaq complete lpa

- **Appeal type:** all
- **Notify Template:** [lpaq-complete-lpa](../appeals/api/src/server/notify/templates/lpaq-complete-lpa.content.md)
- **Trigger:** Review a Lpaq and mark it as complete by selecting "Complete" and continue

### Lpaq incomplete

- **Appeal type:** all
- **Notify Template:** [lpaq-incomplete](../appeals/api/src/server/notify/templates/lpaq-incomplete.content.md)
- **Trigger:** Review a Lpaq and mark it as incomplete by selecting "Incomplete" and continue

## Statements

### Lpa statement incomplete

- **Appeal type:** all
- **Notify Template:** [lpa-statement-incomplete](../appeals/api/src/server/notify/templates/lpa-statement-incomplete.content.md)
- **Trigger:** Review a lpa statement and mark it as incomplete by selecting "Incomplete" and continue

### Ip comment rejected

- **Appeal type:** all
- **Notify Template:** [ip-comment-rejected](../appeals/api/src/server/notify/templates/ip-comment-rejected.content.md)
- **Trigger:** Review an ip comment and mark it as rejected by selecting "Reject" and continue

### Ip comment rejected deadline extended

- **Appeal type:** all
- **Notify Template:** [ip-comment-rejected](../appeals/api/src/server/notify/templates/ip-comment-rejected.content.md)
- **Trigger:** Update and extend the ip comment due date and then review an ip comment and mark it as rejected by selecting "Reject" and continue
