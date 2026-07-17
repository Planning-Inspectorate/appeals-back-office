BEGIN TRY

BEGIN TRAN;

-- Reassign appeals assigned to 'Enforcement Appeals Team' to the correct enforcement team based on the LPA
UPDATE a
SET a.assignedTeamId = l.enforcementTeamId
FROM [dbo].[Appeal] a
JOIN [dbo].[LPA] l ON a.lpaId = l.id
JOIN [dbo].[Team] t ON a.assignedTeamId = t.id
WHERE t.name = 'Enforcement Appeals Team'
AND l.enforcementTeamId IS NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH