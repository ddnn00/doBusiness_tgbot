import { Telegraf } from "telegraf";
import mysql from "mysql";

var connection = mysql.createConnection({
  host: "141.8.196.54",
  user: "grek7771_testbd",
  password: "testbd",
  database: "grek7771_testbd",
});
connection.connect();

const bot = new Telegraf("1820848598:AAFodpdUPNFB3fT2rDZkGrkuDcPu7Ax-QGo");

// bot.command("quit", (ctx) => {
//   // Explicit usage
//   ctx.telegram.leaveChat(ctx.message.chat.id);

//   // Using context shortcut
//   ctx.leaveChat();
// });

bot.on("text", (ctx) => {
  let chatId = ctx.message.chat.id;

  if (ctx.message.text == "help") {
    ctx.telegram.sendMessage(
      chatId,
      "getAllBusiness - Получить все дела\n" +
        "getLastLogByBusinessId [Номер дела] - Получить последнюю запись по делу\n" +
        "addBusiness [Название дела] - Добавить дело\n" +
        "addLogForBusiness [Описание] [Номер дела] - Добавить запись к делу"
    );
  }

  if (ctx.message.text == "getAllBusiness") {
    let query =
      "SELECT * FROM affairs WHERE ChatId = " + chatId + " ORDER BY Id";

    connection.query(query, function (error, results, fields) {
      if (error) throw error;

      results.map((element) => {
        ctx.telegram.sendMessage(chatId, element.Id + ". " + element.Name);
      });
    });
  }

  if (ctx.message.text.indexOf("getLastLogByBusinessId") != -1) {
    let affairId = ctx.message.text.split(" ")[1];

    let query =
      "SELECT * FROM affairsLog WHERE AffairId = " + affairId + " ORDER BY Id";

    connection.query(query, function (error, results, fields) {
      if (error) throw error;

      if (results.length == 0) {
        ctx.telegram.sendMessage(
          chatId,
          "По запрашиваему делу нет информации!"
        );
      } else {
        ctx.telegram.sendMessage(
          chatId,
          results[results.length - 1].Description
        );
      }
    });
  }

  if (ctx.message.text.indexOf("addBusiness") != -1) {
    let affairName = ctx.message.text.split(" ")[1];

    let query =
      "INSERT affairs(Name, ChatId) VALUES ('" +
      affairName +
      "', " +
      chatId +
      ");";

    connection.query(query, function (error, results, fields) {
      if (error) throw error;

      ctx.telegram.sendMessage(chatId, "Дело добавлено!");
    });
  }

  if (ctx.message.text.indexOf("addLogForBusiness") != -1) {
    let description = ctx.message.text.split(" ")[1];
    let affairId = ctx.message.text.split(" ")[2];

    let query =
      "INSERT affairsLog(Description, AffairId) VALUES ('" +
      description +
      "', " +
      affairId +
      ");";

    connection.query(query, function (error, results, fields) {
      if (error) throw error;

      ctx.telegram.sendMessage(chatId, "Описание добавлено!");
    });
  }
});

// bot.on("callback_query", (ctx) => {
//   // Explicit usage
//   ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

//   // Using context shortcut
//   ctx.answerCbQuery();
// });

// bot.on("inline_query", (ctx) => {
//   const result = [];
//   // Explicit usage
//   ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

//   // Using context shortcut
//   ctx.answerInlineQuery(result);
// });

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
