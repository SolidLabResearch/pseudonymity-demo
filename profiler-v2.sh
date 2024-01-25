N=250
DLCO_INDEX=3
npm run profile -- --dcloConfig=$DLCO_INDEX --n=$N --solution="third-party"
npm run profile -- --dcloConfig=$DLCO_INDEX --n=$N --solution="did-key"
