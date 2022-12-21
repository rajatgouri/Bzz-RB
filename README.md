
# BZZ-APP001 - Dockerized

## Notes
- MSSQL DB is open to 1456 port externally

## Services
Please follow  the directory structure with the following.
- Frontend
- Backend
- Database

## Repository Directory Structure

```
├── bzz-app001
│ ├── backend
│ └── frontend
└
```

## Deploy

### Recommended versions
- docker = 19.03.12 or above
- docker-compose = 1.28.2 or above
- on windows machines using `wsl2` with `docker desktop` provide better performance than legacy `hyper V` backends

### Single Instance (For development purpose)
##### 1. Build
run ``docker-compose -f docker-compose.yml build``
##### 2. Start Services
run ``docker-compose -f docker-compose.yml up -d``
##### 3. Stop Services
run ``docker-compose -f docker-compose.yml down``


#### API 
REST api is available via [localhost:8000/api/{path}](http://localhost:8000/api/)

#### Web Application
Web app can be access via [localhost:8000](http://localhost:8000)

## Database Connection
Find the following in `docker-compose.yml`
```java 
15 environment:
16  DB_SERVER: <db-server>
17  DB_PORT: <db-port>
18  DB_NAME: <db-name>
19  DB_USERNAME: <db-username>
20  DB_PASSWORD: <db-password>
```
Change the above variables with the DB connection information.

---
### Additional Instructions
#### Installation of Docker / Docker Compose
##### Ubuntu (Recommended)
##### 1. Install Docker Engine
1. Update the apt package index and install packages to allow apt to use a repository over HTTPS::
 ``` 
sudo apt-get update

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```
2. Add Docker’s official GPG key::
 `` curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg``
 1. Update the apt package index and install packages to allow apt to use a repository over HTTPS::
 ``` 
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

```
 4. Install Docker Engine
 ``` 
 sudo apt-get update
 
 sudo apt-get install docker-ce docker-ce-cli containerd.io

sudo apt-get install docker-ce=18.06.3~ce~3-0~ubuntu docker-ce-cli=18.06.3~ce~3-0~ubuntu containerd.io
  ```
   5. Verify that Docker Engine is installed correctly by running the `hello-world` image.
 ``sudo docker run hello-world``


If the installation failed, follow the [Official instructions](https://docs.docker.com/engine/install/ubuntu/)

##### 2. Install Docker Compose
  1. Run this command to download the current stable release of Docker Compose:
 ``sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose``
 2. Apply executable permissions to the binary:
``sudo chmod +x /usr/local/bin/docker-compose``
 3. Test the installation.
 ``$ docker-compose --version``
  
If the installation failed, follow the [Official instructions](https://docs.docker.com/compose/install/) and click Linux
 ##### Windows
 - Follow the [Official instructions](https://docs.docker.com/docker-for-windows/install/)
