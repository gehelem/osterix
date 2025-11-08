ng build
sudo rm -Rf /var/www/ostserver/*	 
sudo cp -R ./dist/osterix-front/* /var/www/ostserver
sudo chown -R www-data /var/www/ostserver/
sudo service nginx restart
