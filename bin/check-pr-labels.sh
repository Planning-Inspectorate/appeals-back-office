checkPrLabel() {
	label="$1"
	if grep -q $label pr.json; then
		echo "Found '$label' label in PR"
		echo "##vso[task.setvariable variable=runE2E]true"
		echo "##vso[task.setvariable variable=$label]true"
	fi
}

labels=("e2eSmoke")

for label in "${lables[@]}"; do
	checkPrLabel $label
done
