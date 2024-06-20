set -e
DIR_PROFILING_REPORTS=$(pwd)/profiling
while getopts f:s: option
do
    case "${option}"
    in
        f) JSON_FILE=${OPTARG};;
        s) STEP=${OPTARG};;
    esac
done

if [ -u $JSON_FILE ]; then
    echo "⚠️ JSON_FILE (option: -f) is not set."
    JSON_FILE=$(ls -t $DIR_PROFILING_REPORTS/*/*|head -n 1)
    echo "Defaulting to latest JSON file: $JSON_FILE"
fi

if [ -u $STEP ]; then
    echo "STEP is not set. Available steps are:"
    jq '.records[].name' $JSON_FILE
    exit 1;
fi

echo "STEP: $STEP"
echo "JSON_FILE: $JSON_FILE"

export JSON_FILE
export STEP