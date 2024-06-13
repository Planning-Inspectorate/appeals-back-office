# User Import

Contains functions to import:
1. employees from the `register-odw-employee-subscription`, on the `employee` topic
2. service users from the `register-odw-service-user-subscription`, on the `service-user` topic

These function handles the commands, posting its payload to the back-office appeals api.

> Note: these have been unregistered as functions (function.json removed) because these subscriptions don't exist. They can be reinstated when they are needed and the infrastructure is setup.