ng build
rm -Rf ./www/*
cp -R ./dist/myost-front/* ./www
npx cap copy android
npx cap update
npx capacitor-assets generate
npx cap open android
