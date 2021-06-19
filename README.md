# MicroURL 🔗
##### [Demo](http://18.209.180.216)
##### Shorten a URL 
##### GovTech Takehome Assignment 
---
## Table of Contents
* [Prerequisites](#Prerequisites)
* [Description](#Description)
* [System Design](#system-design)
* [Setup](#Setup)
  + [FrontEnd](#frontend)
  + [BackEnd](#backend)
  + [MySQL](#mysql)
* [Preview](#Preview)
* [FrontEnd](#FrontEnd)
* [BackEnd](#backend)
* [Test Cases](#testcase)
* [Summary](#summary)
## Prerequisites
Run either via Cloud or Locally
### Local:
- A Computer
### Cloud:
- [AWS Account](https://aws.amazon.com/account/) || [AWS EC2 Instance](https://aws.amazon.com/ec2/) || AWS Ubuntu 20.x
### Technology Stack Required:
- [NodeJS (Express)](https://expressjs.com/)
- [ReactJS](https://facebook.github.io/react/)
- [MySQL](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04)
## Description
1. Create a backend API server (of any preferred tech stack) to be able handle the conversion of a given URL to a shortened version of the URL
2. Create a frontend application (of any preferred tech stack) that allows users to submit a request to convert a URL, and prints the converted URL to the screen
3.  Store the converted URL in a relational database (of your choice)

## System Design
Before starting the assignment, I had planned to do it in this way (refer to image below).

However, it was an issue as I met with plenty of security protocol issues such as invalid certification signing as there was a difference in my backend server running in HTTP and the web deployed sites (Heroku/Vercel) using HTTPS. 

The reason why I wanted to use Heroku and Vercel was because they provide a nice looking URL link eg microurl.vercel.app/microurl.heroku.app etc and also it has CI/CD deployment, after a push to the Github everything is done and automated for me.

However after much struggle due to time constraints, I have decided to serve this entire assignment on a single AWS EC2 small Ubuntu 20.x. The SQL server will be listening on port 3306, the front end will be running via NGINX port 80 and the backend API server will be on port 3001. 

<img src="./screenshots/archdesign.jpg" width="400" height="400">

## Setup
### Frontend 
Either on local or cloud 
```
git clone https://github.com/tengfone/urlshortener
cd urlshortener
npm install
```
Please ensure that you have a ```.env``` file located at the root directory that consist of the following params:
```
REACT_APP_URL_API=YOURBACKENDAPIHERE
```
Then you can ```npm run start``` to start the frontend server.
### Backend
Either on local or cloud
```
git clone https://github.com/tengfone/urlshortener_be
cd urlshortener_be
npm install
```
Please ensure that you have a ```.env``` file located at the root directory that consist of the following params:
```
HOST=YOURDBHOSTURL
USER=YOURDBUSER
PASSWORD=YOURDBPASSWORD
DB=YOURDBNAME
PORT=3306
```
Then you can ```node server.js``` to start the backend server.

### MySQL
Ensure you have one user with permission to write on the database. Create a database with the following table called ```url```. The commands are as follows:

```
CREATE TABLE url (  
ShortURL varchar(255) PRIMARY KEY NOT NULL, 
LongURL varchar(2048) NOT NULL,  
TimeCreated timestamp NOT NULL,  
TimeExpire timestamp NOT NULL
);
```
## Preview

Update when CSS is final

## FrontEnd
The front end is written using ReactJS [here](https://github.com/tengfone/urlshortener) and certain libraries which can be found [here](https://github.com/tengfone/urlshortener/blob/main/package.json). 

I have modularize the Web App shown below:
```
.
+-- .env
+-- public
|   +-- favicons
|   +-- ...
+-- src
|   +-- assets
|		+-- fonts
|		+-- url.svg
|   +-- components
|		+-- Header.js
|		+-- Header.css
|	+-- pages
|		+-- Homepage.js
|		+-- ...
|	+-- App.js
|	+-- ...
+-- package.json
+-- ...
```

I have written all of the pages as a functional component. However it is also good to note that I am using Bootstrap to provide minimal styling to the website. 
## BackEnd
The front end is written using NodeJS running Express [here](https://github.com/tengfone/urlshortener_be) 

The Backend has also been modularized so as to easily append new method APIs in the future. However, it is noted that currently I am serving the backend using http and not https, this is because I can only self-sign the certificate and certain browsers rejects self-signed API calls. To solve this problem is a matter of having a signed certificate. However due to time constraints, I will just serve the API via http.

## MySQL
Using a relational database, I have chosen MySQL as I am alittle more familiar with MySQL. I have hosted MySQL on the AWS EC2 Small Server running Ubuntu 20.x. The data structure of MySQL is as follows: 
- Long URL: 2kb (2048char)
- Short URL: 255 Bytes (255char) [PRIMARY KEY] *
- Created Time: 4 Bytes (timestamp)
- Expire: 4 Bytes (timestamp)

The reason behind this structure is first of all there are a couple of factors to consider. Although MySQL has a feature whereby it is able to find duplicate primary keys, it does not guarantee concurrency, as such if say there are 2 App Servers making a request to place both similar primary key value into the server, there might be undesired results. To solve this issue, I would propose the use of ZooKeeper to make it a distributed system. However, seeing the scale of this assignment, I believe that this set up is more than enough

For the Primary Key (ShortURL), if a user does not specify an alias, it will generate a random 8 character ShortURL using B62 encoding. A-Z,a-z,0-9. I have also capped the user input for the ShortURL to 10 characters max. The LongURL has a maximum of 2048 character as that is the maximum characters a URL can have. 

## Testcase

todo

## Summary
Something new I took back was the SSL issues with both front end and backend. For the front end, if the application is not running on a HTTPS server, you are not allowed to use the inbuild Javascript functions like copying to clipboard and you cannot call an API request whist the certificate is not valid. On the backend, you can manually self-sign the certificate but it seems like majority of the browser are able to detect that and prevent any connection to your backend server. 

Features that can be improved on but not implemented. The MySQL have a field known as TimeExpire that expires 30 days after the URL has been created. A script can be written or even done on the client side when searching for the ShortURL slug. 