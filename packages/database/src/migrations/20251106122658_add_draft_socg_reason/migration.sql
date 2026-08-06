BEGIN TRY
    BEGIN TRANSACTION;

    -- Insert new incomplete reason
    INSERT INTO AppellantCaseIncompleteReason (id, name, hasText)
    VALUES (11, 'Draft statement of common ground is missing', 0); -- Value ID set to 11 to avoid errors with live prod data referring to 'other' with id:10

    COMMIT TRAN;
END TRY
BEGIN CATCH
    
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRAN;
    END;

    THROW;
END CATCH