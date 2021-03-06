import { Telegraf } from "telegraf";
import mysql from "mysql";

const dbConfig = {
  host: "141.8.196.54",
  user: "grek7771_testbd",
  password: "testbd",
  database: "grek7771_testbd",
};

let connection = null;
function dbConnectionHandler() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(function (error) {
    if (error) {
      console.log("Database connection failed:", error);
      setTimeout(dbConnectionHandler, 2000);
    } else {
      console.log("Database connection successful!");
    }
  });

  connection.on("error", function (error) {
    console.log("DB error:", error);
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      dbConnectionHandler();
    } else {
      throw err;
    }
  });
}
dbConnectionHandler();

const bot = new Telegraf("KEY");

bot.on("text", (ctx) => {
  let chatId = ctx.message.chat.id;

  // if (ctx.message.text == "help") {
  //   ctx.telegram.sendMessage(
  //     chatId,
  //     "getAllBusiness - Получить все дела\n" +
  //       "getLastLogByBusinessId [Номер дела] - Получить последнюю запись по делу\n" +
  //       "addBusiness [Название дела] - Добавить дело\n" +
  //       "addLogForBusiness [Описание] [Номер дела] - Добавить запись к делу"
  //   );
  // }

  if (ctx.message.text == "getAllBusiness") {
    let query =
      "SELECT * FROM affairs WHERE ChatId = " + chatId + " ORDER BY Id";

    connection.query(query, function (error, results, fields) {
      if (error) {
        console.log(error);
        ctx.telegram.sendMessage(
          chatId,
          "Возникла ошибка, попробуйте еще раз!"
        );
        dbConnectionHandler();
      } else {
        let allBusiness = "";
        results.map((element) => {
          allBusiness += element.Id + ". " + element.Name + "\n";
        });
        ctx.telegram.sendMessage(chatId, allBusiness);
      }
    });
  }

  // if (ctx.message.text.indexOf("getLastLogByBusinessId") != -1) {
  //   let affairId = ctx.message.text.split(" ")[1];

  //   let query =
  //     "SELECT * FROM affairsLog WHERE AffairId = " + affairId + " ORDER BY Id";

  //   connection.query(query, function (error, results, fields) {
  //     if (error) throw error;

  //     if (results.length == 0) {
  //       ctx.telegram.sendMessage(
  //         chatId,
  //         "По запрашиваему делу нет информации!"
  //       );
  //     } else {
  //       ctx.telegram.sendMessage(
  //         chatId,
  //         results[results.length - 1].Description
  //       );
  //     }
  //   });
  // }

  // if (ctx.message.text.indexOf("addBusiness") != -1) {
  //   let affairName = ctx.message.text.split(" ")[1];

  //   let query =
  //     "INSERT affairs(Name, ChatId) VALUES ('" +
  //     affairName +
  //     "', " +
  //     chatId +
  //     ");";

  //   connection.query(query, function (error, results, fields) {
  //     if (error) throw error;

  //     ctx.telegram.sendMessage(chatId, "Дело добавлено!");
  //   });
  // }

  // if (ctx.message.text.indexOf("addLogForBusiness") != -1) {
  //   let description = ctx.message.text.split(" ")[1];
  //   let affairId = ctx.message.text.split(" ")[2];

  //   let query =
  //     "INSERT affairsLog(Description, AffairId) VALUES ('" +
  //     description +
  //     "', " +
  //     affairId +
  //     ");";

  //   connection.query(query, function (error, results, fields) {
  //     if (error) throw error;

  //     ctx.telegram.sendMessage(chatId, "Описание добавлено!");
  //   });
  // }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
