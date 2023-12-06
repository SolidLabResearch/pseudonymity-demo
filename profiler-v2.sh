N=300
DLCO_INDEX=0
npm run profile -- --dcloConfig=$DLCO_INDEX --n=$N --solution="third-party"
npm run profile -- --dcloConfig=$DLCO_INDEX --n=$N --solution="did-key"
