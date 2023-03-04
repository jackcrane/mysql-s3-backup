import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import dotenv from "dotenv";
import { createReadStream, readFileSync, unlink, writeFileSync } from "fs";
dotenv.config();
import moment from "moment";
import path from "path";
import https from "https";

let S3_ENDPOINT = process.env.S3_ENDPOINT;
let S3_REGION = process.env.S3_REGION;
let S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
let S3_SECRET_KEY = process.env.S3_SECRET_KEY;
let S3_BUCKET = process.env.S3_BUCKET;
let BACKUP_RETENTION = process.env.BACKUP_RETENTION;
let MYSQL_HOST = process.env.MYSQL_HOST;
let MYSQL_USER = process.env.MYSQL_USER;
let MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
let DATABASES = JSON.parse(process.env.DATABASES);
let PREFIX = process.env.PREFIX;
let DELETE_LOCAL_BACKUP = process.env.DELETE_LOCAL_BACKUP || true;
let MONITORING_WEBHOOK = process.env.MONITORING_WEBHOOK;

const method = process.argv[2]?.split("=")[1];
switch (method) {
  case "ENV":
    break;
  case "cli":
    S3_ENDPOINT = process.argv[3];
    S3_REGION = process.argv[4];
    S3_ACCESS_KEY = process.argv[5];
    S3_SECRET_KEY = process.argv[6];
    S3_BUCKET = process.argv[7];
    BACKUP_RETENTION = process.argv[8];
    MYSQL_HOST = process.argv[9];
    MYSQL_USER = process.argv[10];
    MYSQL_PASSWORD = process.argv[11];
    DATABASES = JSON.parse(process.argv[12]);
    PREFIX = process.argv[13];
    DELETE_LOCAL_BACKUP = process.argv[14] || true;
    break;
  case "file":
    const f = readFileSync(process.argv[3], "utf8");
    const json = JSON.parse(f);
    S3_ENDPOINT = json.S3_ENDPOINT;
    S3_REGION = json.S3_REGION;
    S3_ACCESS_KEY = json.S3_ACCESS_KEY;
    S3_SECRET_KEY = json.S3_SECRET_KEY;
    S3_BUCKET = json.S3_BUCKET;
    BACKUP_RETENTION = json.BACKUP_RETENTION;
    MYSQL_HOST = json.MYSQL_HOST;
    MYSQL_USER = json.MYSQL_USER;
    MYSQL_PASSWORD = json.MYSQL_PASSWORD;
    DATABASES = json.DATABASES;
    PREFIX = json.PREFIX;
    DELETE_LOCAL_BACKUP = json.DELETE_LOCAL_BACKUP || true;
    break;
  default:
    console.log(
      "Invalid method. Valid methods are ENV, cli, and file. Examples:"
    );
    console.log("ENV:    npm start method=ENV");
    console.log(
      "inline: npm start method=inline S3_ENDPOINT S3_REGION S3_ACCESS_KEY S3_SECRET_KEY S3_BUCKET BACKUP_RETENTION MYSQL_HOST MYSQL_USER MYSQL_PASSWORD DATABASES"
    );
    console.log("file:   npm start method=file path/to/file.json");
    process.exit(1);
}

const s3 = new S3({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

// Generate date in format YYYY-MM-DD-HH
const date = moment().format("YYYY-MM-DD-HH-mm");

DATABASES.forEach((database) => {
  // Delete old backups. File names are in format database-YYYY-MM-DD-HH-mm.sql so we want to delete all files equal to or older than the number of hours specified in the .env file in the BACKUP_RETENTION variable.
  const params = {
    Bucket: S3_BUCKET,
    Prefix: `db_backups/${database}.sql`,
  };
  s3.listObjects(params, function (err, data) {
    if (err) throw new Error(err);
    // an error occurred
    else {
      data.Contents.forEach((file) => {
        const fileDate = moment(
          file.Key.split("-").pop().split(".")[0],
          "YYYY-MM-DD-HH-mm"
        );
        const diff = moment.duration(moment().diff(fileDate)).asHours();
        if (diff >= BACKUP_RETENTION) {
          console.log("Deleting file: " + file.Key);
          const params = {
            Bucket: S3_BUCKET,
            Key: file.Key,
          };
          s3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack);
            // an error occurred
            else console.log(data); // successful response
          });
        }
      });
    }
  });

  // Dump mysql
  exec(
    `mysqldump -h ${MYSQL_HOST} -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${database} > ${database}.sql`,
    async (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        if (
          !stderr.includes(
            "mysqldump: [Warning] Using a password on the command line interface can be insecure."
          )
        )
          return;
      }

      // Upload to s3
      const params = {
        Bucket: S3_BUCKET,
        Key: `${PREFIX}/${database}-${date}.sql`,
        Body: createReadStream(`./${database}.sql`),
      };
      try {
        const data = await s3.send(new PutObjectCommand(params));
        console.log(`Dump file for ${database} uploaded to S3. ${params.Key}`);
        if (MONITORING_WEBHOOK) {
          // Send notification to monitoring webhook
          https.get(MONITORING_WEBHOOK);
        }
      } catch (err) {
        console.log("Error", err);
      }

      if (DELETE_LOCAL_BACKUP) {
        unlink(`./${database}.sql`, (err) => {
          if (err) throw err;
        });
      }
    }
  );
});
