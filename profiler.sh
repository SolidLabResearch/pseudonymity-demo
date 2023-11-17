set -e
set -u

DIR_PROFILING=$(PWD)/reports/profiling
FPATH_EVALUATOR=$(PWD)/build/profiling/evaluator.js
mkdir -p $DIR_PROFILING

N=100

function profileWebResolvable() {
    echo "Profile: Web-resolvable DID Document"
    for i in $(seq 1 $N); do
      npm run test:components:setup
      npm run profile:web-resolvable
    done
}



# Evaluation: did-key
function profileDidKey() {
  echo "Profile: DID Key Document"
  for i in $(seq 1 $N); do
    npm run profile:did-key
  done
}


profileWebResolvable
profileDidKey
