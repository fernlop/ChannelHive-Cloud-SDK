const DynamoDB = require('aws-sdk/clients/dynamodb');

// Chunk polyfill
if (!Array.prototype.chunk) {
    Array.prototype.chunk = function(size) {
        return this.reduce((chunks, el, i) => (i % size ?
            chunks[chunks.length - 1].push(el) :
            chunks.push([el])) && chunks, []);
    };
}
// Flatten polyfill 
if (!Array.prototype.flatten) {
    Array.prototype.flatten = function() {
        return this.reduce((acc, val) => acc.concat(val), []);
    };
}
// To Object polyfill
if (!Array.prototype.toObject) {
    Array.prototype.toObject = function(key) {
        let obj = {};
        this.forEach(entry => obj[entry[key]] = entry);
        return obj;
    };
}

module.exports = class dynamoDB {
    constructor(region) {
        this.DDB = new DynamoDB.DocumentClient({region});
    }
    get = async (TableName, Key) => this.DDB.get({TableName, Key}).promise().then(r => r.Item)
    put = async (TableName, Item, Expected) => this.DDB.put({TableName, Item, Expected}).promise()
    delete = async (TableName, Key) => this.DDB.delete({TableName, Key}).promise()
    update = async (TableName, Key, UpdateAttributes, Expected) => {
        let params = {
            TableName,
            Key,
            AttributeUpdates: {},
            Expected: Expected && {
                ComparisonOperator: Expected.operator, 
                AttributeValueList: Array.isArray(Expected.value) ? [Expected.value] : [[Expected.value]]
            }
        };
        Object.keys(UpdateAttributes).forEach(key => {
                if(key) {
                    (typeof key === "object" && Object.keys(key).length > 0) ?
                    params.AttributeUpdates[key] = {
                        Action: UpdateAttributes[key].action, 
                        Value: UpdateAttributes[key].value
                    }
                    :
                    params.AttributeUpdates[key] = {Action: "PUT", Value: UpdateAttributes[key]}
                }
            }
        );
        return this.DDB.update(params).promise();
    }
    batchGet = async (TableName, Keys) => (await Promise.all(Keys.chunk(25).map(Keys => this.DDB.batchGet({
        RequestItems: {[TableName]: {Keys}}}).promise().then(r => r.Responses[TableName])
    ))).flatten()
    batchPut = async (TableName, Items) => await Promise.all(Items.chunk(25).map(chunk => this.DDB.batchWrite({
        RequestItems: {[TableName]: chunk.map(Item => ({PutRequest: {Item}}))}}).promise()
    ))
    batchDelete = async (TableName, Keys) => await Promise.all(Keys.chunk(25).map(chunk => this.DDB.batchWrite({
        RequestItems: {[TableName]: chunk.map(Key => ({DeleteRequest: {Key}}))}}).promise()
    ))
    batchUpdate = async (TableName, Items) => {
        return await Promise.all(Items.map(Item => {
            let params = {
                TableName,
                Key: Item.Key,
                AttributeUpdates: {},
                Expected: Item.Expected && {
                    ComparisonOperator: Item.Expected.operator, 
                    AttributeValueList: Array.isArray(Item.Expected.value) ? [Item.Expected.value] : [[Item.Expected.value]]
                }
            };
            Object.keys(Item.UpdateAttributes).forEach(key => {
                    if(Item.UpdateAttributes[key]) {
                        (typeof key === "object" && Object.keys(key).length > 0) ?
                        params.AttributeUpdates[key] = {
                            Action: Item.UpdateAttributes[key].action, 
                            Value: Item.UpdateAttributes[key].value
                        }
                        :
                        params.AttributeUpdates[key] = {Action: "PUT", Value: Item.UpdateAttributes[key]}
                    }
                }
            );
            return this.DDB.update(params).promise();
        }))
    }
    query = async (TableName, primaryKey, settings) => {
        let params = {
            TableName,
            KeyConditions: {}
        }
        Object.keys(primaryKey).forEach(key => (typeof key === "object" && Object.keys(key).length > 0) ?
            params.KeyConditions[key] = {
                ComparisonOperator: primaryKey[key].operator, 
                AttributeValueList: Array.isArray(primaryKey[key].value) ? [primaryKey[key].value] : [[primaryKey[key].value]]
            }
            :
            params.KeyConditions[key] = {ComparisonOperator: "EQ", AttributeValueList: [primaryKey[key]]}
        );
        if(settings) {
            if(settings.index) params.Index = settings.index;
            if(settings.limit) params.Limit = settings.limit;
            if(settings.startKey) params.ExclusiveStartKey = settings.startKey;
            if(settings.forward) params.ScanIndexForward = settings.forward;
            if(settings.attributes) params.AttributesToGet = settings.attributes;
        }
        return this.DDB.query(params).promise().then(r => r.Items);
    }
    scan = async (TableName, scanKeys, settings) => {
        let params = {
            TableName,
            ScanFilter: {}
        }
        Object.keys(scanKeys).forEach(key => (typeof key === "object" && Object.keys(key).length > 0) ?
            params.ScanFilter[key] = {
                ComparisonOperator: scanKeys[key].operator, 
                AttributeValueList: Array.isArray(scanKeys[key].value) ? [scanKeys[key].value] : [[scanKeys[key].value]]
            }
            :
            params.ScanFilter[key] = {ComparisonOperator: "EQ", AttributeValueList: [scanKeys[key]]}
        );
        if(settings) {
            if(settings.index) params.IndexName = settings.index;
            if(settings.limit) params.Limit = settings.limit;
            if(settings.startKey) params.ExclusiveStartKey = settings.startKey;
            if(settings.condition) params.ConditionalOperator = settings.condition;
            if(settings.attributes) params.AttributesToGet = settings.attributes;
            if(settings.consistent) params.ConsistentRead = settings.consistent;
        }
        return this.DDB.query(params).promise().then(r => r.Items);
    }
}