set -e
set -u

DIR_PROFILING=$(PWD)/reports/profiling
mkdir -p $DIR_PROFILING

N=100
DT_START=$(date)

for i in $(seq 1 $N); do
    npm run profile
done

DT_END=$(date)

echo "Started: $DT_START"
echo "Ended: $DT_END"
