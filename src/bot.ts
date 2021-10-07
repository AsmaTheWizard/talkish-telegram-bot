import { Telegraf, Context } from "telegraf";

import { BOT_TOKEN } from "./config";
import { session } from "telegraf-session-mongodb";
import { Connection } from "mongoose";
import { messages } from "./config";
import axios from "axios";
import {
  checkIfCustomerExist,
  createCustomer,
  createFeedback,
  getAllCustomers,
} from "./db";

export interface SessionContext extends Context {
  session: any;
}

const bot = new Telegraf<SessionContext>(BOT_TOKEN);

export const bot_module = (db: Connection) => {
  bot.use(
    session(db, {
      sessionName: "session",
      collectionName: "sessions",
    })
  );

  bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
  });

  bot.start((ctx) => {
    const lang = ctx.session.language || "en";
    const msg = messages.welcome_message[lang];
    ctx.session.username = ctx.message.from.username;
    ctx.session.expireAt = Date.now() + 1 * 60 * 1000;
    welcome_message(msg, ctx);
  });

  bot.action("english", (ctx) => {
    ctx.session.language = "en";
    const lang = ctx.session.language || "en";
    const msg = messages.phone_number[lang];
    ctx.reply("👍").then(() => ask_phone_number(msg, ctx, ctx.session.chatId));
  });

  bot.action("arabic", (ctx) => {
    ctx.session.language = "ar";
    const lang = ctx.session.language || "en";
    const msg = messages.phone_number[lang];
    ctx.reply("👍").then(() => ask_phone_number(msg, ctx, ctx.session.chatId));
  });

  bot.on("contact", (ctx, next) => {
    ctx.session.mobile = ctx.message.contact.phone_number;
    bot.telegram
      .sendMessage(ctx.session.chatId, "👍", {
        reply_markup: {
          remove_keyboard: true,
        },
      })
      .then(async () => {
        const lang = ctx.session.language || "en";
        let [order_one, order_two] = generateOrdersID();
        const msg = messages.orders[lang];

        createCustomerFromSession(ctx.session);
        return bot.telegram.sendMessage(
          ctx.chat.id,
          msg,
          generic_btns(order_one, "order", order_two, "order")
        );
      });
  });

  bot.action("order", (ctx) => {
    const lang = ctx.session.language || "en";
    let msg = messages.options[0].msg[lang];
    const survey = messages.options[1].survey;
    const report = messages.options[2].report;

    bot.telegram.sendMessage(
      ctx.session.chatId,
      msg,
      generic_btns(survey[lang], "survey", report[lang], "report")
    );
  });

  bot.action("survey", (ctx) => {
    const lang = ctx.session.language || "en";
    const overall = messages.survey_options[1].overall;
    let msg = messages.survey_options[0].msg[lang] + " " + overall[lang];
    bot.telegram.sendMessage(
      ctx.session.chatId,
      msg,
      generic_btns("👍", "survey_good", "👎", "survey_bad")
    );
  });

  bot.action("survey_good", (ctx) => {
    ctx.session.overall = "1";
    const lang = ctx.session.language || "en";
    const support = messages.survey_options[2].support;
    let msg = messages.survey_options[0].msg[lang] + " " + support[lang];
    bot.telegram.sendMessage(
      ctx.session.chatId,
      msg,
      generic_btns("👍", "survey_answer", "👎", "survey_answer")
    );
  });

  bot.action("survey_bad", (ctx) => {
    ctx.session.overall = "0";
    const lang = ctx.session.language || "en";
    const support = messages.survey_options[2].support;
    let msg = messages.survey_options[0].msg[lang] + " " + support[lang];
    bot.telegram.sendMessage(
      ctx.session.chatId,
      msg,
      generic_btns("👍", "support_good", "👎", "support_bad")
    );
  });

  bot.action("support_good", async (ctx) => {
    ctx.session.sup = "1";
    const lang = ctx.session.language || "en";
    const msg = messages.thank[lang];

    ctx.reply(msg + " 🤖");
    await addFeedback(ctx.session);
    //TODO: close the chat
  });

  bot.action("support_bad", async (ctx) => {
    ctx.session.sup = "0";
    const lang = ctx.session.language || "en";
    const msg = messages.thank[lang];

    ctx.reply(msg + " 🤖");

    await addFeedback(ctx.session);
    //TODO: close the chat
  });

  bot.action("report", (ctx) => {
    const lang = ctx.session.language || "en";
    let msg = messages.report_options[0].msg[lang];
    const damage = messages.report_options[1].damage;
    const shipment = messages.report_options[2].shipment;

    bot.telegram.sendMessage(
      ctx.session.chatId,
      msg,
      generic_btns(damage[lang], "damage", shipment[lang], "shipment")
    );
  });

  bot.action("damage", (ctx) => {
    const lang = ctx.session.language || "en";
    let msg = messages.damage[lang];
    ctx.reply(msg);
  });

  bot.on("photo", async (ctx) => {
    let file_path = await getImagePathName(ctx.message.photo[3].file_id, ctx);
    ctx.session.image_path = file_path;

    ctx.reply("👍").then(() => {
      const lang = ctx.session.language || "en";
      let msg = messages.team[lang];
      ctx.reply(msg);
    });
  });

  bot.action("shipment", (ctx) => {
    const lang = ctx.session.language || "en";
    let msg = messages.shipment[lang];
    ask_location(msg, ctx, ctx.session.chatId);
  });

  bot.on("location", (ctx, next) => {
    ctx.session.location = ctx.message.location;
    bot.telegram
      .sendMessage(ctx.session.chatId, "👍", {
        reply_markup: {
          remove_keyboard: true,
        },
      })
      .then(() => {
        const lang = ctx.session.language || "en";
        let msg = messages.update_location[lang];
        ctx.reply(msg);
      });
  });

  bot.command("location", (ctx) => {
    const lang = ctx.session.language || "en";
    let msg = messages.shipment[lang];
    ask_location(msg, ctx, ctx.session.chatId);
  });

  bot.on("text", (ctx) => {
    const lang = ctx.session.language || "en";
    let msg = messages.no_typing[lang];

    ctx.reply(msg + " 🤖");
  });

  bot.command("quit", (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id);
  });

  return bot;
};

const welcome_message = (msg: string, ctx: any) => {
  ctx.session.chatId = ctx.chat.id;
  return bot.telegram.sendMessage(
    ctx.chat.id,
    msg,
    generic_btns("English", "english", "عربي", "arabic")
  );
};

const ask_phone_number = (msg: string, ctx: any, chatId: string) => {
  const lang = ctx.session.language || "en";

  let requestPhoneKeyboard = getPhoneKeyboardMarkup(
    messages.ask_for_phone_btn[lang],
    messages.cancel[lang]
  );
  return bot.telegram.sendMessage(chatId, msg, requestPhoneKeyboard);
};

const ask_location = (msg: string, ctx: any, chatId: string) => {
  const lang = ctx.session.language || "en";

  let requestLocationKeyboard = getLocationKeyboardMarkup(
    messages.ask_for_location_btn[lang],
    messages.cancel[lang]
  );
  return bot.telegram.sendMessage(chatId, msg, requestLocationKeyboard);
};

//HELPER functions
const generateOrdersID = () => {
  let orders = [];
  for (var i = 0; i < 2; i++) {
    orders.push(Math.floor(Math.random() * 10000000000).toString());
  }

  return orders;
};

const getPhoneKeyboardMarkup = (text: string, cancel_text: string) => {
  return {
    reply_markup: {
      remove_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: text,
            request_contact: true,
            one_time_keyboard: true,
            remove_keyboard: true,
          },
        ],
        [cancel_text],
      ],
    },
  };
};

const getLocationKeyboardMarkup = (text: string, cancel_text: string) => {
  return {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: text,
            request_location: true,
          },
        ],
        [cancel_text],
      ],
    },
  };
};

const generic_btns = (
  fisrt_btn: string,
  first_btn_callback: string,
  second_btn: string,
  second_btn_callback: string
) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: fisrt_btn,
            callback_data: first_btn_callback,
          },
          {
            text: second_btn,
            callback_data: second_btn_callback,
          },
        ],
      ],
    },
  };
};

const getImagePathName = async (file_id: string, ctx: any) => {
  let url = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`;

  const response = await axios.get(url);
  const file_path = response.data["result"]["file_path"];
  url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file_path}`;
  const response_image = await axios.get(url);
  return url;
};

const createCustomerFromSession = async (ctx_session: any) => {
  let customer = {
    name: ctx_session["username"],
    chat_id: ctx_session["chatId"],
    mobile_number: ctx_session["mobile"],
    latitude: 0,
    longitude: 0,
  };

  if (ctx_session.hasOwnProperty("location")) {
    customer.latitude = ctx_session["location"]["latitude"];
    customer["longitude"] = ctx_session["location"]["longitude"];
  } else {
  }

  const res = await checkIfCustomerExist(customer["chat_id"]);
  if (!res) {
    await createCustomer(customer);
  }
};

const addFeedback = async (ctx_session: any) => {
  let feed = {
    chat_id: ctx_session["chatId"],
    overall: ctx_session["overall"],
    support: ctx_session["sup"],
  };

  return await createFeedback(feed);
};
