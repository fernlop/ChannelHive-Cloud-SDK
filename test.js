const connect = new (require("./index"))({platform: "aws", region: "eu-fra"});


(async () => {
    try {
        const res = await connect.database.batchGet("Connect_Products", [{owner:"tester", id: 7}, {owner:"tester", id: 8}]);
        console.log(res[0].name);
        console.log(res[1].name);
    } catch (e) {
        console.log(e);
    }
})();
