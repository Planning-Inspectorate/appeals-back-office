#!/bin/bash

verify_appellant_case_docs() {
  TMP_FILE=$(mktemp)
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
  REPO_ROOT="$SCRIPT_DIR/../.."

  # Run doc generator in check mode or check git diff of README.md
  npm run generate-docs:appellant-case --workspace=@pins/appeals.web > /dev/null 2>&1

  # Check if README.md has uncommitted changes produced by running doc generator
  README_PATH="appeals/web/src/server/appeals/appeal-details/appellant-case/page-components/README.md"
  
  if ! git diff --exit-code "$REPO_ROOT/$README_PATH" > /dev/null 2>&1; then
    echo "Appellant case mapper documentation in $README_PATH is outdated."
    echo "Please run: npm run generate-docs:appellant-case --workspace=@pins/appeals.web and commit the updated README.md"
    rm "$TMP_FILE"
    return 1
  fi

  echo "Appellant case mapper documentation is up to date."
  rm "$TMP_FILE"
  return 0
}

verify_appellant_case_docs
