-- Create or alter the procedure
CREATE OR ALTER PROCEDURE dbo.spPopulateCalendarDates
AS
BEGIN
    SET NOCOUNT ON;

    -- Ensure consistent weekday numbering (Sunday=1, Saturday=7)
    SET DATEFIRST 7;

    DECLARE @StartDate DATE = '2025-01-01';
    DECLARE @EndDate   DATE = DATEADD(YEAR, 1, CAST(GETDATE() AS DATE));

    ;WITH DateSeries AS
    (
        SELECT @StartDate AS DateValue
        UNION ALL
        SELECT DATEADD(DAY, 1, DateValue)
        FROM DateSeries
        WHERE DateValue < @EndDate
    )
    INSERT INTO dbo.CalendarDate
    (
        currentDate,
        isWeekend,
        isBankHoliday
    )
    SELECT
        d.DateValue,
        CASE 
            WHEN DATEPART(WEEKDAY, d.DateValue) IN (1, 7) THEN 1
            ELSE 0
        END AS isWeekend,
        0 AS isBankHoliday
    FROM DateSeries d
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.CalendarDate c
        WHERE c.currentDate = d.DateValue
    )
    OPTION (MAXRECURSION 32767);

    UPDATE CalendarDate
    SET    isBankHoliday = 0
    WHERE  isBankHoliday = 1;

	-- Update the InvalidReasonsSelected
	UPDATE CalendarDate
	SET    isBankHoliday = 1
	FROM   CalendarDate cal
		   INNER JOIN BankHoliday bh ON cal.currentDate = bh.bankHolidayDate;

END;
