mysqldump -uroot -ppassw0rd memory > memory_back.sql
mysql -uroot -ppassw0rd -e "drop database IF EXISTS memory"
mysql -uroot -ppassw0rd -e "create database IF NOT EXISTS memory"
mysql -uroot -ppassw0rd memory < memory.sql	
pause