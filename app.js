const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const cors = require("cors");
const axios = require("axios");
const origins = [
  "http://localhost:3000",
  "https://sasa30.com",
  "https://chikaba.netlify.app",
];
app.use(
  cors({
    origin: origins, //アクセス許可するオリジン
    credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
    optionsSuccessStatus: 200, //レスポンスstatusを200に設定
  })
);

app.get("/", (req, res) => res.send("Hello"));

// http://localhost:3001/api/shopList
app.get("/api/shopList", (req, res) => {
  const HOTPEPPER_API_KEY = "a6972642ce7d9bcd";
  const HOTPEPPER_BASE_URL =
    "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/";
  /**
   * 第一引数の値が空かどうかを判別します。
   * 結果によってreturnの値が変わります。
   * @param {*} checkValue - 空をチェックしたい値
   * @param {*} returnValue - 空ではなかった時に返したい値
   * @returns - 空だった場合は""、空ではなかった場合はreturnValue
   */
  const checkBrank = (checkValue, returnValue) => {
    if (checkValue) {
      return returnValue;
    } else {
      return "";
    }
  };
  const reqLat = req.query.lat;
  const reqLng = req.query.lng;
  const reqGenre = req.query.genre;
  const setParamLat = checkBrank(reqLat, `&lat=${reqLat}`);
  const setParamLng = checkBrank(reqLng, `&lng=${reqLng}`);
  const setParamGenre = checkBrank(reqGenre, `&genre=${reqGenre}`);

  const requestUrl = `${HOTPEPPER_BASE_URL}?key=${HOTPEPPER_API_KEY}&${setParamLat}&${setParamLng}&${setParamGenre}&format=json`;

  if (!setParamLat || !setParamLng) {
    res.json("パラメーターの指定が不足しています。");
  }
  console.log(requestUrl);

  axios
    .get(requestUrl)
    // thenで成功した場合の処理
    .then((response) => {
      const shopsData = response.data.results.shop;
      const responseShopList = shopsData.map((item) => ({
        itemId: item.id,
        photo: item.photo.pc.l,
        shopName: item.name,
        lunch: item.lunch,
        budgetName: item.budget.name,
        address: item.address,
        access: item.access,
        smoking: item.non_smoking,
        catch: item.catch,
      }));
      res.json(responseShopList);
    })
    // catchでエラー時の挙動を定義
    .catch((err) => {
      console.log(err);
      res.json({ message: "サーバーエラーです。" });
    });
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
