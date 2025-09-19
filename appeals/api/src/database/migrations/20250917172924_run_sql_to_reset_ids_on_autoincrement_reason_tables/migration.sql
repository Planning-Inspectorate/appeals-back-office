BEGIN TRY

-- RedefineTables
BEGIN TRANSACTION;

DECLARE @INVALID_REASON_CNT           INT;
DECLARE @INVALID_REASON_MIN_ID        INT;
DECLARE @INVALID_REASON_SELECT_CNT    INT;

DECLARE @INCOMPLETE_REASON_CNT        INT;
DECLARE @INCOMPLETE_REASON_MIN_ID     INT;
DECLARE @INCOMPLETE_REASON_SELECT_CNT INT;

-- InvalidReason Counts
SELECT  @INVALID_REASON_CNT           = COUNT(*), 
        @INVALID_REASON_MIN_ID        = ISNULL(MIN(id), 0)
FROM    AppellantCaseInvalidReason;

SELECT  @INVALID_REASON_SELECT_CNT    = COUNT(*)
FROM    AppellantCaseInvalidReasonsSelected;

-- IncompleteReason counts
SELECT  @INCOMPLETE_REASON_CNT        = COUNT(*), 
        @INCOMPLETE_REASON_MIN_ID     = ISNULL(MIN(id), 0)
FROM    AppellantCaseIncompleteReason;

SELECT  @INCOMPLETE_REASON_SELECT_CNT = COUNT(*)
FROM    AppellantCaseIncompleteReasonsSelected;

-- FOR DEBUGGING
-- SELECT @INVALID_REASON_CNT, @INVALID_REASON_MIN_ID, @INVALID_REASON_SELECT_CNT, @INCOMPLETE_REASON_CNT, @INCOMPLETE_REASON_MIN_ID, @INCOMPLETE_REASON_SELECT_CNT;

-- Handle the InvalidReasons
IF ( @INVALID_REASON_CNT = 4 AND @INVALID_REASON_MIN_ID > 1)
BEGIN
	-- Change the name of the invalid reason code, to avoid duplicate name constraint
	UPDATE AppellantCaseInvalidReason
	SET    name = CONCAT(name, '.....')
    WHERE  name not like '%....';

	-- Create the InvalidReasons from id = 1
	INSERT INTO AppellantCaseInvalidReason ( id, name, hasText) VALUES ( 1, 'Appeal has not been submitted on time',           0 );
	INSERT INTO AppellantCaseInvalidReason ( id, name, hasText) VALUES ( 2, 'Documents have not been submitted on time',       0 );
	INSERT INTO AppellantCaseInvalidReason ( id, name, hasText) VALUES ( 3, 'The appellant does not have the right to appeal', 0 );
	INSERT INTO AppellantCaseInvalidReason ( id, name, hasText) VALUES ( 4, 'Other reason',                                    1 );

	
	-- Update the InvalidReasonsSelected
	UPDATE AppellantCaseInvalidReasonsSelected
	SET    appellantCaseInvalidReasonId = ids.to_id
	FROM   AppellantCaseInvalidReasonsSelected irs
		   INNER JOIN
		   (
		       SELECT irf.id as from_id, irt.id as to_id
			   FROM   AppellantCaseInvalidReason irf
                      INNER JOIN AppellantCaseInvalidReason irt ON irt.name NOT LIKE '%.....'
               WHERE  irf.name LIKE '%.....'
               AND    irt.name = LEFT(irf.name, LEN(irf.name)-5)
		   ) ids ON irs.appellantCaseInvalidReasonId = ids.from_id;

	DELETE 
	FROM    AppellantCaseInvalidReason 
	WHERE   name LIKE '%.....';

	SELECT 'InvalidReason changes successfully completed'

END
ELSE
BEGIN
	SELECT 'InvalidReason changes are not required'

END

-- Handle the IncompleteReasons
IF ( @INCOMPLETE_REASON_CNT = 10 AND @INCOMPLETE_REASON_MIN_ID > 1)
BEGIN
	-- Change the name of the incomplete reason code, to avoid duplicate name constraint
	UPDATE AppellantCaseIncompleteReason
	SET    name = CONCAT(name, '.....')
    WHERE  name not like '%....';

	-- Create the IncompleteReasons from id = 1
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 1, 'Appellant name is not the same on the application form and appeal form',                                          0 )
	INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 2, 'Attachments and/or appendices have not been included to the full statement of case',                              1 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 3, 'LPA''s decision notice is missing',                                                                                0 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 4, 'LPA''s decision notice is incorrect or incomplete',                                                                1 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 5, 'Documents and/or plans referred in the application form, decision notice and appeal covering letter are missing', 1 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 6, 'Agricultural holding certificate and declaration have not been completed on the appeal form',                     0 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 7, 'The original application form is missing',                                                                        0 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 8, 'The original application form is incomplete',                                                                     1 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 9, 'Statement of case and ground of appeal are missing',                                                              0 )
    INSERT INTO AppellantCaseIncompleteReason ( id, name, hasText) VALUES ( 10, 'Other',                                                                                                          1 )
	
	-- Update the IncompleteReasonsSelected
	UPDATE AppellantCaseIncompleteReasonsSelected
	SET    appellantCaseIncompleteReasonId = ids.to_id
	FROM   AppellantCaseIncompleteReasonsSelected irs
		   INNER JOIN
		   (
		       SELECT irf.id as from_id, irt.id as to_id
			   FROM   AppellantCaseIncompleteReason irf
                      INNER JOIN AppellantCaseIncompleteReason irt ON irt.name NOT LIKE '%.....'
               WHERE  irf.name LIKE '%.....'
               AND    irt.name = LEFT(irf.name, LEN(irf.name)-5)
		   ) ids ON irs.appellantCaseIncompleteReasonId = ids.from_id;

	DELETE 
	FROM    AppellantCaseIncompleteReason 
	WHERE   name LIKE '%.....';

	SELECT 'IncompleteReason changes successfully completed'

END
ELSE
BEGIN
	SELECT 'IncompleteReason changes are not required'

END


COMMIT;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
