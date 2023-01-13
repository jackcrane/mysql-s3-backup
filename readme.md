# mysql-s3-backup

The effortless MySQL backup to S3.

## Deploying

### Easy

The easiest way to deploy this script is to pull the Docker image from Docker Hub:

```bash
docker pull jackcranee/mysql-s3-backup:0.1
docker run jackcranee/mysql-s3-backup:0.1
```

Then run the image with the environment variables. **NOTE: The docker image ONLY supports environment variables.**

### Hard

This script can be run on any server with Node.js. Git clone this repository, then run `npm install` to install the dependencies. Then run the script using the methods below.

### Kubernetes

This script can be run on Kubernetes. The following is an example of a Kubernetes deployment:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-s3-backup
spec:
  schedule: "0 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: node-app
              image: jackcranee/mysql-s3-backup:0.1
              command: ["npm", "start", "method=ENV"]
              env:
                - name: S3_ENDPOINT
                  value: https://nyc3.digitaloceanspaces.com
                - name: S3_ACCESS_KEY
                  value: DO00NJAX___KE98ENG6E
                - name: S3_SECRET_KEY
                  value: 8CvRkYNv2qoy___2d2VFzwo/hGJSJ4___zJ5/0___14
                - name: S3_BUCKET
                  value: jack-general
                - name: S3_REGION
                  value: us-east-1
                - name: MYSQL_HOST
                  value: db.example.com
                - name: MYSQL_USER
                  value: root
                - name: MYSQL_PASSWORD
                  value: password
                - name: DATABASES
                  value: '["db1","db2"]'
                - name: BACKUP_RETENTION
                  value: "96"
                - name: PREFIX
                  value: db_backup
          restartPolicy: OnFailure
```

## Running

There are 3 ways of running this utility, definitions are at the bottom of this section:

## Using Environment Variables

```bash
npm start method=ENV
```

Env file template:

```env
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_ACCESS_KEY=DO00NJAX___KE98ENG6E
S3_SECRET_KEY=8CvRkYNv2qoy___2d2VFzwo/hGJSJ4___zJ5/0___14
S3_BUCKET=jack-general
S3_REGION=us-east-1
MYSQL_HOST=db.example.com
MYSQL_USER=root
MYSQL_PASSWORD=password
DATABASES=["db1","db2"]
BACKUP_RETENTION=96
PREFIX=db_backup
DELETE_LOCAL_BACKUP=true
```

## Using a Config File

```bash
npm start method=FILE ./config.json
```

Config file template:

````json
{
  "S3_ENDPOINT": "https://nyc3.digitaloceanspaces.com",
  "S3_ACCESS_KEY": "DO00NJAX___KE98ENG6E",
  "S3_SECRET_KEY": "8CvRkYNv2qoy___2d2VFzwo/hGJSJ4___zJ5/0___14",
  "S3_BUCKET": "jack-general",
  "S3_REGION": "us-east-1",
  "MYSQL_HOST": "db.example.com",
  "MYSQL_USER": "root",
  "MYSQL_PASSWORD": "password",
  "DATABASES": ["db1", "db2"],
  "BACKUP_RETENTION": 96,
  "PREFIX": "db_backup",
  "DELETE_LOCAL_BACKUP": true
}

## Using inline arguments

```bash
npm start method=inline S3_ENDPOINT S3_REGION S3_ACCESS_KEY S3_SECRET_KEY S3_BUCKET BACKUP_RETENTION MYSQL_HOST MYSQL_USER MYSQL_PASSWORD DATABASES PREFIX
````

Example:

```bash
node app.js method=cli https://nyc3.digitaloceanspaces.com us-east-1 DO00NJAX___KE98ENG6E 8CvRkYNv2qoy___2d2VFzwo/hGJSJ4___zJ5/0___14 jack-general 96 db.endpoint.com root password '["db1", "db2"]' db_backups
```

## Definitions

| Variable            | Description                                                                                                  | Type               |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| S3_ENDPOINT         | The endpoint of the S3 bucket                                                                                | String             |
| S3_ACCESS_KEY       | The access key of the S3 bucket                                                                              | String             |
| S3_SECRET_KEY       | The secret key of the S3 bucket                                                                              | String             |
| S3_BUCKET           | The name of the S3 bucket                                                                                    | String             |
| S3_REGION           | The region of the S3 bucket                                                                                  | String             |
| MYSQL_HOST          | The host of the MySQL server                                                                                 | String             |
| MYSQL_USER          | The user of the MySQL server                                                                                 | String             |
| MYSQL_PASSWORD      | The password of the MySQL server                                                                             | String             |
| DATABASES           | The databases to backup                                                                                      | JSON-encoded array |
| BACKUP_RETENTION    | The age of backups to retain. This script is meant to run hourly, so setting 96 would keep 96 hourly backups | Number             |
| PREFIX              | The prefix of the backup files                                                                               | String             |
| DELETE_LOCAL_BACKUP | Whether to delete the local backup after uploading to S3                                                     | Boolean            |
