checkPrLabel() {
	label="$1"
	filePath="$2"
	if grep -q $label $filePath; then
		echo "Found '$label' label in PR"
		echo "##vso[task.setvariable variable=runE2E]true"
		echo "##vso[task.setvariable variable=$label]true"
	fi
}

labels=("e2eSmoke")
filePath="$1"

for label in "${labels[@]}"; do
	checkPrLabel $label $filePath
done
