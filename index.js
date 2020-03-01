
const platforms = require("./platforms/index");
const regions = require("./settings/regions");

module.exports = class services {
    constructor(settings) {
        if(!settings) throw Error("No settings defined");
        this.settings = !!settings;
        this.platform = settings.platform;
        this.region = settings.region;

        this.database = new platforms[this.platform].database(regions[this.platform][this.region])
        this.func = new platforms[this.platform].func()
    }
    RES = (body, statusCode) => ({
        statusCode: statusCode || (body ? 200 : 204),
        body: body || "",
        headers: { 
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Max-Age": "86400"
        }
    })
    tools = {
        objectSum: (object, maxValue) => {const sum = Object.keys(object).map(key => object[key]).reduce((a, b) => a + b); return sum > maxValue ? maxValue : sum},
        removeEmpty: (object) => {
            Object.keys(object).forEach(key => {
                if (object[key] && typeof object[key] === 'object') this.tools.removeEmpty(object[key]);
                else if (object[key] === undefined) delete object[key];
            });
            return object;
        }
    }
}