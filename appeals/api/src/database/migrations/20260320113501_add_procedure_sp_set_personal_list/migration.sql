-- Populates the PersonalList for all appeals or a specific one.
CREATE OR ALTER PROCEDURE dbo.spSetPersonalList
(
	@appealId                       AS INT = NULL
)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @STATE_TARGET_READY_TO_START INT = 5,
		@STATE_TARGET_5_BUSINESS_DAYS INT = 5,
		@STATE_TARGET_LPA_QUESTIONNAIRE_DUE INT = 10,
		@STATE_TARGET_ASSIGN_CASE_OFFICER INT = 15,
		@STATE_TARGET_ISSUE_DETERMINATION INT = 30,
		@STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT INT = 40,
		@STATE_TARGET_STATEMENT_REVIEW INT = 55,
		@STATE_TARGET_FINAL_COMMENT_REVIEW INT = 60;

	-- get the Appeal Type Ids
	DECLARE @APPEAL_TYPE_S78 INT = (SELECT id FROM AppealType WHERE type='Planning appeal');	-- abbrev: W
	DECLARE @APPEAL_TYPE_PLANNED_LISTED_BUILDING INT = (SELECT id FROM AppealType WHERE type='Planning listed building and conservation area appeal');		-- abbrev: Y
	DECLARE @APPEAL_TYPE_ENFORCEMENT INT = (SELECT id FROM AppealType WHERE type='Enforcement notice appeal');	-- abbrev: C

	DECLARE @parentId INT = NULL;

	-- case status constants
	DECLARE @STATUS_ASSIGN_CASE_OFFICER NVARCHAR(1000) = 'assign_case_officer',
		@STATUS_AWAITING_EVENT NVARCHAR(1000) = 'awaiting_event',
		@STATUS_AWAITING_TRANSFER NVARCHAR(1000) = 'awaiting_transfer',
		@STATUS_COMPLETE NVARCHAR(1000) = 'complete',
		@STATUS_EVENT NVARCHAR(1000) = 'event',
		@STATUS_EVIDENCE NVARCHAR(1000) = 'evidence',
		@STATUS_FINAL_COMMENTS NVARCHAR(1000) = 'final_comments',
		@STATUS_INVALID NVARCHAR(1000) = 'invalid',
		@STATUS_ISSUE_DETERMINATION NVARCHAR(1000) = 'issue_determination',
		@STATUS_LPA_QUESTIONNAIRE NVARCHAR(1000) = 'lpa_questionnaire',
		@STATUS_READY_TO_START NVARCHAR(1000) = 'ready_to_start',
		@STATUS_STATEMENTS NVARCHAR(1000) = 'statements',
		@STATUS_TRANSFERRED NVARCHAR(1000) = 'transferred',
		@STATUS_VALIDATION NVARCHAR(1000) = 'validation',
		@STATUS_WITHDRAWN NVARCHAR(1000) = 'withdrawn';


	-- Create temp table to store the data we need to create the personal list table
	CREATE TABLE #personal
	(
		appealId                            INT             NOT NULL,
		parentAppealId                      INT             NULL,
		caseCreatedDate                     DATETIME2       NOT NULL,
		caseExtensionDate                   DATETIME2       NULL,
		appealTypeId					  	INT             NULL,

		-- AppealStatus
		status                              NVARCHAR(1000)  NULL,
		statusCreatedAt                     DATETIME2       NULL,

		-- Flags
		completeOrWithdrawn                 BIT             NOT NULL    DEFAULT 0,
		isParentAppeal                      BIT             NOT NULL    DEFAULT 0,
		isChildAppeal                       BIT             NOT NULL    DEFAULT 0,

		-- Due Date
		dueDate                             DATETIME2       NULL,

		-- appellantCase
		appellantCaseValidationOutcomeName  BIT             NOT NULL        DEFAULT 0,
		numberOfResidencesNetChange         INT             NOT NULL        DEFAULT 0,

		-- appealTimetable
		lpaQuestionnaireDueDate             DATETIME2       NULL,
		ipCommentsDueDate                   DATETIME2       NULL,
		lpaStatementDueDate                 DATETIME2       NULL,
		appellantStatementDueDate           DATETIME2       NULL,
		proofOfEvidenceAndWitnessesDueDate  DATETIME2       NULL,
		finalCommentsDueDate                DATETIME2       NULL,

		-- procedureType
		procedureTypeKey                    NVARCHAR(1000)  NULL,

		-- hearing
		hearingStartTime                    DATETIME2       NULL,

		-- inquiry
		inquiryStartTime                    DATETIME2       NULL,
		estimatedDays                       INT             NULL,

		-- SiteVisit
		siteVisitEndTime                    DATETIME2       NULL,
		siteVisitDate                       DATETIME2       NULL,

		-- Enforcement only
		groundAFeeReceiptDueDate			DATETIME2		NULL,

		-- Costs
		appellantCostsApplication           INT             NOT NULL      DEFAULT(0),
		appellantCostsWithdrawal            INT             NOT NULL      DEFAULT(0),
		lpaCostsApplication                 INT             NOT NULL      DEFAULT(0),
		lpaCostsWithdrawal                  INT             NOT NULL      DEFAULT(0),
		lpaCostsDecisionLetter              INT             NOT NULL      DEFAULT(0),

		awaitingLpaCostsDecision            BIT             NOT NULL      DEFAULT(0),
		awaitingAppellantCostsDecision      BIT             NOT NULL      DEFAULT(0),

		appellantCostsDecisionLetter        INT             NOT NULL      DEFAULT(0),

		PRIMARY KEY (appealId)
	);

	IF @appealId IS NULL
		BEGIN
			-- Insert the appeals
			INSERT INTO #personal (appealId, caseCreatedDate, caseExtensionDate, procedureTypeKey, appealTypeId )
			SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key], ap.appealTypeId
			FROM    Appeal ap
						LEFT OUTER JOIN ProcedureType pt ON ap.procedureTypeId = pt.id;
		END
	ELSE
		BEGIN
			-- Change: the procedure now accepts Appeal.id directly, so linked lookups use parentId/childId instead of parentRef/childRef.
			-- only get type linked appeals (not related)
			SELECT  @parentId = parentId FROM AppealRelationship WHERE (parentId = @appealId OR childId = @appealId)
			                                                       AND type = 'linked';

			IF @parentId IS NULL
				BEGIN
					-- Change: if the appeal is not linked, refresh just the standalone appeal that matches the supplied appeal id.
					INSERT INTO #personal (appealId, caseCreatedDate, caseExtensionDate, procedureTypeKey, appealTypeId )
					SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key], ap.appealTypeId
					FROM    Appeal ap
								LEFT OUTER JOIN ProcedureType pt ON ap.procedureTypeId = pt.id
					WHERE   ap.id = @appealId;
				END
			ELSE
				BEGIN
					-- Existing linked behaviour: refresh the parent appeal and all children in that linked set, keyed by Appeal.id.
					INSERT INTO #personal (appealId, caseCreatedDate, caseExtensionDate, procedureTypeKey, appealTypeId )
					SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key], ap.appealTypeId
					FROM    Appeal ap
								LEFT OUTER JOIN ProcedureType pt ON ap.procedureTypeId = pt.id
					WHERE   ap.id = @parentId
					UNION ALL
					SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key], ap.appealTypeId
					FROM    Appeal ap
								LEFT OUTER JOIN ProcedureType pt ON ap.procedureTypeId = pt.id
						        INNER JOIN AppealRelationship ar ON ap.id = ar.childId AND parentId = @parentId;
				END
		END;

	-- Add the appeal statuses to the temp table
	UPDATE  #personal
	SET     status = st.status,
	        statusCreatedAt = st.createdAt
	FROM    #personal p
				INNER JOIN AppealStatus st ON p.appealId = st.appealId AND valid = 1;

	-- Set the complete / withdrawn flag
	UPDATE  #personal
	SET     completeOrWithdrawn = CASE WHEN status = @STATUS_COMPLETE OR status = @STATUS_WITHDRAWN THEN 1 ELSE 0 END;

	-- Set the linked appeal flags
	UPDATE  #personal
	SET     parentAppealId = art.parentAppealId,
	        isParentAppeal = art.parentAppeal,
	        isChildAppeal = art.childAppeal
	FROM    #personal p
				INNER JOIN (
		SELECT DISTINCT p.appealId,
		                CASE WHEN p.appealId = ar.parentId THEN 1 ELSE 0 END as parentAppeal,
		                CASE WHEN p.appealId = ar.childId THEN 1 ELSE 0 END AS childAppeal,
		                CASE WHEN p.appealId = ar.childId THEN ar.parentId ELSE ar.parentId END AS parentAppealId
		FROM    AppealRelationship ar
					INNER JOIN #personal p ON p.appealId = ar.parentId OR p.appealId = ar.childId
		WHERE   ar.type = 'linked'
	) art ON  p.appealId = art.appealId;

	-- Timetables
	UPDATE  #personal
	SET     lpaQuestionnaireDueDate             = tm.lpaQuestionnaireDueDate,
	        ipCommentsDueDate                   = tm.ipCommentsDueDate,
	        appellantStatementDueDate           = tm.appellantStatementDueDate,
	        proofOfEvidenceAndWitnessesDueDate  = tm.proofOfEvidenceAndWitnessesDueDate,
	        finalCommentsDueDate                = tm.finalCommentsDueDate,
	        lpaStatementDueDate					= tm.lpaStatementDueDate
	FROM    #personal p
				INNER JOIN AppealTimetable tm ON p.appealId = tm.appealId;

	-- AppellantCase
	UPDATE  #personal
	SET     appellantCaseValidationOutcomeName  = 1,
	        numberOfResidencesNetChange = ISNULL(ac.numberOfResidencesNetChange, 0)
	FROM    #personal p
				INNER JOIN AppellantCase ac ON p.appealId = ac.appealId
		        INNER JOIN appellantCaseValidationOutcome acvo  ON      ac.appellantCaseValidationOutcomeId = acvo.id
		AND     acvo.name = 'invalid';

	-- SiteVisit
	UPDATE  #personal
	SET     siteVisitEndTime             = sv.visitEndTime,
	        siteVisitDate                = sv.visitDate
	FROM    #personal p
				INNER JOIN SiteVisit sv ON p.appealId = sv.appealId;

	-- Hearing
	UPDATE  #personal
	SET     hearingStartTime             = h.hearingStartTime
	FROM    #personal p
				INNER JOIN Hearing h ON p.appealId = h.appealId;

	-- Inquiry
	UPDATE  #personal
	SET     inquiryStartTime             = i.inquiryStartTime,
	        estimatedDays                = i.estimatedDays
	FROM    #personal p
				INNER JOIN Inquiry i ON p.appealId = i.appealId;


	-- Enforcement only - ground A Due Date
	UPDATE  #personal
	SET     groundAFeeReceiptDueDate     = enao.groundAFeeReceiptDueDate
	FROM    #personal p
				INNER JOIN EnforcementNoticeAppealOutcome enao ON enao.appealId = p.appealId
	WHERE enao.groundAFeeReceiptDueDate IS NOT NULL
	;

	-- COSTS
	-- Note: Use conditional aggregation inside the subquery so there is exactly one row per caseId with 6 separate columns:
	--		 This avoids the JOIN table to multiple rows in a SQL Server UPDATE, only one of the matching rows is applied (the "last one wins" — but which row is picked is non-deterministic).
	--		 This method ensures that all 6 values correctly get totalled
	UPDATE  #personal
	SET     appellantCostsApplication    = appellantCostsApplication    + fd.ctr_appellantCostsApplication,
	        appellantCostsWithdrawal     = appellantCostsWithdrawal     + fd.ctr_appellantCostsWithdrawal,
	        lpaCostsApplication          = lpaCostsApplication          + fd.ctr_lpaCostsApplication,
	        lpaCostsWithdrawal           = lpaCostsWithdrawal           + fd.ctr_lpaCostsWithdrawal,
	        appellantCostsDecisionLetter = appellantCostsDecisionLetter + fd.ctr_appellantCostsDecisionLetter,
	        lpaCostsDecisionLetter       = lpaCostsDecisionLetter       + fd.ctr_lpaCostsDecisionLetter
	FROM    #personal p
				INNER JOIN (
		SELECT  f.caseId,
		        SUM(CASE WHEN f.path = 'costs/appellantCostsApplication'    THEN dc.documentCount ELSE 0 END) AS ctr_appellantCostsApplication,
		        SUM(CASE WHEN f.path = 'costs/appellantCostsWithdrawal'     THEN dc.documentCount ELSE 0 END) AS ctr_appellantCostsWithdrawal,
		        SUM(CASE WHEN f.path = 'costs/lpaCostsApplication'          THEN dc.documentCount ELSE 0 END) AS ctr_lpaCostsApplication,
		        SUM(CASE WHEN f.path = 'costs/lpaCostsWithdrawal'           THEN dc.documentCount ELSE 0 END) AS ctr_lpaCostsWithdrawal,
		        SUM(CASE WHEN f.path = 'costs/appellantCostsDecisionLetter' THEN dc.documentCount ELSE 0 END) AS ctr_appellantCostsDecisionLetter,
		        SUM(CASE WHEN f.path = 'costs/lpaCostsDecisionLetter'       THEN dc.documentCount ELSE 0 END) AS ctr_lpaCostsDecisionLetter
		FROM    Folder AS f
					LEFT JOIN (
			SELECT  folderId, COUNT(guid) AS documentCount
			FROM    Document
			WHERE   isDeleted = 0
			GROUP BY folderId
		) dc ON dc.folderId = f.id
		WHERE   f.path LIKE 'costs/%'
		GROUP BY f.caseId
	) fd ON p.appealId = fd.caseId;

	UPDATE  #personal
	SET     awaitingAppellantCostsDecision = CASE WHEN appellantCostsDecisionLetter = 0 AND appellantCostsApplication > appellantCostsWithdrawal THEN 1 ELSE 0 END,
	        awaitingLpaCostsDecision       = CASE WHEN lpaCostsDecisionLetter = 0 AND lpaCostsApplication > lpaCostsWithdrawal THEN 1 ELSE 0 END;

	--
	-- CalculateDueDate
	--

	-- ready to start
	UPDATE  #personal
	SET     dueDate = CASE  WHEN appellantCaseValidationOutcomeName = 1 AND caseExtensionDate IS NOT NULL
								THEN caseExtensionDate
	                        ELSE DATEADD(day, @STATE_TARGET_READY_TO_START, caseCreatedDate) END
	WHERE   status = @STATUS_READY_TO_START;

	-- lpa questionnaire
	UPDATE  #personal
	SET     dueDate = CASE  WHEN lpaQuestionnaireDueDate IS NOT NULL
								THEN lpaQuestionnaireDueDate
	                        ELSE DATEADD(day, @STATE_TARGET_LPA_QUESTIONNAIRE_DUE, caseCreatedDate) END
	WHERE   status = @STATUS_LPA_QUESTIONNAIRE;

	-- assign case officer
	UPDATE  #personal
	SET     dueDate = DATEADD(day, @STATE_TARGET_ASSIGN_CASE_OFFICER, caseCreatedDate)
	WHERE   status = @STATUS_ASSIGN_CASE_OFFICER;

	-- validation
	UPDATE  #personal
	SET     dueDate = CASE	WHEN appealTypeId = @APPEAL_TYPE_ENFORCEMENT AND groundAFeeReceiptDueDate IS NOT NULL AND caseExtensionDate IS NOT NULL THEN
								  CASE WHEN groundAFeeReceiptDueDate < caseExtensionDate THEN groundAFeeReceiptDueDate ELSE caseExtensionDate END
	                          WHEN caseExtensionDate IS NULL THEN caseCreatedDate
	                          ELSE caseExtensionDate END
	WHERE   status = @STATUS_VALIDATION;


	-- IssueDetermination
	-- Note that businessDate is a date field with no time element, so we need to add the time part from the relevant visit date
	UPDATE  #personal
	SET     dueDate = CASE  WHEN siteVisitDate IS NOT NULL AND siteVisitEndTime IS NOT NULL THEN (
		SELECT DATEADD(MILLISECOND, DATEDIFF(MILLISECOND, CAST(CAST(siteVisitEndTime AS DATE) AS DATETIME2), siteVisitEndTime), CAST(businessDate AS DATETIME2))
		FROM NextBusinessDate
		WHERE currentDate = CONVERT(DATE, siteVisitEndTime) AND noBusinessDays = @STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT
	)
	                        WHEN siteVisitDate IS NOT NULL THEN (
								SELECT DATEADD(MILLISECOND, DATEDIFF(MILLISECOND, CAST(CAST(siteVisitDate AS DATE) AS DATETIME2), siteVisitDate), CAST(businessDate AS DATETIME2))
		                        FROM NextBusinessDate
		                        WHERE currentDate = CONVERT(DATE, siteVisitDate) AND noBusinessDays = @STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT
							)
	                        ELSE (
								SELECT DATEADD(MILLISECOND, DATEDIFF(MILLISECOND, CAST(CAST(caseCreatedDate AS DATE) AS DATETIME2), caseCreatedDate), CAST(businessDate AS DATETIME2))
		                        FROM NextBusinessDate
		                        WHERE currentDate = CONVERT(DATE, caseCreatedDate) AND noBusinessDays = @STATE_TARGET_ISSUE_DETERMINATION
							)
		END
	WHERE   status = @STATUS_ISSUE_DETERMINATION;


	-- Complete
	-- Note that businessDate is a date field with no time element, so we need to add the time part from the statusCreatedAt date
	UPDATE  #personal
	SET     dueDate = CASE  WHEN awaitingAppellantCostsDecision =1 OR awaitingLpaCostsDecision =1 THEN (
		SELECT DATEADD(MILLISECOND, DATEDIFF(MILLISECOND, CAST(CAST(statusCreatedAt AS DATE) AS DATETIME2), statusCreatedAt), CAST(businessDate AS DATETIME2))
		FROM NextBusinessDate
		WHERE currentDate = CONVERT(DATE, statusCreatedAt) AND noBusinessDays = @STATE_TARGET_5_BUSINESS_DAYS )
	                        WHEN numberOfResidencesNetChange =0 AND appealTypeId IN (@APPEAL_TYPE_S78, @APPEAL_TYPE_PLANNED_LISTED_BUILDING) AND isChildAppeal = 0 THEN GETDATE()
	                        ELSE NULL
		END
	WHERE   status = @STATUS_COMPLETE;

	-- statements
	UPDATE  #personal
	SET     dueDate = CASE  WHEN lpaStatementDueDate IS NOT NULL AND ipCommentsDueDate IS NOT NULL AND lpaStatementDueDate < ipCommentsDueDate          THEN lpaStatementDueDate
	                        WHEN lpaStatementDueDate IS NOT NULL AND ipCommentsDueDate IS NOT NULL AND lpaStatementDueDate >= ipCommentsDueDate         THEN ipCommentsDueDate
	                        WHEN lpaStatementDueDate IS NOT NULL THEN lpaStatementDueDate
	                        WHEN ipCommentsDueDate IS NOT NULL THEN ipCommentsDueDate
	                        WHEN appellantStatementDueDate IS NOT NULL THEN appellantStatementDueDate
	                        ELSE DATEADD(day, @STATE_TARGET_STATEMENT_REVIEW, caseCreatedDate) END
	WHERE   status = @STATUS_STATEMENTS;

	-- evidence
	UPDATE  #personal
	SET     dueDate = CASE  WHEN proofOfEvidenceAndWitnessesDueDate IS NOT NULL THEN proofOfEvidenceAndWitnessesDueDate
	                        ELSE NULL END
	WHERE   status = @STATUS_EVIDENCE;

	-- final comments
	UPDATE  #personal
	SET     dueDate = CASE  WHEN finalCommentsDueDate IS NOT NULL
								THEN finalCommentsDueDate
	                        ELSE DATEADD(day, @STATE_TARGET_FINAL_COMMENT_REVIEW, caseCreatedDate) END
	WHERE   status = @STATUS_FINAL_COMMENTS;

	-- awaiting event
	UPDATE  #personal
	SET     dueDate = CASE  WHEN procedureTypeKey = 'hearing' THEN hearingStartTime
	                        WHEN procedureTypeKey = 'inquiry' THEN
								CASE WHEN inquiryStartTime IS NOT NULL THEN DATEADD(day, ISNULL(estimatedDays, 0), inquiryStartTime) END
	                        ELSE siteVisitDate END
	WHERE   status = @STATUS_AWAITING_EVENT;

	-- event
	UPDATE  #personal
	SET     dueDate = CASE  WHEN finalCommentsDueDate IS NOT NULL THEN finalCommentsDueDate
	                        WHEN lpaQuestionnaireDueDate IS NOT NULL THEN lpaQuestionnaireDueDate
	                        ELSE CAST('1970-01-01T00:00:00.000' AS datetime2) END
	WHERE   status = @STATUS_EVENT;

	-- awaiting transfer - add 5 business days
	UPDATE  #personal
	SET     dueDate = (SELECT DATEADD(MILLISECOND, DATEDIFF(MILLISECOND, CAST(CAST(statusCreatedAt AS DATE) AS DATETIME2), statusCreatedAt), CAST(businessDate AS DATETIME2))
	                   FROM NextBusinessDate
	                   WHERE currentDate = CONVERT(DATE, statusCreatedAt) AND noBusinessDays = @STATE_TARGET_5_BUSINESS_DAYS )
	WHERE   status = @STATUS_AWAITING_TRANSFER
	  AND     statusCreatedAt IS NOT NULL;

	-- withdrawn - add 5 business days
	UPDATE  #personal
	SET     dueDate = CASE  WHEN awaitingAppellantCostsDecision =1 OR awaitingLpaCostsDecision =1 THEN (
		SELECT DATEADD(MILLISECOND, DATEDIFF(MILLISECOND, CAST(CAST(statusCreatedAt AS DATE) AS DATETIME2), statusCreatedAt), CAST(businessDate AS DATETIME2))
		FROM NextBusinessDate
		WHERE currentDate = CONVERT(DATE, statusCreatedAt) AND noBusinessDays = @STATE_TARGET_5_BUSINESS_DAYS )
	                        ELSE NULL
		END
	WHERE   status = @STATUS_WITHDRAWN;

	-- Finally update the PersonalList table
	UPDATE  p1
	SET     dueDate = p2.dueDate
	FROM    #personal p1
				INNER JOIN #personal p2 ON p2.isParentAppeal = 1 AND p1.parentAppealId = p2.appealId;

	;WITH SourceData AS
		(
		SELECT	appealId,
		          CASE WHEN isParentAppeal = 1 THEN 'parent'
		               WHEN isChildAppeal = 1 THEN 'child'
		               ELSE NULL
					  END AS linkType,
		          parentAppealId AS leadAppealId,
		          duedate
		FROM	#personal
		)

		MERGE PersonalList AS target
	USING SourceData AS source
	ON target.appealId = source.appealId
	WHEN MATCHED THEN
		UPDATE SET
				   target.linkType     = source.linkType,
			       target.leadAppealId = source.leadAppealId,
			       target.dueDate      = source.dueDate
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (appealId, linkType, leadAppealId, dueDate)
		VALUES (source.appealId, source.linkType, source.leadAppealId, source.dueDate);

END;
