#####################################################################
# Profiler script.
#
# Arguments:
# -d <0,1,2,3>            // Document Loader Cache Option (0,1,2, or 3; cfr. src/profiling/config.ts for details) (default: 3)
# -n <integer>            // Number of iterations (default: 1)
# -s "ALL|webid|did-key"  // Solution to profile (default: ALL)
####################################################################
set -e
set -u

# DEFAULTS
SOLUTION="ALL"
N=1
DLCO_INDEX=3

while getopts s:d:n: option
do
    case "${option}"
    in
        s) SOLUTION=${OPTARG};;
        d) DLCO_INDEX=${OPTARG};;
        n) N=${OPTARG};;
    esac
done

echo "Executing profiler with following parameters:"
echo "SOLUTION: $SOLUTION"
echo "DLCO_INDEX: $DLCO_INDEX"
echo "N: $N"

if [ "$SOLUTION" == "ALL" ]; then
    npm run profile -- --dcloConfig=$DLCO_INDEX --n=$N --solution="webid"
    npm run profile -- --dcloConfig=$DLCO_INDEX --n=$N --solution="did-key"

else
    npm run profile -- --dcloConfig=$DLCO_INDEX --n=$N --solution="$SOLUTION"
    exit 1
fi

