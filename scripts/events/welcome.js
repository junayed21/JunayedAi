const { getTime } = global.utils;
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const request = require('request');

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
		config: {
				name: "welcome",
				version: "1.7",
				author: "junu",//Language solve by Team Cxly
				category: "events"
		},

		langs: {
				vi: {
					},
				en: {
						session1: "morning",
						session2: "noon",
						session3: "afternoon",
						session4: "evening",
						welcomeMessage: "😘 𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂 𝗮𝗹𝗮𝗶𝗸𝘂𝗺 😘\n\n 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗶𝗻𝘃𝗶𝘁𝗶𝗻𝗴 𝗺𝗲 𝘁𝗼 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽!\n 𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅: %1\n𝗧𝗼 𝘃𝗶𝗲𝘄 𝘁𝗵𝗲 𝗹𝗶𝘀𝘁 𝗼𝗳 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀, 𝗽𝗹𝗲𝗮𝗰𝗲 𝗲𝗻𝘁𝗲𝗿: %1𝗵𝗲𝗹𝗽\n\n♻ 𝗜 𝗵𝗼𝗽𝗲 𝘆𝗼𝘂 𝘄𝗶𝗹𝗹 𝗳𝗼𝗹𝗹𝗼𝘄 𝗼𝘂𝗿 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗿𝘂𝗹𝗲𝘀 ♻",
						multiple1: "you",
						multiple2: "you guys",
						defaultWelcomeMessage: `༅🌺�𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝘆𝗮𝗹𝗮𝗶 𝗸𝘂𝗺⚤💙\n\n 𝗛𝗲𝗹𝗹𝗼 {userName}.\n𝗪𝗲𝗹𝗰𝗼𝗺𝗲 {multiple} 𝗧𝗼 𝘁𝗵𝗲 𝗰𝗵𝗮𝘁 𝗴𝗿𝗼𝘂𝗽: {boxName}\n 𝗛𝗮𝘃𝗲 𝗮 𝗻𝗶𝗰𝗲 {session} \n\nCurrent date and time: {dateTime}.\nTotal members: {membersCount}.\nTotal admins: {adminsCount}.♻ 𝗜 𝗵𝗼𝗽𝗲 𝘆𝗼𝘂 𝘄𝗶𝗹𝗹 𝗳𝗼𝗹𝗹𝗼𝘄 𝗼𝘂𝗿 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗿𝘂𝗹𝗲𝘀 ♻\n\n🐔❤️‍🩹 𝗧𝗵𝗮𝗻𝗸𝘀 𝘆𝗼𝘂 𝘃𝗲𝗿𝘆 𝗺𝘂𝗰𝗵 𝗳𝗼𝗿 𝗰𝗼𝗺𝗶𝗻𝗴 𝘁𝗼 𝗼𝘂𝗿 𝗴𝗿𝗼𝘂𝗽🩵🌟😊`
				}
		}, 

		onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
				if (event.logMessageType !== "log:subscribe") return;

				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// If new member is bot
				if (dataAddedParticipants.some(item => item.userFbId === api.getCurrentUserID())) {
						if (nickNameBot) {
								api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
						}
						return message.send(getLang("welcomeMessage", prefix));
				}

				// Initialize temp data for this thread if not exist
				if (!global.temp.welcomeEvent[threadID]) {
						global.temp.welcomeEvent[threadID] = {
								joinTimeout: null,
								dataAddedParticipants: []
						};
				}

				// Push new members to array and clear/set timeout
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
						const threadData = await threadsData.get(threadID);
						if (threadData.settings.sendWelcomeMessage === false) return;

						const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
						const dataBanned = threadData.data.banned_ban || [];
						const threadName = threadData.threadName;
						const threadInfo = await api.getThreadInfo(threadID);

						// Filter out banned users
						const validParticipants = dataAddedParticipants.filter(user => !dataBanned.some(ban => ban.id === user.userFbId));
						if (validParticipants.length === 0) return;

						// Ensure the cache folder exists
						const cacheFolder = path.resolve(__dirname, 'cache');
						if (!fs.existsSync(cacheFolder)) {
								fs.mkdirSync(cacheFolder);
						}

						// Fixed background image URL
						const background = "https://i.imgur.com/rezUhMY.jpeg";

						// Function to get session name
						const getSessionName = () => {
								const hours = getTime("HH");
								return hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4");
						};

						// Function to get the ordinal suffix for a number
						const getOrdinalSuffix = (i) => {
								const j = i % 10, k = i % 100;
								if (j == 1 && k != 11) return i + "st";
								if (j == 2 && k != 12) return i + "nd";
								if (j == 3 && k != 13) return i + "rd";
								return i + "th";
						};

						const sendWelcomeMessage = async (user, position) => {
								const userName = user.fullName;
								const userId = user.userFbId;
								const dateTime = moment().tz('Asia/Manila').format('MMMM Do YYYY, h:mm:ss a');
								const membersCount = threadInfo.participantIDs.length;
								const adminsCount = threadInfo.adminIDs.length;

								let welcomeMessage = threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");

								welcomeMessage = welcomeMessage
										.replace(/\{userName\}|\{userNameTag\}/g, userName)
										.replace(/\{boxName\}|\{threadName\}/g, threadName)
										.replace(/\{multiple\}/g, getLang("multiple1"))
										.replace(/\{session\}/g, getSessionName())
										.replace(/\{dateTime\}/g, dateTime)
										.replace(/\{membersCount\}/g, membersCount)
										.replace(/\{adminsCount\}/g, adminsCount)
										.replace(/\{position\}/g, getOrdinalSuffix(position));

								const form = { body: welcomeMessage, mentions: [{ tag: userName, id: userId }] };

								// Fetch user's profile picture using usersData
								const avt = await usersData.getAvatarUrl(userId);
								const url = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(userName)}&text2=Welcome%20To%20${encodeURIComponent(threadName)}&text3=Member%20${encodeURIComponent(position)}&avatar=${encodeURIComponent(avt)}`;
								const filePath = path.resolve(cacheFolder, `${userId}.jpg`);

								request(url)
										.pipe(fs.createWriteStream(filePath))
										.on('close', () => {
												form.attachment = [fs.createReadStream(filePath)];
												message.send(form);
										})
										.on('error', (error) => console.error(error));
						};

						// Send welcome messages one by one
						for (const [index, user] of validParticipants.entries()) {
								await sendWelcomeMessage(user, threadInfo.participantIDs.length - validParticipants.length + index + 1);
						}

						delete global.temp.welcomeEvent[threadID];
				}, 1500);
		}
};