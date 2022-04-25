const MongoClient = require("mongodb").MongoClient;
const fetch = require("node-fetch");
const bson = require('bson');

const uri =
  "mongodb://localhost:27017/";

const client = new MongoClient(uri);

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
        console.log(json);
        fetch(
          "https://auth.gamesparks.net/restv2/auth/game/t350859C2j0K/jwt/nosql",
          {
            method: "get",
            headers: {
              "X-GSAccessToken": json["X-GSAccessToken"],
              "Content-Type": "application/json",
            },
          }
        )
          .then((res) => res.json())
          .then((jsonToken) => {
            jsonTokenGlobal = jsonToken;
            fetch(
              "https://t350859c2j0k.preview.cluster.gamesparks.net/restv2/game/t350859C2j0K/mongo/collections",
              {
                method: "get",
                headers: {
                  "X-GS-JWT": jsonToken["X-GS-JWT"],
                  Accept: "application/json",
                },
              }
            )
              .then((res) => res.json())
              .then(async (jsonData) => {
                for (let index = 0; index < jsonData.length; index++) {
                  const element = jsonData[index];

                    console.log(element.name);
                    await fetch(
                      `https://t350859c2j0k.preview.cluster.gamesparks.net/restv2/game/t350859C2j0K/mongo/collection/${element.name}/find`,
                      {
                        method: "POST",
                        body: JSON.stringify({
                          "fields": {},
                          "limit": 0,
                          "query": {},
                          "skip": 0,
                          "sort": {}
                        }),
                        headers: {
                          "X-GS-JWT": jsonTokenGlobal["X-GS-JWT"],
                          "Content-Type": "application/json",
                          "Accept": "application/json",
                        },
                      }
                    ).then((res) => res.json())
                      .then(async (jsonDataCollection) => {
                        if (jsonDataCollection.length > 0) { 
                        await client.connect();
                        const database = client.db("gs");
                        const collectionGSs = database.collection(element.name);
                        const query = jsonDataCollection;
                        const collectionGS = await collectionGSs.insertMany(bson.EJSON.parse(JSON.stringify(query)));
                        await client.close();
                        return collectionGS;
                        } else {
                          console.log("No data");
                          return;
                        }
                      }).then((collectionGS) => {
                        console.log(collectionGS);
                        return collectionGS;
                      });
                      console.log("hello");
                  

                }
              });
          });
      });
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);
