-- Populates the NextBusinessDate for each date in the CalendarDate table for the number of business dates
CREATE OR ALTER PROCEDURE dbo.spPopulateNextBusinessDates
    @BusinessDays INT
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH BusinessDates AS
    (
        SELECT
            CAST(currentDate AS date) AS businessDate
        FROM CalendarDate
        WHERE isWeekend = 0
          AND isBankHoliday = 0
    ),
    RankedBusinessDates AS
    (
        SELECT
            CAST(c.currentDate AS date) AS currentDate,
            CAST(@BusinessDays AS int) AS noBusinessDays,
            b.businessDate AS businessDate,
            ROW_NUMBER() OVER
            (
                PARTITION BY CAST(c.currentDate AS date)
                ORDER BY b.businessDate
            ) AS rn
        FROM CalendarDate c
        INNER JOIN BusinessDates b
            ON b.businessDate > CAST(c.currentDate AS date)
    ),
    FinalResult AS
    (
        SELECT
            currentDate,
            noBusinessDays,
            businessDate
        FROM RankedBusinessDates
        WHERE rn = CAST(@BusinessDays AS int)
    )
    MERGE NextBusinessDate AS tgt
    USING FinalResult AS src
       ON tgt.currentDate = src.currentDate
      AND tgt.noBusinessDays = src.noBusinessDays
    WHEN MATCHED THEN
        UPDATE SET tgt.businessDate = src.businessDate
    WHEN NOT MATCHED THEN
        INSERT (currentDate, noBusinessDays, businessDate)
        VALUES (src.currentDate, src.noBusinessDays, src.businessDate);

END;