module.exports = {
    aws: {
        database: require("./aws/dynamoDb"),
        func: require("./aws/lambda"),
        store: require("./aws/s3")
    }
}