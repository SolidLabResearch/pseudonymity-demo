
DIR_WEB_RESOLVABLE=$(pwd)/reports/web-resolvable
DIR_DID_KEY=$(pwd)/reports/did-key

mkdir -p $DIR_WEB_RESOLVABLE
mkdir -p $DIR_DID_KEY

# echo "Evaluations for: Web-resolvable DID Document"
for i in {1..30};
 do
   echo "Running test $i"
   npm run test:evaluation:web-resolvable
   mv performance-report.json $DIR_WEB_RESOLVABLE/performance-report_$i.json
 done;


echo "Evaluations for: Key DID Document"
for i in {1..30};
do
  echo "Running test $i"
  npm run test:evaluation:did-key
  mv performance-report.json $DIR_DID_KEY/performance-report_$i.json
done;
