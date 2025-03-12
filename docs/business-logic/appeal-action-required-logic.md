# Appeal action required logic

This document provides a reference for the logic that the web application uses to determine required actions for appeals.

## Required actions

Required actions represent specific user actions which can be performed by the user based on the current status and other data within the appeal. Because each required action may map to one or more types of user prompt or call to action (such as important notification banners on the case details page, and action links in the personal list), they are abstract and not tied to a specific use case. Some examples to illustrate:

| RequiredAction        | Important notification banner (case details page) | Personal list action    |
| --------------------- | ------------------------------------------------- | ----------------------- |
| 'startAppeal'         | 'Appeal valid and ready to start'                 | 'Start case'            |
| 'reviewAppellantCase' | 'Ready for validation'                            | 'Review appellant case' |
| 'arrangeSiteVisit'    | 'Site visit ready to set up'                      | 'Set up site visit'     |

Required actions are defined as a union of strings in the `AppealRequiredAction` type definition, found in `appeals/web/src/server/lib/mappers/utils/required-actions.js`, alongside the `getRequiredActionsForAppeal` which returns a list of required actions for a given input.

## Notification banners

There are two main types of notification banners defined in the GDS notification banner component ((documented here)[https://design-system.service.gov.uk/components/notification-banner/]), "important" and "success". Both of these are used in the appeals back office service. Individual use-case-specific banners are defined in the `notificationBannerDefinitions` object in `appeals/web/src/server/lib/mappers/components/page-components/notification-banners.mapper.js`. Each is associated with a specific key, defined in the `NotificationBannerDefinitionKey` type definition in the same file.

### Success

Success banners are stored in the session, and are displayed once only to indicate a user action was performed successfully, and then removed. For example, when a case officer is added or changed:

1. Open case details page for an appeal in 'ASSIGN CASE OFFICER' status (or should also work for any non-closed status)
2. Scroll down and expand 'Team' accordion
3. Click 'Add/Change' link in the 'Case officer' row
4. Search for your user account's email address (or any valid service user email)
5. Click 'Choose' link next to the result item
6. On the 'Assign this case officer' page, select 'Yes' and click 'Continue'
7. When you are redirected to the case details page, observe 'Success: Case officer has been assigned' notification banner

Success banners are not related to required actions.

### Important

Important banners are generated on page load by mapping code, and are persistent, because they are used to make the user aware of important information based on the current state of a case (or information within it). For example, when an appeal is ready for a case officer to be assigned:

1. Open case details page for an appeal in 'ASSIGN CASE OFFICER' status
2. Observe the 'Important: Appeal ready to be assigned to case officer' banner

Important banners are primarily displayed on the case details page, but some types appear on other pages, such as the appellant case and LPA questionnaire (which display important banners when reviewed as 'incomplete'). Notification banners of this type are generated based on required actions. Case details page 'important' banners are mapped by the lib function `mapStatusDependentNotifications` found in `appeals/web/src/server/lib/mappers/utils/map-status-dependent-notifications.js`. `RequiredAction`s are mapped to `NotificationBannerDefinitionKey`s using the `appealActionRequiredToNotificationBannerMapping` object defined in `appeals/web/src/server/lib/mappers/components/page-components/notification-banners.mapper.js`.

## Personal list actions

The personal list (a.k.a. 'Cases assigned to you') is accessed via the 'Assigned to me' primary navigation link in the header, and shows a list of all cases assigned to the current user. Personal list actions are the links and/or labels displayed in the 'Action required' column. Like important banners, these are also generated based on required actions. For example:

1. Assign yourself as the case officer for an appeal in 'ASSIGN CASE OFFICER' status (see steps in previous 'Notification banners -> Success' section)
2. Click 'Assigned to me' primary nav link in the header
3. Observe row for the case on the 'Cases assigned to you' page, which should now be in 'validation' status
4. Observe 'Review appellant case' link in the 'Action required' column for the appeal

The function `mapActionLinksForAppeal` in `appeals/web/src/server/appeals/personal-list/personal-list.mapper.js` maps the required actions for each appeal to an HTML string containing the action links (or sometimes just text labels). The actions are defined inline, rather than in a dictionary object with typed keys like the notification banners, as they are only used in the personal list mapper.

## Required actions logic

The logic used to determine the required actions for a given appeal is contained in `appeals/web/src/server/lib/mappers/utils/required-actions.js`. The `getRequiredActionsForAppeal` function is responsible for performing the actual mapping, and is called from `appeals/web/src/server/lib/mappers/utils/map-status-dependent-notifications.js` (for case details page 'important' notification banners), and also from `appeals/web/src/server/appeals/personal-list/personal-list.mapper.js`. The following flowcharts illustrate the specifics of the business logic in the `getRequiredActionsForAppeal` function:

```mermaid
---
title: Required Actions Logic
---

flowchart LR
	subgraph 0 [Key]
		status([APPEAL_STATUS])
		decision{decision}
		requiredAction>required action]
	end
	subgraph 1 [ASSIGN_CASE_OFFICER]
		direction LR
		s1([ASSIGN_CASE_OFFICER])
		ra1>assignCaseOfficer]
		s1-->ra1
	end
	subgraph 2 [READY_TO_START]
		direction LR
		s2([READY_TO_START])
		ra2>assignCaseOfficer]
		s2-->ra2
	end
	subgraph 3 [AWAITING_TRANSFER]
		direction LR
		s3([AWAITING_TRANSFER])
		ra3>addHorizonReference]
		s3-->ra3
	end
	subgraph 4 [EVENT]
		direction LR
		s4([EVENT])
		ra4>arrangeSiteVisit]
		s4-->ra4
	end
	subgraph 5 [ISSUE_DETERMINATION]
		direction LR
		s5([ISSUE_DETERMINATION])
		ra5>issueDecision]
		s5-->ra5
	end
	subgraph 6 [VALIDATION]
		direction LR
		s6([VALIDATION])
		d6_0{appellant case due date passed?}
		d6_1{appellant case incomplete?}
		ra6_0>appellantCaseOverdue]
		ra6_1>awaitingAppellantUpdate]
		ra6_2>reviewAppellantCase]
		s6-->d6_0
		d6_0-- Yes -->ra6_0
		d6_0-- No -->d6_1
		d6_1-- Yes -->ra6_1
		d6_1-- No -->ra6_2
	end
	subgraph 7 [LPA_QUESTIONNAIRE]
		direction LR
		s7([LPA_QUESTIONNAIRE])
		d7_0{LPAQ received?}
		d7_1{LPAQ incomplete?}
		d7_2{LPAQ due date passed?}
		ra7_0>awaitingLpaUpdate]
		ra7_1>reviewLpaQuestionnaire]
		ra7_2>lpaQuestionnaireOverdue]
		ra7_3>awaitingLpaQuestionnaire]
		s7-->d7_0
		d7_0-- Yes -->d7_1
		d7_0-- No -->d7_2
		d7_1-- Yes -->ra7_0
		d7_1-- No -->ra7_1
		d7_2-- Yes -->ra7_2
		d7_2-- No -->ra7_3
	end
	subgraph 8 [STATEMENTS]
		direction LR
		s8([STATEMENTS])
		d8_0{IP comments due date passed?}
		d8_1{IP comments awaiting review?}
		d8_2{LPA statement due date passed?}
		d8_3{LPA statement received?}
		d8_4{LPA statement awaiting review?}
		d8_5{LPA statement incomplete?}
		d8_6{IP comments awaiting review?}
		d8_7{LPA statement awaiting review?}
		d8_8{IP comments or LPA statement to share?}
		ra8_0>reviewIpComments]
		ra8_1>awaitingIpComments]
		ra8_2>reviewLpaStatement]
		ra8_3>updateLpaStatement]
		ra8_4>awaitingLpaStatement]
		ra8_5>reviewIpComments]
		ra8_6>reviewLpaStatement]
		ra8_7>shareIpCommentsAndLpaStatement]
		ra8_8>progressFromStatements]
		s8-->d8_0
		d8_0-- Yes -->d8_2
		d8_0-- No -->d8_1
		d8_1-- Yes -->ra8_0
		d8_2-- Yes -->d8_6
		d8_2-- No -->d8_3
		d8_1-- No -->ra8_1
		d8_3-- Yes -->d8_4
		d8_3-- No -->ra8_4
		d8_4-- Yes -->ra8_2
		d8_4-- No -->d8_5
		d8_5-- Yes -->ra8_3
		d8_6-- Yes -->ra8_5
		ra8_5-- Yes -->d8_7
		d8_6-- No -->d8_7
		d8_7-- Yes -->ra8_6
		d8_7-- No -->d8_8
		d8_8-- Yes -->ra8_7
		d8_8-- No -->ra8_8
	end
	subgraph 9 [FINAL_COMMENTS]
		direction LR
		s9([FINAL_COMMENTS])
		d9_0{Appellant final comments awaiting review?}
		d9_1{LPA final comments awaiting review?}
		d9_2{Final comments due date passed?}
		d9_3{LPA final comments awaiting review?}
		d9_4{Any final comments to share?}
		ra9_0>reviewAppellantFinalComments]
		ra9_1>reviewLPAFinalComments]
		ra9_2>shareFinalComments]
		ra9_3>progressFromFinalComments]
		ra9_4>awaitingFinalComments]
		s9-->d9_0
		d9_0-- Yes -->ra9_0
		ra9_0-->d9_3
		d9_3-- Yes -->ra9_1
		d9_0-- No -->d9_1
		d9_1-- Yes -->ra9_1
		d9_1-- No -->d9_2
		d9_2-- Yes -->d9_4
		d9_2-- No --> ra9_4
		d9_4-- Yes -->ra9_2
		d9_4-- No -->ra9_3
	end
```
