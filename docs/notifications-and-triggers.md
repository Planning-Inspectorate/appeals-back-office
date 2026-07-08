# Notifications and triggers

The following notifications are sent from the back-office using
these [Notify Templates](../appeals/api/src/server/notify/templates):

## Change appeal type

### Appeal type change

- **Appeal type:** all
- **Notify Subject Template:** [appeal-type-change-non-has](../appeals/api/src/server/notify/templates/appeal-type-change-non-has.subject.md)
- **Notify Content Template:** [appeal-type-change-non-has](../appeals/api/src/server/notify/templates/appeal-type-change-non-has.content.md)
- **Trigger:** Click "Change" in the Appeal type row within the overview section, select the new type, select yes to
  resubmit and confirm.

### Appeal type change in MA - appellant

- **Appeal type:**
- **Notify Subject Template:** [appeal-type-change-in-manage-appeals-appellant](../appeals/api/src/server/notify/templates/appeal-type-change-in-manage-appeals-appellant.subject.md)
- **Notify Content Template:** [appeal-type-change-in-manage-appeals-appellant](../appeals/api/src/server/notify/templates/appeal-type-change-in-manage-appeals-appellant.content.md)
- **Trigger:**

### Appeal type change in MA - lpa

- **Appeal type:**
- **Notify Subject Template:** [appeal-type-change-in-manage-appeals-lpa](../appeals/api/src/server/notify/templates/appeal-type-change-in-manage-appeals-lpa.subject.md)
- **Notify Content Template:** [appeal-type-change-in-manage-appeals-lpa](../appeals/api/src/server/notify/templates/appeal-type-change-in-manage-appeals-lpa.content.md)
- **Trigger:**

## Change procedure type

### Change procedure type

- **Appeal type:** all
- **Notify Subject Template:** [change-procedure-type](../appeals/api/src/server/notify/templates/change-procedure-type.subject.md)
- **Notify Content Template:** [change-procedure-type](../appeals/api/src/server/notify/templates/change-procedure-type.content.md)
- **Trigger:** Click "Change" in the Appeal procedure row within the overview section, select the new procedure, and confirm.

## Change LPA

### LPA changed - appellant

- **Appeal type:** all
- **Notify Subject Template:** [lpa-changed-appellant](../appeals/api/src/server/notify/templates/lpa-changed-appellant.subject.md)
- **Notify Content Template:** [lpa-changed-appellant](../appeals/api/src/server/notify/templates/lpa-changed-appellant.content.md)
- **Trigger:** Click "Change" in the LPA row within the top section of the Case details page, select the new LPA, and confirm.

### LPA changed - lpa

- **Appeal type:** all
- **Notify Subject Template:** [lpa-removed](../appeals/api/src/server/notify/templates/lpa-removed.subject.md)
- **Notify Content Template:** [lpa-removed](../appeals/api/src/server/notify/templates/lpa-removed.content.md)
- **Trigger:** Click "Change" in the LPA row within the top section of the Case details page, select the new LPA, and confirm. This email is sent to the previous LPA.

## Withdrawal

### Appeal withdrawn appellant

- **Appeal type:** all
- **Notify Subject Template:** [appeal-withdrawn-appellant](../appeals/api/src/server/notify/templates/appeal-withdrawn-appellant.subject.md)
- **Notify Content Template:** [appeal-withdrawn-appellant](../appeals/api/src/server/notify/templates/appeal-withdrawn-appellant.content.md)
- **Trigger:** Click "Start" in the Appeal withdrawal row within the case management section and confirm.

### Appeal withdrawn lpa

- **Appeal type:** all
- **Notify Subject Template:** [appeal-withdrawn-lpa](../appeals/api/src/server/notify/templates/appeal-withdrawn-lpa.subject.md)
- **Notify Content Template:** [appeal-withdrawn-lpa](../appeals/api/src/server/notify/templates/appeal-withdrawn-lpa.content.md)
- **Trigger:** Click "Start" in the Appeal withdrawal row within the case management section and confirm.

## Cancellation

### Enforcement notice withdrawn

- **Appeal type:** enforcement types
- **Notify Subject Template:** [appeal-cancelled-enforcement-notice-withdrawn](../appeals/api/src/server/notify/templates/appeal-cancelled-enforcement-notice-withdrawn.subject.md)
- **Notify Content Template:** [appeal-cancelled-enforcement-notice-withdrawn](../appeals/api/src/server/notify/templates/appeal-cancelled-enforcement-notice-withdrawn.content.md)
- **Trigger:** Cancel appeal and select "LPA has withdrawn the enforcement notice" and confirm.

## Validation

### Appeal incomplete

- **Appeal type:** all
- **Notify Subject Template:** [appeal-incomplete](../appeals/api/src/server/notify/templates/appeal-incomplete.subject.md)
- **Notify Content Template:** [appeal-incomplete](../appeals/api/src/server/notify/templates/appeal-incomplete.content.md)
- **Trigger:** Select "Incomplete" when answering "What is the outcome of your review?", Pick some reasons and then
  confirm.

### Appeal invalid

- **Appeal type:** all
- **Notify Subject Template:** [appeal-invalid](../appeals/api/src/server/notify/templates/appeal-invalid.subject.md)
- **Notify Content Template:** [appeal-invalid](../appeals/api/src/server/notify/templates/appeal-invalid.content.md)
- **Trigger:** Select "Invalid" when answering "What is the outcome of your review?", Pick some reasons and then
  confirm.

### Appeal invalid - lpa

- **Appeal type:** all
- **Notify Subject Template:** [appeal-invalid-lpa](../appeals/api/src/server/notify/templates/appeal-invalid-lpa.subject.md)
- **Notify Content Template:** [appeal-invalid-lpa](../appeals/api/src/server/notify/templates/appeal-invalid-lpa.content.md)
- **Trigger:** Select "Invalid" when answering "What is the outcome of your review?", Pick some reasons and then
  confirm.

### Appeal confirmed - appellant

- **Appeal type:** all
- **Notify Subject Template:** [appeal-confirmed](../appeals/api/src/server/notify/templates/appeal-confirmed.subject.md)
- **Notify Content Template:** [appeal-confirmed](../appeals/api/src/server/notify/templates/appeal-confirmed.content.md)
- **Trigger:** Select "Confirmed" when answering "What is the outcome of your review?", and then confirm.

### Appeal confirmed - lpa

- **Appeal type:** all
- **Notify Subject Template:** [appeal-confirmed-lpa](../appeals/api/src/server/notify/templates/appeal-confirmed-lpa.subject.md)
- **Notify Content Template:** [appeal-confirmed-lpa](../appeals/api/src/server/notify/templates/appeal-confirmed-lpa.content.md)
- **Trigger:** Select "Confirmed" when answering "What is the outcome of your review?", and then confirm.

### Appeal confirmed enforcement - appellant

- **Appeal type:** all
- **Notify Subject Template:** [appeal-confirmed-enforcement-appellant](../appeals/api/src/server/notify/templates/appeal-confirmed-enforcement-appellant.subject.md)
- **Notify Content Template:** [appeal-confirmed-enforcement-appellant](../appeals/api/src/server/notify/templates/appeal-confirmed-enforcement-appellant.content.md)
- **Trigger:** Select "Confirmed" when answering "What is the outcome of your review?" for an enforcement or ELB appeal, and then confirm.

### Appeal confirmed enforcement - lpa

- **Appeal type:** all
- **Notify Subject Template:** [appeal-confirmed-enforcement-lpa](../appeals/api/src/server/notify/templates/appeal-confirmed-enforcement-lpa.subject.md)
- **Notify Content Template:** [appeal-confirmed-enforcement-lpa](../appeals/api/src/server/notify/templates/appeal-confirmed-enforcement-lpa.content.md)
- **Trigger:** Select "Confirmed" when answering "What is the outcome of your review?" for an enforcement or ELB appeal, and then confirm.

## Ready to start

### Start case - s78 appellant

- **Appeal type:** s78, s20
- **Procedure:** Written, Hearing (with no date and time for the hearing)
- **Notify Subject Template:** [appeal-valid-start-case-s78-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-s78-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-appellant.content.md)
- **Trigger:** Start a full planning or listed building case, select an appeal procedure, and confirm.

### Start case - s78 lpa

- **Appeal type:** s78, s20
- **Procedure:** Written, Hearing (with no date and time for the hearing)
- **Notify Subject Template:** [appeal-valid-start-case-s78-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-s78-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-lpa.content.md)
- **Trigger:** Start a full planning or listed building case, select an appeal procedure, and confirm.

### Start case - s78 expedited appellant

- **Appeal type:** s78
- **Procedure:** Expedited (Written part 1)
- **Notify Subject Template:** [appeal-valid-start-case-s78-expedited-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-expedited-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-s78-expedited-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-expedited-appellant.content.md)
- **Trigger:** Start a full planning or listed building case, select expedited (written part 1) procedure, and confirm.

### Start case - s78 expedited lpa

- **Appeal type:** s78
- **Procedure:** Expedited (Written part 1)
- **Notify Subject Template:** [appeal-valid-start-case-s78-expedited-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-expedited-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-s78-expedited-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-expedited-lpa.content.md)
- **Trigger:** Start a full planning or listed building case, select expedited (written part 1) procedure, and confirm.

### Start case - s78 hearing appellant

- **Appeal type:** s78, s20
- **Procedure:** Hearing (with hearing date and time set up)
- **Notify Subject Template:** [appeal-valid-start-case-s78-hearing-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-hearing-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-s78-hearing-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-hearing-appellant.content.md)
- **Trigger:** Start a full planning or listed building case, select hearing procedure, set up a date and time for the hearing, and confirm.

### Start case - s78 hearing lpa

- **Appeal type:** s78, s20
- **Procedure:** Hearing (with hearing date and time set up)
- **Notify Subject Template:** [appeal-valid-start-case-s78-hearing-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-hearing-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-s78-hearing-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-hearing-lpa.content.md)
- **Trigger:** Start a full planning or listed building case, select hearing procedure, set up a date and time for the hearing, and confirm.

### Start case - s78 inquiry

- **Appeal type:** s78, s20
- **Procedure:** Inquiry
- **Notify Subject Template:** [appeal-valid-start-case-s78-inquiry](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-inquiry.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-s78-inquiry](../appeals/api/src/server/notify/templates/appeal-valid-start-case-s78-inquiry.content.md)
- **Trigger:** Start a full planning or listed building case, select inquiry procedure, and confirm. This template is used for both LPA and appellant.

### Start case - householder appellant

- **Appeal type:** householder, CAS planning, CAS advert
- **Notify Subject Template:** [appeal-valid-start-case-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-appellant.content.md)
- **Trigger:** Start a householder case, select an appeal procedure, and confirm.

### Start case - householder lpa

- **Appeal type:** householder, CAS planning, CAS advert
- **Notify Subject Template:** [appeal-valid-start-case-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-lpa.content.md)
- **Trigger:** Start a householder case, select an appeal procedure, and confirm.

### Start case - advertisement appellant

- **Appeal type:** advertisement, LDC
- **Procedure:** Written, Hearing (with no date and time for the hearing)
- **Notify Subject Template:** [appeal-valid-start-case-advertisement-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-advertisement-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-appellant.content.md)
- **Trigger:** Start an advertisement case, select written procedure or hearing procedure (but no date and time for the hearing), and confirm.

### Start case - advertisement lpa

- **Appeal type:** advertisement, LDC
- **Procedure:** Written, Hearing (with no date and time for the hearing)
- **Notify Subject Template:** [appeal-valid-start-case-advertisement-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-advertisement-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-lpa.content.md)
- **Trigger:** Start an advertisement case, select written procedure or hearing procedure (but no date and time for the hearing), and confirm.

### Start case - advertisement hearing appellant

- **Appeal type:** advertisement, LDC
- **Procedure:** Hearing (with hearing date and time set up)
- **Notify Subject Template:** [appeal-valid-start-case-advertisement-hearing-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-hearing-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-advertisement-hearing-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-hearing-appellant.content.md)
- **Trigger:** Start an advertisement case, select hearing procedure, set up a date and time for the hearing, and confirm.

### Start case - advertisement hearing lpa

- **Appeal type:** advertisement, LDC
- **Procedure:** Hearing (with hearing date and time set up)
- **Notify Subject Template:** [appeal-valid-start-case-advertisement-hearing-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-hearing-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-advertisement-hearing-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-hearing-lpa.content.md)
- **Trigger:** Start an advertisement case, select hearing procedure, set up a date and time for the hearing, and confirm.

### Start case - advertisement inquiry

- **Appeal type:** advertisement, LDC
- **Procedure:** Inquiry
- **Notify Subject Template:** [appeal-valid-start-case-advertisement-inquiry](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-inquiry.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-advertisement-inquiry](../appeals/api/src/server/notify/templates/appeal-valid-start-case-advertisement-inquiry.content.md)
- **Trigger:** Start an advertisement case, select inquiry procedure, and confirm. This template is used for both LPA and appellant.

### Start case - enforcement appellant

- **Appeal type:** enforcement and ELB
- **Procedure:** Written, Hearing (with no date and time for the hearing), Inquiry
- **Notify Subject Template:** [appeal-valid-start-case-enforcement-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-enforcement-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-appellant.content.md)
- **Trigger:** Start an enforcement case, select written procedure or hearing procedure (but no date and time for the hearing), and confirm.

### Start case - enforcement lpa

- **Appeal type:** enforcement and ELB
- **Procedure:** Written, Hearing (with no date and time for the hearing), Inquiry
- **Notify Subject Template:** [appeal-valid-start-case-enforcement-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-enforcement-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-lpa.content.md)
- **Trigger:** Start an enforcement case, select written procedure or hearing procedure (but no date and time for the hearing), and confirm.

### Start case - enforcement hearing appellant

- **Appeal type:** enforcement and ELB
- **Procedure:** Hearing (with hearing date and time set up)
- **Notify Subject Template:** [appeal-valid-start-case-enforcement-hearing-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-hearing-appellant.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-enforcement-hearing-appellant](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-hearing-appellant.content.md)
- **Trigger:** Start an enforcement case, select hearing procedure, set up a date and time for the hearing, and confirm.

### Start case - enforcement hearing lpa

- **Appeal type:** enforcement and ELB
- **Procedure:** Hearing (with hearing date and time set up)
- **Notify Subject Template:** [appeal-valid-start-case-enforcement-hearing-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-hearing-lpa.subject.md)
- **Notify Content Template:** [appeal-valid-start-case-enforcement-hearing-lpa](../appeals/api/src/server/notify/templates/appeal-valid-start-case-enforcement-hearing-lpa.content.md)
- **Trigger:** Start an enforcement case, select hearing procedure, set up a date and time for the hearing, and confirm.

## Timetable updated

### Timetable updated - s78/s20 written procedure

- **Appeal type:** s78, s20
- **Procedure:** Written
- **Notify Subject Template:** [appeal-timetable-updated](../appeals/api/src/server/notify/templates/appeal-timetable-updated.subject.md)
- **Notify Content Template:** [appeal-timetable-updated](../appeals/api/src/server/notify/templates/appeal-timetable-updated.content.md)
- **Trigger:** Update timetable dates from the timetable section of the appeal. Sent to appellant/agent and LPA.

### Timetable updated - s78/s20 hearing

- **Appeal type:** s78, s20
- **Procedure:** Hearing
- **Notify Subject Template:** [appeal-timetable-updated-hearing](../appeals/api/src/server/notify/templates/appeal-timetable-updated-hearing.subject.md)
- **Notify Content Template:** [appeal-timetable-updated-hearing](../appeals/api/src/server/notify/templates/appeal-timetable-updated-hearing.content.md)
- **Trigger:** Update timetable dates from the timetable section of the appeal. Sent to appellant/agent and LPA.

### Timetable updated - s78/s20 inquiry

- **Appeal type:** s78, s20
- **Procedure:** Inquiry
- **Notify Subject Template:** [appeal-timetable-updated-inquiry](../appeals/api/src/server/notify/templates/appeal-timetable-updated-inquiry.subject.md)
- **Notify Content Template:** [appeal-timetable-updated-inquiry](../appeals/api/src/server/notify/templates/appeal-timetable-updated-inquiry.content.md)
- **Trigger:** Update timetable dates from the timetable section of the appeal. Sent to appellant/agent, LPA, and any
  Rule 6 parties.

### Timetable updated - householder/CAS

- **Appeal type:** householder, CAS planning, CAS advert
- **Notify Subject Template:** [has-appeal-timetable-updated](../appeals/api/src/server/notify/templates/has-appeal-timetable-updated.subject.md)
- **Notify Content Template:** [has-appeal-timetable-updated](../appeals/api/src/server/notify/templates/has-appeal-timetable-updated.content.md)
- **Trigger:** Update timetable dates from the timetable section of the appeal. Sent to appellant/agent and LPA.

### Timetable updated - full advert

- **Appeal type:** full advert
- **Notify Subject Template:** [advertisement-appeal-timetable-updated](../appeals/api/src/server/notify/templates/advertisement-appeal-timetable-updated.subject.md)
- **Notify Content Template:** [advertisement-appeal-timetable-updated](../appeals/api/src/server/notify/templates/advertisement-appeal-timetable-updated.content.md)
- **Trigger:** Update timetable dates from the timetable section of the appeal. Sent to appellant/agent and LPA.

## Appeal start date change

### Appeal start date change - appellant

- **Appeal type:** all
- **Procedure:** Written, Hearing
- **Notify Subject Template:** [appeal-start-date-change-appellant](../appeals/api/src/server/notify/templates/appeal-start-date-change-appellant.subject.md)
- **Notify Content Template:** [appeal-start-date-change-appellant](../appeals/api/src/server/notify/templates/appeal-start-date-change-appellant.content.md)
- **Trigger:** Click "Change" in the Start date row within the timetable and confirm.

### Appeal start date change - lpa

- **Appeal type:** all
- **Procedure:** Written, Hearing
- **Notify Subject Template:** [appeal-start-date-change-lpa](../appeals/api/src/server/notify/templates/appeal-start-date-change-lpa.subject.md)
- **Notify Content Template:** [appeal-start-date-change-lpa](../appeals/api/src/server/notify/templates/appeal-start-date-change-lpa.content.md)
- **Trigger:** Click "Change" in the Start date row within the timetable and confirm.

### Appeal start date change inquiry

- **Appeal type:** all
- **Procedure:** Inquiry
- **Notify Subject Template:** [appeal-start-date-change-inquiry](../appeals/api/src/server/notify/templates/appeal-start-date-change-inquiry.subject.md)
- **Notify Content Template:** [appeal-start-date-change-inquiry](../appeals/api/src/server/notify/templates/appeal-start-date-change-inquiry.content.md)
- **Trigger:** Click "Change" in the Start date row within the timetable and confirm.

## LPA questionnaire

### Lpaq complete s78 - appellant

- **Appeal type:** s78, s20
- **Notify Subject Template:** [lpaq-complete-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-appellant.subject.md)
- **Notify Content Template:** [lpaq-complete-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-appellant.content.md)
- **Trigger:** Review a Lpaq and mark it as complete by selecting "Complete" and continue

### Lpaq complete householder - appellant

- **Appeal type:** householder, CAS planning, CAS advert, Full advert
- **Notify Subject Template:** [lpaq-complete-has-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-has-appellant.subject.md)
- **Notify Content Template:** [lpaq-complete-has-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-has-appellant.content.md)
- **Trigger:** Review a Lpaq and mark it as complete by selecting "Complete" and continue

### Lpaq complete s78 expedited - appellant

- **Appeal type:** s78 expedited
- **Notify Subject Template:** [lpaq-complete-s78-expedite-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-s78-expedite-appellant.subject.md)
- **Notify Content Template:** [lpaq-complete-s78-expedite-appellant](../appeals/api/src/server/notify/templates/lpaq-complete-s78-expedite-appellant.content.md)
- **Trigger:** Review a Lpaq and mark it as complete by selecting "Complete" and continue

### Lpaq complete - lpa

- **Appeal type:** all
- **Notify Subject Template:** [lpaq-complete-lpa](../appeals/api/src/server/notify/templates/lpaq-complete-lpa.subject.md)
- **Notify Content Template:** [lpaq-complete-lpa](../appeals/api/src/server/notify/templates/lpaq-complete-lpa.content.md)
- **Trigger:** Review a Lpaq and mark it as complete by selecting "Complete" and continue

### Lpaq incomplete

- **Appeal type:** all
- **Notify Subject Template:** [lpaq-incomplete](../appeals/api/src/server/notify/templates/lpaq-incomplete.subject.md)
- **Notify Content Template:** [lpaq-incomplete](../appeals/api/src/server/notify/templates/lpaq-incomplete.content.md)
- **Trigger:** Review a Lpaq and mark it as incomplete by selecting "Incomplete" and continue

## Statements

### Lpa statement incomplete

- **Appeal type:** s78, s20
- **Notify Subject Template:** [lpa-statement-incomplete](../appeals/api/src/server/notify/templates/lpa-statement-incomplete.subject.md)
- **Notify Content Template:** [lpa-statement-incomplete](../appeals/api/src/server/notify/templates/lpa-statement-incomplete.content.md)
- **Trigger:** Review a lpa statement and mark it as incomplete by selecting "Incomplete" and continue

### Ip comment rejected

- **Appeal type:** s78, s20
- **Notify Subject Template:** [ip-comment-rejected](../appeals/api/src/server/notify/templates/ip-comment-rejected.subject.md)
- **Notify Content Template:** [ip-comment-rejected](../appeals/api/src/server/notify/templates/ip-comment-rejected.content.md)
- **Trigger:** Review an ip comment and mark it as rejected by selecting "Reject" and continue

### Ip comment rejected deadline extended

- **Appeal type:** s78, s20
- **Notify Subject Template:** [ip-comment-rejected-deadline-extended](../appeals/api/src/server/notify/templates/ip-comment-rejected-deadline-extended.subject.md)
- **Notify Content Template:** [ip-comment-rejected-deadline-extended](../appeals/api/src/server/notify/templates/ip-comment-rejected-deadline-extended.content.md)
- **Trigger:** Update and extend the ip comment due date and then review an ip comment and mark it as rejected by
  selecting "Reject" and continue

### Appellant statement received

- **Appeal type:**
- **Notify Subject Template:** [appellant-statement-received](../appeals/api/src/server/notify/templates/appellant-statement-received.subject.md)
- **Notify Content Template:** [appellant-statement-received](../appeals/api/src/server/notify/templates/appellant-statement-received.content.md)
- **Trigger:**

### Rule 6 statement incomplete

- **Appeal type:**
- **Notify Subject Template:** [rule-6-statement-incomplete](../appeals/api/src/server/notify/templates/rule-6-statement-incomplete.subject.md)
- **Notify Content Template:** [rule-6-statement-incomplete](../appeals/api/src/server/notify/templates/rule-6-statement-incomplete.content.md)
- **Trigger:**

### Statements published - written reps lpa

- **Appeal type:** All
- **Procedure:** Written
- **Notify Subject Template:** [publish-statements-written-reps-lpa](../appeals/api/src/server/notify/templates/publish-statements-written-reps-lpa.subject.md)
- **Notify Content Template:** [publish-statements-written-reps-lpa](../appeals/api/src/server/notify/templates/publish-statements-written-reps-lpa.content.md)
- **Trigger:** Publish representations when the appeal is in the statements stage. Sent to LPA.

### Statements published - written reps appellant

- **Appeal type:** All
- **Procedure:** Written
- **Notify Subject Template:** [publish-statements-written-reps-appellant](../appeals/api/src/server/notify/templates/publish-statements-written-reps-appellant.subject.md)
- **Notify Content Template:** [publish-statements-written-reps-appellant](../appeals/api/src/server/notify/templates/publish-statements-written-reps-appellant.content.md)
- **Trigger:** Publish representations when the appeal is in the statements stage. Sent to appellant/agent.

### Statements published - hearing lpa

- **Appeal type:** All
- **Procedure:** Hearing
- **Notify Subject Template:** [publish-statements-hearing-lpa](../appeals/api/src/server/notify/templates/publish-statements-hearing-lpa.subject.md)
- **Notify Content Template:** [publish-statements-hearing-lpa](../appeals/api/src/server/notify/templates/publish-statements-hearing-lpa.content.md)
- **Trigger:** Publish representations when the appeal is in the statements stage. Sent to LPA.

### Statements published - hearing appellant

- **Appeal type:** All
- **Procedure:** Hearing
- **Notify Subject Template:** [publish-statements-hearing-appellant](../appeals/api/src/server/notify/templates/publish-statements-hearing-appellant.subject.md)
- **Notify Content Template:** [publish-statements-hearing-appellant](../appeals/api/src/server/notify/templates/publish-statements-hearing-appellant.content.md)
- **Trigger:** Publish representations when the appeal is in the statements stage. Sent to appellant/agent.

### Statements published - inquiry lpa

- **Appeal type:** All
- **Procedure:** Inquiry
- **Notify Subject Template:** [publish-statements-inquiry-lpa](../appeals/api/src/server/notify/templates/publish-statements-inquiry-lpa.subject.md)
- **Notify Content Template:** [publish-statements-inquiry-lpa](../appeals/api/src/server/notify/templates/publish-statements-inquiry-lpa.content.md)
- **Trigger:** Publish representations when the appeal is in the statements stage. Sent to LPA.

### Statements published - inquiry appellant

- **Appeal type:** All
- **Procedure:** Inquiry
- **Notify Subject Template:** [publish-statements-inquiry-appellant](../appeals/api/src/server/notify/templates/publish-statements-inquiry-appellant.subject.md)
- **Notify Content Template:** [publish-statements-inquiry-appellant](../appeals/api/src/server/notify/templates/publish-statements-inquiry-appellant.content.md)
- **Trigger:** Publish representations when the appeal is in the statements stage. Sent to appellant/agent.

### Statements published - inquiry rule 6

- **Appeal type:** All
- **Procedure:** Inquiry
- **Notify Subject Template:** [publish-statements-inquiry-rule-6](../appeals/api/src/server/notify/templates/publish-statements-inquiry-rule-6.subject.md)
- **Notify Content Template:** [publish-statements-inquiry-rule-6](../appeals/api/src/server/notify/templates/publish-statements-inquiry-rule-6.content.md)
- **Trigger:** Publish representations when the appeal is in the statements stage. Sent to any Rule 6 parties.

## Evidence

### Rule 6 proof of evidence received

- **Appeal type:**
- **Notify Subject Template:** [rule-6-party-proof-of-evidence-received](../appeals/api/src/server/notify/templates/rule-6-party-proof-of-evidence-received.subject.md)
- **Notify Content Template:** [rule-6-party-proof-of-evidence-received](../appeals/api/src/server/notify/templates/rule-6-party-proof-of-evidence-received.content.md)
- **Trigger:**

### Proof of evidence incomplete

- **Appeal type:**
- **Notify Subject Template:** [proof-of-evidence-incomplete](../appeals/api/src/server/notify/templates/proof-of-evidence-incomplete.subject.md)
- **Notify Content Template:** [proof-of-evidence-incomplete](../appeals/api/src/server/notify/templates/proof-of-evidence-incomplete.content.md)
- **Trigger:**

### Proof of evidence not received

- **Appeal type:**
- **Notify Subject Template:** [not-received-proof-of-evidence-and-witnesses](../appeals/api/src/server/notify/templates/not-received-proof-of-evidence-and-witnesses.subject.md)
- **Notify Content Template:** [not-received-proof-of-evidence-and-witnesses](../appeals/api/src/server/notify/templates/not-received-proof-of-evidence-and-witnesses.content.md)
- **Trigger:**

### Proof of evidence shared

- **Appeal type:**
- **Notify Subject Template:** [proof-of-evidence-and-witnesses-shared](../appeals/api/src/server/notify/templates/proof-of-evidence-and-witnesses-shared.subject.md)
- **Notify Content Template:** [proof-of-evidence-and-witnesses-shared](../appeals/api/src/server/notify/templates/proof-of-evidence-and-witnesses-shared.content.md)
- **Trigger:**

## Site visit

### Site visit access required date change appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-access-required-date-change-appellant](../appeals/api/src/server/notify/templates/site-visit-change-access-required-date-change-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-access-required-date-change-appellant](../appeals/api/src/server/notify/templates/site-visit-change-access-required-date-change-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the date/time. Confirming the
  change from the ‘Check details and update site visit’ page triggers this email.

### Site visit access required to accompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-access-required-to-accompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-access-required-to-accompanied-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-access-required-to-accompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-access-required-to-accompanied-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from access
  required to accompanied. Confirming the change from the ‘Check details and update site visit’ page triggers this
  email.

### Site visit access required to accompanied lpa

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-access-required-to-accompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-change-access-required-to-accompanied-lpa.subject.md)
- **Notify Content Template:** [site-visit-change-access-required-to-accompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-change-access-required-to-accompanied-lpa.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from access
  required to accompanied. Confirming the change from the ‘Check details and update site visit’ page triggers this
  email.

### Site visit access required to unaccompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-access-required-to-unaccompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-access-required-to-unaccompanied-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-access-required-to-unaccompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-access-required-to-unaccompanied-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from access
  required to unaccompanied. Confirming the change from the ‘Check details and update site visit’ page triggers this
  email.

### Site visit accompanied date change appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-accompanied-date-change-appellant](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-date-change-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-accompanied-date-change-appellant](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-date-change-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the date/time. Confirming the
  change from the ‘Check details and update site visit’ page triggers this email.

### Site visit accompanied date change lpa

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-accompanied-date-change-lpa](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-date-change-lpa.subject.md)
- **Notify Content Template:** [site-visit-change-accompanied-date-change-lpa](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-date-change-lpa.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the date/time. Confirming the
  change from the ‘Check details and update site visit’ page triggers this email.

### Site visit accompanied to access required appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-accompanied-to-access-required-appellant](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-access-required-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-accompanied-to-access-required-appellant](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-access-required-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from
  accompanied to access required. Confirming the change from the ‘Check details and update site visit’ page triggers
  this email.

### Site visit accompanied to access required lpa

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-accompanied-to-access-required-lpa](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-access-required-lpa.subject.md)
- **Notify Content Template:** [site-visit-change-accompanied-to-access-required-lpa](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-access-required-lpa.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from
  accompanied to access required. Confirming the change from the ‘Check details and update site visit’ page triggers
  this email.

### Site visit accompanied to unaccompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-accompanied-to-unaccompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-unaccompanied-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-accompanied-to-unaccompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-unaccompanied-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from
  accompanied to unaccompanied. Confirming the change from the ‘Check details and update site visit’ page triggers this
  email.

### Site visit accompanied to unaccompanied lpa

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-accompanied-to-unaccompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-unaccompanied-lpa.subject.md)
- **Notify Content Template:** [site-visit-change-accompanied-to-unaccompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-change-accompanied-to-unaccompanied-lpa.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from
  accompanied to unaccompanied. Confirming the change from the ‘Check details and update site visit’ page triggers this
  email.

### Site visit unaccompanied to access required appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-unaccompanied-to-access-required-appellant](../appeals/api/src/server/notify/templates/site-visit-change-unaccompanied-to-access-required-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-unaccompanied-to-access-required-appellant](../appeals/api/src/server/notify/templates/site-visit-change-unaccompanied-to-access-required-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from
  unaccompanied to access required. Confirming the change from the ‘Check details and update site visit’ page triggers
  this email.

### Site visit unaccompanied to accompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-unaccompanied-to-accompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-unaccompanied-to-accompanied-appellant.subject.md)
- **Notify Content Template:** [site-visit-change-unaccompanied-to-accompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-change-unaccompanied-to-accompanied-appellant.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from
  unaccompanied to accompanied. Confirming the change from the ‘Check details and update site visit’ page triggers this
  email.

### Site visit unaccompanied to accompanied lpa

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-change-unaccompanied-to-accompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-change-unaccompanied-to-accompanied-lpa.subject.md)
- **Notify Content Template:** [site-visit-change-unaccompanied-to-accompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-change-unaccompanied-to-accompanied-lpa.content.md)
- **Trigger:** A site visit is already set up and the CO edits the site visit to update the site visit type from
  unaccompanied to accompanied. Confirming the change from the ‘Check details and update site visit’ page triggers this
  email.

### Site visit access required appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-schedule-access-required-appellant](../appeals/api/src/server/notify/templates/site-visit-schedule-access-required-appellant.subject.md)
- **Notify Content Template:** [site-visit-schedule-access-required-appellant](../appeals/api/src/server/notify/templates/site-visit-schedule-access-required-appellant.content.md)
- **Trigger:** A site visit is not set up and the CO sets up an access required site visit. Confirming the change from
  the ‘Check details and set up site visit’ page triggers this email.

### Site visit accompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-schedule-accompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-schedule-accompanied-appellant.subject.md)
- **Notify Content Template:** [site-visit-schedule-accompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-schedule-accompanied-appellant.content.md)
- **Trigger:** A site visit is not set up and the CO sets up an accompanied site visit. Confirming the change from the
  ‘Check details and set up site visit’ page triggers this email.

### Site visit accompanied lpa

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-schedule-accompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-schedule-accompanied-lpa.subject.md)
- **Notify Content Template:** [site-visit-schedule-accompanied-lpa](../appeals/api/src/server/notify/templates/site-visit-schedule-accompanied-lpa.content.md)
- **Trigger:** A site visit is not set up and the CO sets up an accompanied site visit. Confirming the change from the
  ‘Check details and set up site visit’ page triggers this email.

### Site visit unaccompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-schedule-unaccompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-schedule-unaccompanied-appellant.subject.md)
- **Notify Content Template:** [site-visit-schedule-unaccompanied-appellant](../appeals/api/src/server/notify/templates/site-visit-schedule-unaccompanied-appellant.content.md)
- **Trigger:** A site visit is not set up and the CO sets up an unaccompanied site visit. Confirming the change from the
  ‘Check details and set up site visit’ page triggers this email.

### Site visit cancellation

- **Appeal type:** all
- **Notify Subject Template:** [site-visit-cancelled](../appeals/api/src/server/notify/templates/site-visit-cancelled.subject.md)
- **Notify Content Template:** [site-visit-cancelled](../appeals/api/src/server/notify/templates/site-visit-cancelled.content.md)
- **Trigger:** The CO cancels the site visit. Confirming from the 'Confirm that you want to cancel the site visit' page
  using the 'Cancel site visit' button triggers this email.

### Missed site visit appellant

- **Appeal type:** all
- **Notify Subject Template:** [record-missed-site-visit-appellant](../appeals/api/src/server/notify/templates/record-missed-site-visit-appellant.subject.md)
- **Notify Content Template:** [record-missed-site-visit-appellant](../appeals/api/src/server/notify/templates/record-missed-site-visit-appellant.content.md)
- **Trigger:** The CO records that the site visit has been missed by the appellant. Confirming from the 'Check details
  and record missed site visit' page using the 'Record missed site visit' button triggers this email.

### Missed site visit LPA

- **Appeal type:** all
- **Notify Subject Template:** [record-missed-site-visit-lpa](../appeals/api/src/server/notify/templates/record-missed-site-visit-lpa.subject.md)
- **Notify Content Template:** [record-missed-site-visit-lpa](../appeals/api/src/server/notify/templates/record-missed-site-visit-lpa.content.md)
- **Trigger:** The CO records that the site visit has been missed by the LPA. Confirming from the 'Check details and
  record missed site visit' page using the 'Record missed site visit' button triggers this email.

### Rearrange missed site visit to unaccompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [missed-site-visit-rearranged-unaccompanied-appellant](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-unaccompanied-appellant.subject.md)
- **Notify Content Template:** [missed-site-visit-rearranged-unaccompanied-appellant](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-unaccompanied-appellant.content.md)
- **Trigger:** Having had a site visit cancelled (of any type) when a new unaccompanied site visit is set up this email
  is sent. Confirming on the 'Schedule site visit' page triggers this email.

### Rearrange missed site visit appellant

- **Appeal type:** all
- **Notify Subject Template:** [missed-site-visit-rearranged-appellant](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-appellant.subject.md)
- **Notify Content Template:** [missed-site-visit-rearranged-appellant](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-appellant.content.md)
- **Trigger:** Having had a site visit cancelled (of any type) when a new access required or accompanied site visit is
  set up this email is sent. Confirming on the 'Schedule site visit' page triggers this email.

### Rearrange missed site visit LPA

- **Appeal type:** all
- **Notify Subject Template:** [missed-site-visit-rearranged-lpa](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-lpa.subject.md)
- **Notify Content Template:** [missed-site-visit-rearranged-lpa](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-lpa.content.md)
- **Trigger:** Having had a site visit cancelled (of any type) when a new accompanied site visit is set up this email is
  sent. Confirming on the 'Schedule site visit' page triggers this email.

### Rearrange missed site visit unaccompanied appellant

- **Appeal type:** all
- **Notify Subject Template:** [missed-site-visit-rearranged-unaccompanied-appellant](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-unaccompanied-appellant.subject.md)
- **Notify Content Template:** [missed-site-visit-rearranged-unaccompanied-appellant](../appeals/api/src/server/notify/templates/missed-site-visit-rearranged-unaccompanied-appellant.content.md)
- **Trigger:** Having had a site visit cancelled (of any type) when a new unaccompanied site visit is
  set up this email is sent. Confirming on the 'Schedule site visit' page triggers this email.

## Hearing

### Hearing set up

- **Appeal type:**
- **Notify Subject Template:** [hearing-set-up](../appeals/api/src/server/notify/templates/hearing-set-up.subject.md)
- **Notify Content Template:** [hearing-set-up](../appeals/api/src/server/notify/templates/hearing-set-up.content.md)
- **GOV notify template:** [Hearing added - GOV.UK Notify](https://www.notifications.service.gov.uk/services/c46d894e-d10e-4c46-a467-019576cd906a/templates/87a30e0b-defb-43c4-a98c-859b0e4c161a)
- **Trigger:**

### Hearing updated

- **Appeal type:**
- **Notify Subject Template:** [hearing-updated](../appeals/api/src/server/notify/templates/hearing-updated.subject.md)
- **Notify Content Template:** [hearing-updated](../appeals/api/src/server/notify/templates/hearing-updated.content.md)
- **GOV notify template:** [Hearing updated - GOV.UK Notify](https://www.notifications.service.gov.uk/services/c46d894e-d10e-4c46-a467-019576cd906a/templates/384575ce-e532-4336-baee-fc9d13d2f03b)
- **Trigger:**

### Hearing cancelled

- **Appeal type:**
- **Notify Subject Template:** [hearing-cancelled](../appeals/api/src/server/notify/templates/hearing-cancelled.subject.md)
- **Notify Content Template:** [hearing-cancelled](../appeals/api/src/server/notify/templates/hearing-cancelled.content.md)
- **Trigger:**

## Inquiry

### Inquiry set up

- **Appeal type:**
- **Notify Subject Template:** [inquiry-set-up](../appeals/api/src/server/notify/templates/inquiry-set-up.subject.md)
- **Notify Content Template:** [inquiry-set-up](../appeals/api/src/server/notify/templates/inquiry-set-up.content.md)
- **Trigger:**

### Inquiry updated

- **Appeal type:**
- **Notify Subject Template:** [inquiry-updated](../appeals/api/src/server/notify/templates/inquiry-updated.subject.md)
- **Notify Content Template:** [inquiry-updated](../appeals/api/src/server/notify/templates/inquiry-updated.content.md)
- **Trigger:**

### Inquiry cancelled

- **Appeal type:**
- **Notify Subject Template:** [inquiry-cancelled](../appeals/api/src/server/notify/templates/inquiry-cancelled.subject.md)
- **Notify Content Template:** [inquiry-cancelled](../appeals/api/src/server/notify/templates/inquiry-cancelled.content.md)
- **Trigger:**

## Final comments

### Final comments done appellant

- **Appeal type:** s78, s20
- **Notify Subject Template:** [final-comments-done-appellant](../appeals/api/src/server/notify/templates/final-comments-done-appellant.subject.md)
- **Notify Content Template:** [final-comments-done-appellant](../appeals/api/src/server/notify/templates/final-comments-done-appellant.content.md)
- **Trigger:** Review final comments and mark as accepted and continue

### Final comments done lpa

- **Appeal type:** s78, s20
- **Notify Subject Template:** [final-comments-done-lpa](../appeals/api/src/server/notify/templates/final-comments-done-lpa.subject.md)
- **Notify Content Template:** [final-comments-done-lpa](../appeals/api/src/server/notify/templates/final-comments-done-lpa.content.md)
- **Trigger:** Review final comments and mark as accepted and continue

### Final comment rejected appellant

- **Appeal type:** s78, s20
- **Notify Subject Template:** [final-comment-rejected-appellant](../appeals/api/src/server/notify/templates/final-comment-rejected-appellant.subject.md)
- **Notify Content Template:** [final-comment-rejected-appellant](../appeals/api/src/server/notify/templates/final-comment-rejected-appellant.content.md)
- **Trigger:** Review final comments and mark as rejected, add some reasons and continue
-

### Final comment rejected lpa

- **Appeal type:** s78, s20
- **Notify Subject Template:** [final-comment-rejected-lpa](../appeals/api/src/server/notify/templates/final-comment-rejected-lpa.subject.md)
- **Notify Content Template:** [final-comment-rejected-lpa](../appeals/api/src/server/notify/templates/final-comment-rejected-lpa.content.md)
- **Trigger:** Review final comments and mark as rejected, add some reasons and continue

### Final comments none

- **Appeal type:**
- **Notify Subject Template:** [final-comments-none](../appeals/api/src/server/notify/templates/final-comments-none.subject.md)
- **Notify Content Template:** [final-comments-none](../appeals/api/src/server/notify/templates/final-comments-none.content.md)
- **Trigger:**

## Decision

### Decision is (allowed, split, or dismissed) appellant

- **Appeal type:** all
- **Notify Subject Template:** [decision-is-allowed-split-dismissed-appellant](../appeals/api/src/server/notify/templates/decision-is-allowed-split-dismissed-appellant.subject.md)
- **Notify Content Template:** [decision-is-allowed-split-dismissed-appellant](../appeals/api/src/server/notify/templates/decision-is-allowed-split-dismissed-appellant.content.md)
- **Trigger:** Issue decision and select allowed, split, or dismissed and continue

### Decision is (allowed, split, or dismissed) lpa

- **Appeal type:** all
- **Notify Subject Template:** [decision-is-allowed-split-dismissed-lpa](../appeals/api/src/server/notify/templates/decision-is-allowed-split-dismissed-lpa.subject.md)
- **Notify Content Template:** [decision-is-allowed-split-dismissed-lpa](../appeals/api/src/server/notify/templates/decision-is-allowed-split-dismissed-lpa.content.md)
- **Trigger:** Issue decision and select allowed, split, or dismissed and continue

### Decision is (allowed, split, or dismissed) interested party

- **Appeal type:** all
- **Notify Subject Template:** [decision-is-allowed-split-dismissed-interested-party](../appeals/api/src/server/notify/templates/decision-is-allowed-split-dismissed-interested-party.subject.md)
- **Notify Content Template:** [decision-is-allowed-split-dismissed-interested-party](../appeals/api/src/server/notify/templates/decision-is-allowed-split-dismissed-interested-party.content.md)
- **Trigger:** Issue decision and select allowed, split, or dismissed and continue

### Decision is invalid appellant

- **Appeal type:** all
- **Notify Subject Template:** [decision-is-invalid-appellant](../appeals/api/src/server/notify/templates/decision-is-invalid-appellant.subject.md)
- **Notify Content Template:** [decision-is-invalid-appellant](../appeals/api/src/server/notify/templates/decision-is-invalid-appellant.content.md)
- **Trigger:** Issue decision and select invalid and continue

### Decision is invalid lpa

- **Appeal type:** all
- **Notify Subject Template:** [decision-is-invalid-lpa](../appeals/api/src/server/notify/templates/decision-is-invalid-lpa.subject.md)
- **Notify Content Template:** [decision-is-invalid-lpa](../appeals/api/src/server/notify/templates/decision-is-invalid-lpa.content.md)
- **Trigger:** Issue decision and select invalid and continue

### Decision is invalid interested party

- **Appeal type:** all
- **Notify Subject Template:** [decision-is-invalid-interested-party](../appeals/api/src/server/notify/templates/decision-is-invalid-interested-party.subject.md)
- **Notify Content Template:** [decision-is-invalid-interested-party](../appeals/api/src/server/notify/templates/decision-is-invalid-interested-party.content.md)
- **Trigger:** Issue decision and select invalid and continue

### Appellant costs decision - appellant

- **Appeal type:**
- **Notify Subject Template:** [appellant-costs-decision-appellant](../appeals/api/src/server/notify/templates/appellant-costs-decision-appellant.subject.md)
- **Notify Content Template:** [appellant-costs-decision-appellant](../appeals/api/src/server/notify/templates/appellant-costs-decision-appellant.content.md)
- **Trigger:**

### Appellant costs decision - lpa

- **Appeal type:**
- **Notify Subject Template:** [appellant-costs-decision-lpa](../appeals/api/src/server/notify/templates/appellant-costs-decision-lpa.subject.md)
- **Notify Content Template:** [appellant-costs-decision-lpa](../appeals/api/src/server/notify/templates/appellant-costs-decision-lpa.content.md)
- **Trigger:**

### LPA costs decision - appellant

- **Appeal type:**
- **Notify Subject Template:** [lpa-costs-decision-appellant](../appeals/api/src/server/notify/templates/lpa-costs-decision-appellant.subject.md)
- **Notify Content Template:** [lpa-costs-decision-appellant](../appeals/api/src/server/notify/templates/lpa-costs-decision-appellant.content.md)
- **Trigger:**

### LPA costs decision - lpa

- **Appeal type:**
- **Notify Subject Template:** [lpa-costs-decision-lpa](../appeals/api/src/server/notify/templates/lpa-costs-decision-lpa.subject.md)
- **Notify Content Template:** [lpa-costs-decision-lpa](../appeals/api/src/server/notify/templates/lpa-costs-decision-lpa.content.md)
- **Trigger:**

### Correction notice decision - appellant

- **Appeal type:**
- **Notify Subject Template:** [correction-notice-decision-appellant](../appeals/api/src/server/notify/templates/correction-notice-decision-appellant.subject.md)
- **Notify Content Template:** [correction-notice-decision-appellant](../appeals/api/src/server/notify/templates/correction-notice-decision-appellant.content.md)
- **Trigger:**

### Correction notice decision - lpa

- **Appeal type:**
- **Notify Subject Template:** [correction-notice-decision-lpa](../appeals/api/src/server/notify/templates/correction-notice-decision-lpa.subject.md)
- **Notify Content Template:** [correction-notice-decision-lpa](../appeals/api/src/server/notify/templates/correction-notice-decision-lpa.content.md)
- **Trigger:**

### Correction notice decision - IP

- **Appeal type:**
- **Notify Subject Template:** [correction-notice-decision-interested-party](../appeals/api/src/server/notify/templates/correction-notice-decision-interested-party.subject.md)
- **Notify Content Template:** [correction-notice-decision-interested-party](../appeals/api/src/server/notify/templates/correction-notice-decision-interested-party.content.md)
- **Trigger:**

## Rule 6 Party

### Rule 6 Party admitted - Rule 6 party

- **Appeal type:** Inquiry
- **Notify Subject Template:** [rule-6-status-accepted-rule-6-party](../appeals/api/src/server/notify/templates/rule-6-status-accepted-rule-6-party.subject.md)
- **Notify Content Template:** [rule-6-status-accepted-rule-6-party](../appeals/api/src/server/notify/templates/rule-6-status-accepted-rule-6-party.content.md)
- **Trigger:** Added a Rule 6 party to the appeal

### Rule 6 Party admitted - Main parties

- **Appeal type:** Inquiry
- **Notify Subject Template:** [rule-6-status-accepted-main-parties](../appeals/api/src/server/notify/templates/rule-6-status-accepted-main-parties.subject.md)
- **Notify Content Template:** [rule-6-status-accepted-main-parties](../appeals/api/src/server/notify/templates/rule-6-status-accepted-main-parties.content.md)
- **Trigger:** Added a Rule 6 party to the appeal

### Rule 6 Party updated

- **Appeal type:** Inquiry
- **Notify Subject Template:** [rule-6-party-updated](../appeals/api/src/server/notify/templates/rule-6-party-updated.subject.md)
- **Notify Content Template:** [rule-6-party-updated](../appeals/api/src/server/notify/templates/rule-6-party-updated.content.md)
- **Trigger:** Updated Rule 6 party details

## Linked appeals

### Link appeal

- **Appeal type:**
- **Notify Subject Template:** [link-appeal](../appeals/api/src/server/notify/templates/link-appeal.subject.md)
- **Notify Content Template:** [link-appeal](../appeals/api/src/server/notify/templates/link-appeal.content.md)
- **Trigger:**

### Link appeal additional appellants

- **Appeal type:**
- **Notify Subject Template:** [link-appeal-additional-appellants](../appeals/api/src/server/notify/templates/link-appeal-additional-appellants.subject.md)
- **Notify Content Template:** [link-appeal-additional-appellants](../appeals/api/src/server/notify/templates/link-appeal-additional-appellants.content.md)
- **Trigger:**

## Shared cost

### Shared cost application

- **Appeal type:**
- **Notify Subject Template:** [shared-cost-application](../appeals/api/src/server/notify/templates/shared-cost-application.subject.md)
- **Notify Content Template:** [shared-cost-application](../appeals/api/src/server/notify/templates/shared-cost-application.content.md)
- **Trigger:**

### Shared cost application comment

- **Appeal type:**
- **Notify Subject Template:** [shared-cost-application-comment](../appeals/api/src/server/notify/templates/shared-cost-application-comment.subject.md)
- **Notify Content Template:** [shared-cost-application-comment](../appeals/api/src/server/notify/templates/shared-cost-application-comment.content.md)
- **Trigger:**

### Shared cost application withdrawal

- **Appeal type:**
- **Notify Subject Template:** [shared-cost-application-withdrawal](../appeals/api/src/server/notify/templates/shared-cost-application-withdrawal.subject.md)
- **Notify Content Template:** [shared-cost-application-withdrawal](../appeals/api/src/server/notify/templates/shared-cost-application-withdrawal.content.md)
- **Trigger:**
