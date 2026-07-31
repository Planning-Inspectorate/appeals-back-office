#!/bin/bash

# Function to verify that the notification and triggers doc contains all the notify templates
verify_notify_docs() {
  # Create a temporary file for a list of notify templates that are not documented
  TMP_FILE=$(mktemp)
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
  REPO_ROOT="$SCRIPT_DIR/../.."
  NOTIFY_TEMPLATES_DIR="$REPO_ROOT/appeals/api/src/server/notify/templates"
  NOTIFICATIONS_AND_TRIGGERS_DOC="$REPO_ROOT/docs/notifications-and-triggers.md"

  # Loop through all notify template files and check if they are documented in notifications-and-triggers.md
  (cd "$NOTIFY_TEMPLATES_DIR" && \
  for template_file in *.md; do
  	if ! grep -q "$template_file" "$NOTIFICATIONS_AND_TRIGGERS_DOC"; then
			echo "- $template_file" >> $TMP_FILE
		fi
  	done
  )

  # if the file is empty then all notify templates are documented
  if [ ! -s $TMP_FILE ]; then
		echo "All notify templates are documented in notifications-and-triggers.md."
		# clean up temporary file
		rm $TMP_FILE
		return 0
	fi

  # the file is not empty, so some notify templates are not documented
  echo "The following notify templates are not documented in notifications-and-triggers.md:"
  cat $TMP_FILE
  echo "Please make sure that you have added the new notify templates to the documentation."
  echo "Documentation is in the docs folder: docs/notifications-and-triggers.md"

  # clean up temporary file
  rm $TMP_FILE
  return 1
}

verify_notify_docs
