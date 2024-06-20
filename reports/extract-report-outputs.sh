set -e # exit on error
source ./extract-report-args.sh # processes the command line arguments

echo "Extract report outputs"
set -u # from now on, exit if a variable is not set

echo "Extracting output of step: $STEP"
# Extract the specific output of the step with the name "$STEP"
record=$(jq '.records[] | select(.name == "'$STEP'") | .output' $JSON_FILE)
echo $record| jq .
