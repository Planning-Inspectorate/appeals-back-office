#!/bin/bash

# Function to verify that the OpenAPI docs are up to date with any changes
verify_openapi_docs() {
  # Create a temporary directory for generated OpenAPI output
  TMP_OUTPUT_DIR=$(mktemp -d)
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
  REPO_ROOT="$SCRIPT_DIR/../.."
  GEN_API_SPEC="$REPO_ROOT/appeals/api/src/server/gen-api-spec.js"
  SERVER_DIR="$REPO_ROOT/appeals/api/src/server"

  # Run the generator script with output directed to the temp folder
  # Must run from the API directory to match `npm run gen-api-spec` behavior
  # (swagger-autogen resolves relative endpoint paths from CWD)
  (cd "$REPO_ROOT/appeals/api" && export OPENAPI_OUTPUT_DIR="$TMP_OUTPUT_DIR" && node "$GEN_API_SPEC")

  # Diff the generated OpenAPI files with the committed ones
  DIFF_FOUND=0
  FAIL_MESSAGE=""

  # Check openapi.json
  diff -u "$SERVER_DIR/openapi.json" "$TMP_OUTPUT_DIR/openapi.json" > "$TMP_OUTPUT_DIR/openapi_json.diff"
  if [ $? -ne 0 ]; then
    echo "WARNING: openapi.json is out of date with respect to the source code."
    cat "$TMP_OUTPUT_DIR/openapi_json.diff"
    DIFF_FOUND=1
    FAIL_MESSAGE="OpenAPI documentation is not up-to-date!"
  fi

  # Check openapi-types.ts
  diff -u "$SERVER_DIR/openapi-types.ts" "$TMP_OUTPUT_DIR/openapi-types.ts" > "$TMP_OUTPUT_DIR/openapi_types.diff"
  if [ $? -ne 0 ]; then
    echo "WARNING: openapi-types.ts is out of date with respect to the source code."
    cat "$TMP_OUTPUT_DIR/openapi_types.diff"
    DIFF_FOUND=1
    FAIL_MESSAGE="OpenAPI types file is not up-to-date!"
  fi

  # Clean up temporary directory
  rm -rf "$TMP_OUTPUT_DIR"

  # Return appropriate result
  if [ "$DIFF_FOUND" -eq 0 ]; then
    echo "OpenAPI docs are up to date."
    return 0
  else
    echo "$FAIL_MESSAGE"
		echo "Please make sure that you have run 'npm run gen-api-spec' in the appeals/api directory."
		echo "See https://pins-ds.atlassian.net/wiki/spaces/BO/pages/2255618049/Generating+API+docs+in+Back+Office for more details."
    return 1
  fi
}

verify_openapi_docs
