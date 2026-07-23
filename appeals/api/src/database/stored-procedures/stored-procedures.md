# Stored Procedures

This is the folder where we will keep our version-controlled stored procedure SQL scripts.

To change these scripts, amend them here and then create a new manual prisma migration file in a prisma migration folder, and copy that script into it.

For more details, see the main documentation on [stored procedures](/docs/database.md).


# Current Stored Procedures

## spPopulateCalendarDates.sql
This stored procedure populates the CalendarDate table with a record for each date, indicating whether it is a weekend or a bank holiday.
It is used to identify Business Days for the purpose of calculating deadlines and other date-related logic in the application.
Called from the scheduled jobs Function App in update-bank-holidays.

## spPopulateNextBusinessDates.sql
Stored Procedure to populate the NextBusinessDate for each date in the CalendarDate table for the number of business dates.
Used to calculate the next business date for a given number of business days from a specific date, taking into account weekends and bank holidays.
Called from the scheduled jobs Function App in update-bank-holidays.

## spPersonalList.sql
Populates the PersonalList table with the next Due Date for each appeal - used on User Personal List dashboard.
Updated when appeal stage transitions occur.  
Can be called for a single appealId, or to update the table for all appeals. 

