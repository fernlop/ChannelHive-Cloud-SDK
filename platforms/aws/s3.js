const S3Client = require('aws-sdk/clients/s3');

module.exports = class S3 {
    constructor() {
        this.S3 = new S3Client();
    }
    put = async (Key, Body, Bucket) => this.S3.putObject({Key, Body, Bucket}).promise()
    
}