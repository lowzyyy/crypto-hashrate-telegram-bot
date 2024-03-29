import { Telegraf } from "telegraf";

import { getHashrateNow, getHashratesLast7D, getMinMax } from "./helpers.js";
import "../env.js";
function setTerminalTitle(title) {
  process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));
}
setTerminalTitle("Hashrate_bot");

const sleep = async (seconds) => {
  return new Promise((res) => setTimeout(res, seconds * 1000));
};
const getFinalString = async (now = false) => {
  try {
    const hsNow = await getHashrateNow();
    const { hs1H, hs3H, hs6H, hs1D, hs3D, hs7D } = await getHashratesLast7D();
    const { maxHs, minHs } = await getMinMax();
    if (now)
      return `Now: ${hsNow}\n` + `1h: ${hs1H}\n` + `3h: ${hs3H}\n` + `6h: ${hs6H}\n`;
    return (
      `6h: ${hs6H}\n` +
      `1d: ${hs1D}\n` +
      `3d: ${hs3D}\n` +
      `7d: ${hs7D}\n` +
      `Min(ever): ${minHs}\n` +
      `Max(ever): ${maxHs}`
    );
  } catch (error) {
    console.log(error);
    return "Error occured.";
  }
};
// console.log(await getFinalString());

const deleteOrSend = async (message, ctx) => {
  if (message === "Error occured.") {
    // delete after 1 minute
    const { message_id } = await ctx.sendMessage(message);
    setTimeout(() => ctx.deleteMessage(message_id), 60000);
    // if no error then send it and dont delete
  } else await ctx.sendMessage(message);
};

const bot = new Telegraf(process.env.TOKEN);
bot.command("hashrate", async (ctx) => {
  const message = await getFinalString();
  await deleteOrSend(message, ctx);
});
bot.command("hashrate_now", async (ctx) => {
  const message = await getFinalString(true);
  await deleteOrSend(message, ctx);
});

bot.launch();
