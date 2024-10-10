# Split file

A script for breaking up larger files into smaller files.

## What does it do?

Given a file containing several functions this script creates a new file for each function in the original file. The new files contain all the imports and types from the original file. An index.js file will also be created exporting all the functions.

## How do I use it?

Invoke the script with npm

`npm run scripts:split-file <path/to/file/to/split> <path/to/output/directory>`

The script isn't smart enough to know which imports and types are used by each new file so they may require some linting. If you're using VSC `alt` + `shift` + `O` will remove all unused imports for you.You can then clean up the original file as you see fit.