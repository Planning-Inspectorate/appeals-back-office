BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Address_postcode_idx] ON [dbo].[Address]([postcode]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCase_appellantProcedurePreference_idx] ON [dbo].[AppellantCase]([appellantProcedurePreference]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCase_enforcementReference_idx] ON [dbo].[AppellantCase]([enforcementReference]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCase_isGreenBelt_idx] ON [dbo].[AppellantCase]([isGreenBelt]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
