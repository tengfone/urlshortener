# URL Shortener
Things to note:
Long URL: 2kb (2048char)
Short URL: 255 Bytes (255char)
Created Time: 4 Bytes (int)
Expire: 4 Bytes (int)

If ShortURL is empty, generate using B62. A-Z,a-z,0-9

Database:
ShortURL [varchar(255)] PRIMARY KEY
LongURL [varchar(2048)]
TimeCreated [int(11)]
TimeExpire [int(11)]
CREATE TABLE IF NOT EXISTS `url` (ShortURL varchar(255) NOT NULL PRIMARY KEY,LongURL varchar(2048) NOT NULL,TimeCreated int(11) NOT NULL,TimeExpire int(11) NOT NULL);

.env:REACT_APP_URL_API=xxxxx