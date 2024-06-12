# Notifications

The api back-end communicates changes to relevant parties by sending email notifications through the [Gov.UK Notify](https://www.notifications.service.gov.uk/) service.
In local development, the notifications will not be sent, but simply logged to the Notify system. At runtime, the API still requires a test mailbox to successfully invoke Notify.

You can update the api back-end environment settings in `appeals/api/.env` to add the following settings:

```shell
TEST_MAILBOX=test@example.com
GOV_NOTIFY_API_KEY=(retrieved)
```

> [!IMPORTANT]
> The `API GOV_NOTIFY_API_KEY` cannot be publicly disclosed, and need to be retrieved through the repository owner
