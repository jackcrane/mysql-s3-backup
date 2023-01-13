# mysql-s3-backup

The effortless MySQL backup to S3.

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
  "PREFIX": "db_backup"
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

| Variable         | Description                                                                                                  | Type               |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| S3_ENDPOINT      | The endpoint of the S3 bucket                                                                                | String             |
| S3_ACCESS_KEY    | The access key of the S3 bucket                                                                              | String             |
| S3_SECRET_KEY    | The secret key of the S3 bucket                                                                              | String             |
| S3_BUCKET        | The name of the S3 bucket                                                                                    | String             |
| S3_REGION        | The region of the S3 bucket                                                                                  | String             |
| MYSQL_HOST       | The host of the MySQL server                                                                                 | String             |
| MYSQL_USER       | The user of the MySQL server                                                                                 | String             |
| MYSQL_PASSWORD   | The password of the MySQL server                                                                             | String             |
| DATABASES        | The databases to backup                                                                                      | JSON-encoded array |
| BACKUP_RETENTION | The age of backups to retain. This script is meant to run hourly, so setting 96 would keep 96 hourly backups | Number             |
| PREFIX           | The prefix of the backup files                                                                               | String             |
