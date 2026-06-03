-- Populates thePersonalList for all appeals or a specific one.
CREATE OR ALTER PROCEDURE dbo.spSetPersonalList
	(
                @appealId                       AS INT = NULL,
                @isNetResidentsAppealType       AS BIT = 0
        )
AS
BEGIN
	SET NOCOUNT ON;

    DECLARE @STATE_TARGET_READY_TO_START INT = 5,
	        @STATE_TARGET_LPA_QUESTIONNAIRE_DUE INT = 10,
	        @STATE_TARGET_ASSIGN_CASE_OFFICER INT = 15,
	        @STATE_TARGET_ISSUE_DETERMINATION INT = 30,
	        @STATE_TARGET_ISSUE_DETERMINATION_AFTER_SITE_VISIT INT = 40,
	        @STATE_TARGET_STATEMENT_REVIEW INT = 55,
	        @STATE_TARGET_FINAL_COMMENT_REVIEW INT = 60;

    DECLARE @parentId INT = NULL;

    -- Create temp table to store the data we need to create the personal list table   
	CREATE TABLE #personal 
	(
                appealId                            INT             NOT NULL,
                parentAppealId                      INT             NULL,
                caseCreatedDate                     DATETIME2       NOT NULL,
                caseExtensionDate                   DATETIME2       NULL,

                -- AppealStatus
                status                              NVARCHAR(1000)  NULL,
                statusCreatedAt                     DATETIME2       NULL,

                -- Flags
                completeOrWithdrawn                 BIT             NOT NULL    DEFAULT 0,
                isParentAppeal                      BIT             NOT NULL    DEFAULT 0,
                isChildAppeal                       BIT             NOT NULL    DEFAULT 0,
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

                -- Costs
                appellantCostsApplication           INT             NOT NULL      DEFAULT(0),
                appellantCostsWithdrawal            INT             NOT NULL      DEFAULT(0),
                appellantCostsCorrespondence        INT             NOT NULL      DEFAULT(0),
                lpaCostsApplication                 INT             NOT NULL      DEFAULT(0),
                lpaCostsWithdrawal                  INT             NOT NULL      DEFAULT(0),
                lpaCostsCorrespondence              INT             NOT NULL      DEFAULT(0),
                lpaCostsDecisionLetter              INT             NOT NULL      DEFAULT(0),
                awaitingLpaCostsDecision            INT             NOT NULL      DEFAULT(0),
     
                awaitingAppellantCostsDecision      BIT             NOT NULL      DEFAULT(0),
                appellantCostsDecisionLetter        INT             NOT NULL      DEFAULT(0),

		PRIMARY KEY (appealId)
	);

    IF @appealId IS NULL 
    BEGIN
            -- Insert the appeals
            INSERT INTO #personal (appealId, caseCreatedDate, caseExtensionDate, procedureTypeKey ) 
            SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key]
            FROM    Appeal ap
                    LEFT OUTER JOIN ProcedureType pt ON ap.procedureTypeId = pt.id;
    END
    ELSE
    BEGIN
            -- Change: the procedure now accepts Appeal.id directly, so linked lookups use parentId/childId instead of parentRef/childRef.
            SELECT  @parentId = parentId FROM AppealRelationship WHERE parentId = @appealId OR childId = @appealId;

            IF @parentId IS NULL
            BEGIN
                    -- Change: if the appeal is not linked, refresh just the standalone appeal that matches the supplied appeal id.
                    INSERT INTO #personal (appealId, caseCreatedDate, caseExtensionDate, procedureTypeKey ) 
                    SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key]
                    FROM    Appeal ap
                            LEFT OUTER JOIN ProcedureType pt ON ap.procedureTypeId = pt.id
                    WHERE   ap.id = @appealId;
            END
            ELSE
            BEGIN
                    -- Existing linked behaviour: refresh the parent appeal and all children in that linked set, keyed by Appeal.id.
                    INSERT INTO #personal (appealId, caseCreatedDate, caseExtensionDate, procedureTypeKey ) 
                    SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key]
                    FROM    Appeal ap
                            LEFT OUTER JOIN ProcedureType pt ON ap.procedureTypeId = pt.id
                    WHERE   ap.id = @parentId
                    UNION ALL
                    SELECT  ap.id, ap.caseCreatedDate, ap.caseExtensionDate, pt.[key]
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
    SET     completeOrWithdrawn = CASE WHEN status = 'complete' OR status = 'withdrawn' THEN 1 ELSE 0 END;

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
            finalCommentsDueDate                = tm.finalCommentsDueDate
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

    -- COSTS
    UPDATE  #personal
    SET     appellantCostsApplication    = appellantCostsApplication    + CASE WHEN fd.costsType = 'appellantCostsApplication' THEN fd.documentCount ELSE 0 END,
            appellantCostsWithdrawal     = appellantCostsWithdrawal     + CASE WHEN fd.costsType = 'appellantCostsWithdrawal' THEN fd.documentCount ELSE 0 END,
            appellantCostsCorrespondence = appellantCostsCorrespondence + CASE WHEN fd.costsType = 'appellantCostsCorrespondence' THEN fd.documentCount ELSE 0 END,
            lpaCostsApplication          = lpaCostsApplication          + CASE WHEN fd.costsType = 'lpaCostsApplication' THEN fd.documentCount ELSE 0 END,
            lpaCostsWithdrawal           = lpaCostsWithdrawal           + CASE WHEN fd.costsType = 'lpaCostsWithdrawal' THEN fd.documentCount ELSE 0 END,
            lpaCostsCorrespondence       = lpaCostsCorrespondence       + CASE WHEN fd.costsType = 'lpaCostsCorrespondence' THEN fd.documentCount ELSE 0 END,
            appellantCostsDecisionLetter = appellantCostsDecisionLetter + CASE WHEN fd.costsType = 'appellantCostsDecisionLetter' THEN fd.documentCount ELSE 0 END,
            lpaCostsDecisionLetter       = lpaCostsDecisionLetter       + CASE WHEN fd.costsType = 'lpaCostsDecisionLetter' THEN fd.documentCount ELSE 0 END
    FROM    #personal p 
            INNER JOIN ( 
                    SELECT  f.caseId,
                            REPLACE(f.path, 'costs/', '') AS costsType,
                            COUNT(d.guid) AS documentCount
                    FROM    Folder AS f
                            LEFT JOIN Document AS d ON  d.folderId = f.id
                                                    AND d.isDeleted = 0
                    WHERE   f.path LIKE 'costs/%'        -- only folders under 'costs/'
                    GROUP BY f.caseId, f.path
            ) fd ON  p.appealId = fd.caseId;

    UPDATE  #personal
    SET     awaitingAppellantCostsDecision = CASE WHEN appellantCostsDecisionLetter = 0 AND appellantCostsApplication > appellantCostsWithdrawal THEN 1 ELSE 0 END,
            awaitingLpaCostsDecision       = CASE WHEN lpaCostsDecisionLetter = 0 AND lpaCostsApplication > lpaCostsWithdrawal THEN 1 ELSE 0 END;

    --
    -- CalculateDueDate
    --

    UPDATE  #personal
    SET     dueDate = CASE  WHEN appellantCaseValidationOutcomeName = 1 AND caseExtensionDate IS NOT NULL
                            THEN caseExtensionDate
                            ELSE DATEADD(day, @STATE_TARGET_READY_TO_START, caseCreatedDate) END
    WHERE   status = 'ready_to_start';

    UPDATE  #personal
    SET     dueDate = CASE  WHEN lpaQuestionnaireDueDate IS NOT NULL
                            THEN lpaQuestionnaireDueDate
                            ELSE DATEADD(day, @STATE_TARGET_LPA_QUESTIONNAIRE_DUE, caseCreatedDate) END
    WHERE   status = 'lpa_questionnaire';

    UPDATE  #personal
    SET     dueDate = DATEADD(day, @STATE_TARGET_ASSIGN_CASE_OFFICER, caseCreatedDate)
    WHERE   status = 'assign_case_officer';

    UPDATE  #personal
    SET     dueDate = CASE WHEN caseExtensionDate IS NULL THEN caseCreatedDate ELSE caseExtensionDate END
    WHERE   status = 'validation';

    -- IssueDetermination TODO
    UPDATE  #personal
    SET     dueDate = CASE  WHEN siteVisitDate IS NOT NULL AND siteVisitEndTime IS NOT NULL THEN ( SELECT businessDate FROM NextBusinessDate WHERE currentDate = CONVERT(DATE, siteVisitEndTime) AND noBusinessDays = 40 )
                            WHEN siteVisitDate IS NOT NULL THEN ( SELECT businessDate FROM NextBusinessDate WHERE currentDate = CONVERT(DATE, siteVisitDate) AND noBusinessDays = 5 )
                            ELSE ( SELECT businessDate FROM NextBusinessDate WHERE currentDate = CONVERT(DATE, caseCreatedDate) AND noBusinessDays = 30 )
                    END
    WHERE   status = 'issue_determination';

    SELECT p.appealId, siteVisitEndTime, CONVERT(DATE, siteVisitEndTime) as conSiteVisitEndTime, nbd.*
    FROM   #personal p 
           LEFT OUTER  JOIN NextBusinessDate nbd ON nbd.currentDate = CONVERT(DATE, siteVisitEndTime)
    WHERE  p.appealId = 102;
    

    -- Complete 
    UPDATE  #personal
    SET     dueDate = CASE  WHEN awaitingAppellantCostsDecision IS NOT NULL OR awaitingLpaCostsDecision IS NOT NULL THEN ( SELECT businessDate FROM NextBusinessDate WHERE currentDate = statusCreatedAt AND noBusinessDays = 5 )
                            WHEN numberOfResidencesNetChange IS NULL AND @isNetResidentsAppealType = 1 AND isChildAppeal = 1 THEN GETDATE()
                    END
    WHERE   status = 'complete';

    UPDATE  #personal
    SET     dueDate = CASE  WHEN lpaStatementDueDate IS NOT NULL AND ipCommentsDueDate IS NOT NULL AND lpaStatementDueDate < ipCommentsDueDate          THEN lpaStatementDueDate
                            WHEN lpaStatementDueDate IS NOT NULL AND ipCommentsDueDate IS NOT NULL AND lpaStatementDueDate >= ipCommentsDueDate         THEN ipCommentsDueDate
                            WHEN lpaStatementDueDate IS NOT NULL THEN lpaStatementDueDate
                            WHEN ipCommentsDueDate IS NOT NULL THEN ipCommentsDueDate
                            WHEN appellantStatementDueDate IS NOT NULL THEN appellantStatementDueDate
                            ELSE DATEADD(day, @STATE_TARGET_STATEMENT_REVIEW, caseCreatedDate) END
    WHERE   status = 'statements';

    UPDATE  #personal
    SET     dueDate = CASE  WHEN proofOfEvidenceAndWitnessesDueDate IS NOT NULL THEN proofOfEvidenceAndWitnessesDueDate
                            ELSE NULL END
    WHERE   status = 'evidence';

    UPDATE  #personal
    SET     dueDate = CASE  WHEN finalCommentsDueDate IS NOT NULL
                            THEN finalCommentsDueDate
                            ELSE DATEADD(day, @STATE_TARGET_FINAL_COMMENT_REVIEW, caseCreatedDate) END
    WHERE   status = 'final_comments';

    UPDATE  #personal
    SET     dueDate = CASE  WHEN procedureTypeKey = 'hearing' THEN hearingStartTime
                            WHEN procedureTypeKey = 'inquiry' THEN  
                                    CASE WHEN inquiryStartTime IS NOT NULL THEN DATEADD(day, ISNULL(estimatedDays, 0), inquiryStartTime) END
                            ELSE siteVisitDate END
    WHERE   status = 'awaiting_event';

    UPDATE  #personal
    SET     dueDate = CASE  WHEN finalCommentsDueDate IS NOT NULL THEN finalCommentsDueDate
                            WHEN lpaQuestionnaireDueDate IS NOT NULL THEN lpaQuestionnaireDueDate
                            ELSE CAST('1970-01-01T00:00:00.000' AS datetime2) END
    WHERE   status = 'event';

    -- 5 business days to be added NOT 5 days
    UPDATE  #personal
    SET     dueDate = DATEADD(day, 5, statusCreatedAt)
    WHERE   status = 'awaiting_transfer'
    AND     statusCreatedAt IS NOT NULL;

    -- 5 busioness days to be added NOT 5 days
    UPDATE  #personal
    SET     dueDate = CASE  WHEN awaitingAppellantCostsDecision IS NOT NULL OR awaitingLpaCostsDecision IS NOT NULL THEN DATEADD(day, 5, statusCreatedAt) END
    WHERE   status = 'withdrawn';

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
