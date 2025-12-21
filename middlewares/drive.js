import fs from "fs";
import {google} from "googleapis";

import apiKeys from './apiKeys.js';

const scope = ['https://www.googleapis.com/auth/drive'];

async function authorize() {
    const jwtClient = new google.auth.JWT(
        apiKeys.client_email,
        null,
        apiKeys.private_key,
        scope
    );

    await jwtClient.authorize();

    return jwtClient;
}

async function uploadFile(authClient) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({version: 'v3', auth: authClient});
        
        var fileMetadata = {
            name:"",
            parents: ["1zcs9zXH2Js0D4jThn-9x4gm-v3c2bmzY"]
        };drive.files.create({
            resource: fileMetadata,
            media: {
                body: fs.createReadStream('test.txt'),
                mimeType: 'text/plain'
            },
            fields: 'id'
        }, (err, file) => {
            if (err) {
                // Handle error
                console.error(err);
                reject(err);
            } else {
                console.log('File Id: ', file.data.id);
                resolve(file.data.id);
            }
        });
    });
}

authorize().then(uploadFile).catch(console.error);