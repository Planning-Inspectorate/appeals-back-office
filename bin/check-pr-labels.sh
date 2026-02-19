checkPrLabel() {
	label="$1"
	filePath="$2"
	if grep -q $label $filePath; then
		echo "Found '$label' label in PR"
		echo "##vso[task.setvariable variable=runE2E]true"
		echo "##vso[task.setvariable variable=$label]true"
	fi
}

labels=("") # Add future opt in e2e labels here
filePath="$1"

if grep -q "optOutE2eSmoke" $filePath; then
	echo "Opt out running e2e smoke tests"
else
	echo "Run e2e smoke tests"
	echo "##vso[task.setvariable variable=runE2E]true"
  echo "##vso[task.setvariable variable=e2eSmoke]true"
fi

for label in "${labels[@]}"; do
	checkPrLabel $label $filePath
done
