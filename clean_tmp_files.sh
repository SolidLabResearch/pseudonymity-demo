#!/bin/bash
set -e # exit on error
set -u  # throw error when undefined
function rmIfExists() {
  if [ -e $1 ];
  then
      rm $1
      echo "deleted $1"
  fi;
}

TMP_FILES=(
  dev.user-on-controls.json
  usersAndClientCredentials.json
)
echo "Cleaning up temporary files"
for x in ${TMP_FILES[@]};
do
  rmIfExists $(PWD)/$x
done;
