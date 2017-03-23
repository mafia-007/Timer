'use strict';

var TelegramBot = require('node-telegram-bot-api');
var Tools = require('./tools.js');
var config = require('./config.js');

var bot = new TelegramBot(config.token, {polling: {timeout: 1, interval: 100}});
var timeouts = {};

function build_inline_result (timeout, msg) {
  var btn = {inline_keyboard: [[{text: 'Timer', callback_data: ${timeout;}}]]}
  var result_text = {message_text: msg.query}
  var result = {
    type: 'article',
    id: `${timeout}`,
    title: `${timeout} seconds`,
    description: `Message will be deleted in ${timeout} seconds`,
    input_message_content: result_text,
    reply_markup: btn
  };
  return result;
}

bot.getMe().then(function (me) {
  bot.username = me.username
  console.log('Listening on @%s!', me.username);
});

bot.on('callback_query', function (call) {
  if (!(call.inline_message_id in timeouts)) {
    bot.answerCallbackQuery(call.id, 'An error occured.', true);
  }
  bot.answerCallbackQuery(call.id, `Timer set >> ${call.data} seconds.}}

bot.on('inline_query', function (query) {
  if (query.query == 'launch') {
    bot.answerInlineQuery(query.id, [time]);
    return;
  }
  var results = [time];
  for (var i in config.amounts)
    results.push( build_inline_result(config.amounts[i], query) );

  bot.answerInlineQuery(query.id, results);
});

bot.on('chosen_inline_result', function (chosen) {
  timeouts[chosen.inline_message_id] = new Tools.Timer(function () {
    bot.editMessageText('[ The End ]', {inline_message_id: chosen.inline_message_id});
    timeouts[chosen.inline_message_id] = null;
  }, 1000 * parseInt(chosen.result_id));
});

bot.onText(/\/start/, function (msg) {
  if (msg.chat.type != 'private') return;

  var fromId = msg.from.id;
  var resp = `Hello!\nI work in inline mode, that means that you just need to write @${bot.time} followed by your message, then wait a moment for the options to show up.\nSelect the amount of time desired and you're done! ;)\n\n channel >> @xtria`;
  bot.sendMessage(fromId, resp);
});




