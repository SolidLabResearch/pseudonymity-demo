# Generate output readme
# /bin/zsh ./create-demo-output-readme.sh

set -e
set -u

FPATH_README=./demo-output-readme.md
JSON_FILE=./pseudonymity-demo-output.json

echo "# README \n" > $FPATH_README

function addH2() {
  H2=$1
  echo "## $H2 \n" >> $FPATH_README
}
function addParagrah() {
  P=$1
  echo "$P" >> $FPATH_README
}
function addStepToReadme() {
  STEP=$1
  STEP_DESC=$2
  #
  addH2 $STEP
  addParagrah $STEP_DESC
  echo '```json' >> $FPATH_README
  STEP_OUTPUT=$(jq '.records[] | select(.name == "'$STEP'") | .output' $JSON_FILE)
  echo $STEP_OUTPUT >> $FPATH_README
  echo '```' >> $FPATH_README
}


##########################################
# Extract and describe steps in README
##########################################

##########################################
STEP='signDiplomaCredential'
STEP_DESC='
University issues a Diploma credential to Alice, with the following contents:
'
addStepToReadme $STEP $STEP_DESC

##########################################
STEP='signIdentityCredential'
STEP_DESC='
Government issues an Identity credential to Alice, with the following contents:
'
addStepToReadme $STEP $STEP_DESC


##########################################
STEP='deriveDiplomaCredential'
STEP_DESC='
Alice derives her diploma credential, only disclosing attributes required by the recruiter.

The derived credential has the following contents:
'
addStepToReadme $STEP $STEP_DESC

##########################################
STEP='signPresentation01'
STEP_DESC='
Alice creates a VP01 with the derived diploma credential,
and signs it using her pseudonymous identity.
Thus, as part of the diploma verification, Alice will pseudonymously present the following VP to the recruiter:
'
addStepToReadme $STEP $STEP_DESC

##########################################
STEP='verifyPresentation01'
STEP_DESC='
The recruiter verifies VP01.
The verification result is as follows:
'
addStepToReadme $STEP $STEP_DESC


##########################################
addH2 "Assumption: Alice passes selection round"
addParagrah 'The recruiter verified VP01 and selects the corresponding holder as the best candidate for the job.
Therefore, the second phase (i.e., identity verification) starts, in which the holder needs to disclose
their actual identity.
'

##########################################
STEP='deriveIdentityCredential'
STEP_DESC='
Alice derives her identity credential, only disclosing her WebID that was issued by the government.
The derived credential has the following contents:
'
addStepToReadme $STEP $STEP_DESC

##########################################
STEP='signPresentation02'
STEP_DESC='
Alice creates a VP02 consisting of the following VCs:\n
- The derived identity credential \n
- An identity binding VC, expressing the binding between the actual/true ID and the pseudonymous ID, signed by the key pair that is linked to Alice her actual identity.\n
- An identity binding VC, expressing the binding between the actual/true ID and the pseudonymous ID, signed by the key pair that is linked to Alice her pseudonymous identity.\n

Finally, Alice signs VP02 using her actual/true identity,
which she will present to the recruiter.
'
addStepToReadme $STEP $STEP_DESC

##########################################
STEP='verifyPresentation02'
STEP_DESC='
The recruiter verifies VP02.
The verification result is as follows:
'
addStepToReadme $STEP $STEP_DESC
