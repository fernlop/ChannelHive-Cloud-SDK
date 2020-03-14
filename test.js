const connect = new (require("./index"))({platform: "aws", region: "eu-fra"});


(async () => {
    try {
        // const res = await connect.database.batchGet("Connect_Products", [{owner:"tester", id: 7}, {owner:"tester", id: 8}]);
        await connect.store.put("test.json", "lalala", "corona-2019-data")
    } catch (e) {
        console.log(e);
    }
})();
