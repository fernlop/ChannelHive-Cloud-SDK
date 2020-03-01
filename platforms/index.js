module.exports = {
    aws: {
        database: require("./aws/dynamoDb"),
        func: require("./aws/lambda")
    }
}