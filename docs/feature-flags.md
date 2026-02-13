# Feature Flagging

To avoid long-lived feature branches that necessitate long periods of integration, we use feature flags to toggle features in different environments while they're currently in development.

Use a feature flag when a feature is likely to take more than one sprint to develop, so that releases don't need to be halted during its development.

## How to create a feature flag

1. Navigate to this repo's infrastructure directory.
2. Under the `featureFlags` section of `apps_config` in the variables.tf file, add a property for the new feature flag. (e.g. `featureFlagNewFeature`)
3. In the `app_settings` block of `app_api` in app-api.tf, add a setting for the new feature and set it equal to the variable we just created. (e.g. `FEATURE_FLAG_NEW_FEATURE = var.apps_config.featureFlags.featureFlagNewFeature`)
4. Do this again for `app_web` in app-web.tf.
5. For each of the files in the `environments` directory, set a value for the feature flag in `apps_config.featureFlags`. Typically for a new feature flag, these should be the values:

| Environment | Value |
| ----------- | ----- |
| dev         | true  |
| staging     | true  |
| test        | false |
| training    | false |
| prod        | false |

Deploying these changes to a given environment will make the feature flag value available in that environment.

## How to use a feature flag in your code

The feature flag you just created will be available as an environmental variable, so we first want to add it to the app config.

1. Open the config file.

In the API this is src/server/config/config.js
In the web app this is environment/config.js

2. Add a property to the `featureFlags` object and use the environment variable name we created in the previous section. e.g.

```javascript
featureFlagNewFeature =
	environment.FEATURE_FLAG_NEW_FEATURE && environment.FEATURE_FLAG_NEW_FEATURE === 'true';
```

3. Now in your code you can import the `config.js` file and use the new feature flag value to determine what code to use. e.g.

```javascript
if (config.featureFlags.featureFlagNewFeature) {
	// new unfinished feature code
} else {
	// old/existing code
}
```

4. Add the feature flag to your relevant `.env` files in the `api` directory and/or the `web` directory.
5. Add the feature flag to the relevant `.env.example` files in the `api` directory and/or the `web` directory.
6. Add the feature flag to the relevant `.env.test` files in the `api` directory and/or the `web` directory.
7. Add the feature flag to the relevant `.env.e2e` files in the `api` directory and/or the `web` directory.
