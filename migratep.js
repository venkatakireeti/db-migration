const MongoClient = require("mongodb").MongoClient;
const fetch = require("node-fetch");

const uri =
    "mongodb://localhost:27017/";

const client = new MongoClient(uri, {
    tlsCAFile: `rds-combined-ca-bundle.pem`,
});
async function run() {
    try {
        let jsonTokenGlobal = "";
        fetch("https://auth.gamesparks.net/restv2/auth/user", {
            method: "get",
            headers: {
                Authorization: "Basic dmVua2F0YUBnZXRsdWNreXZyLmNvbTpWZW5rYXRhQDEw",
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                fetch(
                    "https://config2.gamesparks.net/restv2/game/t350859C2j0K/config/~properties",
                    {
                        method: "get",
                        headers: {
                            "X-GSAccessToken": json["X-GSAccessToken"],
                            "Content-Type": "application/json",
                        },
                    }
                )
                    .then((res) => res.json())
                    .then(async (jsonData) => {
                        
                        for (let index = 0; index < jsonData.length; index++) {
                                let element = jsonData[index];
                                await client.connect();
                                const database = client.db("news");
                                const collectionGSs = database.collection('properties');
                                const query = {
                                    propertyName: element.shortCode,
                                    data: element.value
                                };
                                console.log(query);
                                
                           
                        }
                    });
            })
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);
