const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "2.0",
    author: "NTKhang | ArYAN",
    countDown: 0,
    role: 2,
    longDescription: {
      en: "Admins management system"
    },
    category: "admin",
    guide: {
      en: '{pn} [add | a] <uid | @tag>: Add admin role for user'
        + '\n	  {pn} [remove | r] <uid | @tag>: Remove admin role of user'
        + '\n	  {pn} [list | l]: List all admins'
    }
  },

  langs: {
    en: {
      added: "",
      alreadyAdmin: "🔎|𝗔𝗱𝗱𝗲𝗱 𝗕𝗲𝗳𝗼𝗿𝗲\n━━━━━━━━━━\n\n➪ %1 users already have admin role\n%2",
      missingIdAdd: "🆔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗜𝗗\n━━━━━━━━━━\n\n➪ Please enter ID or tag user to add admin role",
      removed: "✅|𝗥𝗲𝗺𝗼𝘃𝗲𝗱\n━━━━━━━━━━\n\n➪ Removed admin role of %1 users:\n%2",
      notAdmin: "⛔|𝗡𝗼 𝗗𝗮𝘁𝗮\n━━━━━━━━━━\n\n➪ %1 users don't have admin role %2",
      missingIdRemove: "🆔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗜𝗗\n━━━━━━━━━━\n\n➪ Please enter ID or tag user to remove admin role",
      listAdmin: "✨|𝗔𝗱𝗺𝗶𝗻 𝗟𝗶𝘀𝘁\n━━━━━━━━━━\n\n%1"
    }
  },

 onStart: async function({ message, args, usersData, event, getLang }) {
    switch (args[0]) {
      case "add":
      case "a": {
        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else if (event.messageReply)
            uids.push(event.messageReply.senderID);
          else
            uids = args.filter(arg => !isNaN(arg));
          const notAdminIds = [];
          const adminIds = [];
          for (const uid of uids) {
            if (config.adminBot.includes(uid))
              adminIds.push(uid);
            else
              notAdminIds.push(uid);
          }

          config.adminBot.push(...notAdminIds);
          const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `
┏━━━━━━━━━━━━◈
 ▎ℹ️ 𝗡𝗮𝗺𝗲
 ▎➪ ${name}
 ▎
 ▎🆔 𝗨𝗜𝗗
 ▎➪ ${uid}
 ▎
 ▎🖇️ 𝗙𝗕 𝗟𝗶𝗻𝗸
 ▎➪  www.facebook.com/${uid}
┗━━━━━━━━━━━━◈`).join("\n")) : "")
            + (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `
┏━━━━━━━━━━━━◈
 ▎🆔 𝗨𝗜𝗗
 ▎➪ ${uid} 
 ▎🖇️ 𝗙𝗕 𝗟𝗶𝗻𝗸
 ▎➪  www.facebook.com/${uid}
┗━━━━━━━━━━━━◈`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdAdd"));
      }
      case "remove":
      case "r": {
        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else
            uids = args.filter(arg => !isNaN(arg));
          const notAdminIds = [];
          const adminIds = [];
          for (const uid of uids) {
            if (config.adminBot.includes(uid))
              adminIds.push(uid);
            else
              notAdminIds.push(uid);
          }
          for (const uid of adminIds)
            config.adminBot.splice(config.adminBot.indexOf(uid), 1);
          const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `
┏━━━━━━━━━━━━◈
 ▎ℹ️ 𝗡𝗮𝗺𝗲
 ▎➪ ${name}
 ▎
 ▎🆔 𝗨𝗜𝗗
 ▎➪ ${uid}
 ▎
 ▎🖇️ 𝗙𝗕 𝗟𝗶𝗻𝗸
 ▎➪  www.facebook.com/${uid}
┗━━━━━━━━━━━━◈`).join("\n")) : "")
            + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `
┏━━━━━━━━━━━━◈
 ▎🆔 𝗨𝗜𝗗
 ▎➪ ${uid} 
 ▎🖇️ 𝗙𝗕 𝗟𝗶𝗻𝗸
 ▎➪  www.facebook.com/${uid}
┗━━━━━━━━━━━━◈`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdRemove"));
      }
      case "list":
      case "l": {
        const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `
┏━━━━━━━━━━━━◈
 ▎ℹ️ 𝗡𝗮𝗺𝗲
 ▎➪ ${name}
 ▎
 ▎🆔 𝗨𝗜𝗗
 ▎➪ ${uid}
 ▎
 ▎🖇️ 𝗙𝗕 𝗟𝗶𝗻𝗸
 ▎➪  www.facebook.com/${uid}
┗━━━━━━━━━━━━◈`).join("\n")));
      }
      default:
        return message.SyntaxError();
    }
  }
};