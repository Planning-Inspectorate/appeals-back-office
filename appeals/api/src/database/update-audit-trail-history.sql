BEGIN TRAN;

-- Pass 1: Match using attached files (100% exact match).
-- When a comment was submitted with an attached document, both the audit trail and
-- the representation were linked to the same document. Join across the shared document GUID and version to set representationId
UPDATE a
SET a.[representationId] = ra.[representationId]
FROM [dbo].[AuditTrail] a
INNER JOIN [dbo].[DocumentVersionAudit] dva ON dva.[auditTrailId] = a.[id]
INNER JOIN [dbo].[RepresentationAttachment] ra ON ra.[documentGuid] = dva.[documentGuid] AND ra.[version] = dva.[version]
WHERE a.[representationId] IS NULL;

-- Pass 2: Match comments using time proximity.
-- Look for an IP comment on the same appeal
-- created or updated within 10 seconds of the audit trail entry.
--
-- Safety rule: Only update if EXACTLY ONE comment matches (repCount = 1).
-- If multiple comments match the time window. Those rows remain
-- unlinked (NULL) to prevent showing the wrong comment details.
WITH TimestampMatches AS (
    SELECT
        a.id AS auditId,
        MIN(r.id) AS singleRepId,
        COUNT(r.id) AS repCount
    FROM [dbo].[AuditTrail] a
    INNER JOIN [dbo].[Representation] r ON r.appealId = a.appealId
    WHERE a.representationId IS NULL
      AND r.representationType = 'comment'
      AND a.details LIKE 'Interested party comment%'
      AND (r.dateLastUpdated BETWEEN DATEADD(second, -10, a.loggedAt) AND DATEADD(second, 10, a.loggedAt)
        OR r.dateCreated BETWEEN DATEADD(second, -10, a.loggedAt) AND DATEADD(second, 10, a.loggedAt))
    GROUP BY a.id
)
UPDATE a
SET a.[representationId] = tm.singleRepId
FROM [dbo].[AuditTrail] a
INNER JOIN TimestampMatches tm ON tm.auditId = a.id
WHERE tm.repCount = 1
  AND a.[representationId] IS NULL;

COMMIT TRAN;
