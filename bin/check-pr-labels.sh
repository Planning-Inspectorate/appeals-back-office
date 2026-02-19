filePath="$1"

if grep -q "optOutE2eSmoke" $filePath; then
	echo "Opt out running e2e smoke tests"
else
	echo "Run e2e smoke tests"
	echo "##vso[task.setvariable variable=runE2E]true"
  echo "##vso[task.setvariable variable=e2eSmoke]true"
fi
