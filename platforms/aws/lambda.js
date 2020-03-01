const Lambda = require('aws-sdk/clients/lambda');

module.exports = class lambda {
    constructor() {
        this.LAM = new Lambda();
    }
    invoke = async (FunctionName, Payload, InvocationType) => this.LAM.invoke({FunctionName, InvocationType: InvocationType || "RequestResponse", Payload}).promise().then(r => JSON.parse(r.Payload))
    invokeAsync = async (FunctionName, InvokeArgs) => this.LAM.invokeAsync({FunctionName, InvokeArgs}).promise()
    
}