contains_value() {
  local list="$1"
  local value="$2"

  IFS=',' read -r -a array <<< "$list"

  for item in "${array[@]}"; do
    if [[ "$(echo "$item" | xargs)" == "$value" ]]; then
      return 0
    fi
  done

  return 1
}

echo "Allowed list: $ALLOWED_ENVIRONMENTS"
echo "Target value: $TARGET_ENVIRONMENT"

if [ contains_value "$ALLOWED_ENVIRONMENTS" "$TARGET_ENVIRONMENT" ] && [ "$ENABLED" = "true" ]; then
    echo "Run e2e tests"
    echo "##vso[task.setvariable variable=runE2E]true"
else
    echo "Do not run e2e tests"
fi
