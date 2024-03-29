// Import dependencies
const fs = require('fs'); // File server
const { Client } = require('discord.js'); // Discord's API implementation
const readlineSync = require('readline-sync');

// Import segerated code
const argv = require('./yargs');
const File = require('./file');
const User = require('./user');
const Server = require('./server');
const { updateStrings } = require('yargs');


// Initiate dependencies
global.client = new Client(); // Discord client
const user = new User();
const server = new Server();
const file = new File();

// Set paths
const ACTIVE_PATH = __dirname; // Active directory
const LOG_PATH = `./logs`; // Log directory
const CONFIG_PATH = `./config.json`; // Config path


// Set global variables
global.CONFIG = new Object();
global.MIN_MATCH = 80;

function sleep(ms) {
    // add ms millisecond timeout before promise resolution
    return new Promise(resolve => setTimeout(resolve, ms))
}


const main = async () => {
    file.createDir(CONFIG_PATH);
    if (argv.login) {
        const token = argv.login;
        if (token != null) {
            console.log(`Saving new token...`);
            CONFIG.token = token;
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG, null, 2));
        }
    }

    CONFIG = file.import(CONFIG_PATH);
    await user.login(CONFIG.token).catch((err) => {
        return Error(err);
        process.exit(0);
    });
    const servers = await server.cache();

    if (argv.dm) {
        await user.directMsg(`${argv.dm[0]}`, `${argv.dm[1]}`).then((msg) => {
            if (msg != null)
                console.log(`${msg.channel.type} to ${msg.channel.recipient.username}#${msg.channel.recipient.discriminator} "${msg.content}"`);
        });
    }
    if (argv.cm) {
        await user.channelMsg(`${argv.cm[0]}`, `${argv.cm[1]}`).then((msg) => {
            if (msg != null)
                console.log(`${msg.channel.type} to ${msg.channel.name} (${msg.guild.name}) "${msg.content}"`);
        });
    }
    if (argv.cl) {
        client.guilds.cache.get(`${argv.cl}`).channels.cache.forEach((channel) => {
            if (channel.type === 'text') {
                console.log(channel.id, channel.name);
            }
        });
    }
    if (argv.sa) {
        // FIXME: set acivity currently does not realibly work
        client.user.setActivity(`${argv.sa[0]}`, { type: `${argv.sa[1].toUpperCase}`, url: `${argv.sa[2]}` });
    }
    if (argv.sl) {
        servers.forEach((server) => {
            console.log(server.id, server.name);
        });
    }
    if (argv.uf) {
        await user.search(argv.uf).then((users) => {
            users.forEach((user) => {
                const results = user.results;
                const member = user.member;
                user = user.member.user;
                if (member.nickname !== null) {
                    console.log(`${user.username}#${user.discriminator} (${member.nickname}) ${user.id} <${results}>`);
                }
                else {
                    console.log(`${user.username}#${user.discriminator} ${user.id} <${results}>`);
                }
            });
        });
    }
    if (argv.sf) {
        await server.find(argv.sf).then((servers) => {
            servers.forEach((server) => {
                const results = server.results;
                server = server.server;

                console.log(`(${server.name}) ${server.id} <${results}>`);
            });
        });
    }
    if (argv.crd) {
        await user.channelRead(argv.crd[0], argv.crd[1]).then(msgs => {
            msgs.array().reverse().forEach(msg => {
                if (msg.attachments.size > 0) {
                    msg.attachments.forEach((attachment) => {
                        console.log(`${new Date(msg.createdTimestamp).toLocaleTimeString().replace(/:\d+ /, ' ')} ${msg.author.username}#${msg.author.discriminator}: ${attachment.url}`);
                    })
                }
                else {
                    console.log(`${new Date(msg.createdTimestamp).toLocaleTimeString().replace(/:\d+ /, ' ')} ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
                    console.log(msg.embeds);
                }
            })
        });
    }
    if (argv.urd) {
        await user.directRead(argv.urd[0], argv.urd[1]).then(msgs => {
            msgs.array().reverse().forEach(msg => {
                if (msg.attachments.size > 0) {
                    msg.attachments.forEach((attachment) => {
                        console.log(`${new Date(msg.createdTimestamp).toLocaleTimeString().replace(/:\d+ /, ' ')} ${msg.author.username}#${msg.author.discriminator}: ${attachment.url}`);
                    })
                }
                else {
                    console.log(`${new Date(msg.createdTimestamp).toLocaleTimeString().replace(/:\d+ /, ' ')} ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
                }
            })
        });
    }
    if (argv.rl) {
        while (true) {
            await user.channelMsg(`${argv.rl}`, `$wa`).then(async (msg) => {
                if (msg != null) {
                    console.log(`${msg.channel.type} to ${msg.channel.name} (${msg.guild.name}) "${msg.content}"`);

                    const filter = m => {
                        return m.author.id == 432610292342587392;
                    };

                    await msg.channel.awaitMessages(filter, { max: 1, time: 12000, errors: ['time'] })
                        .then(collected => {
                            collected.forEach(ms => {
                                if (ms.content.includes(`${client.user.username}`) && ms.content.includes(`is limited to`)) {
                                    process.exit(0);
                                }
                            })
                        })
                        .catch(collected => {
                            console.log("not limited");
                        });
                }
            }).catch(err => {
                console.log(`${err}`); //Output request
                fs.appendFileSync(`err.log`, `${JSON.stringify(err, null, 0)}\n`); //Write request to error log
            });
        }
    }
    if (argv.csp) {
        let max = Number(argv.csp[2]);
        let delay = Number(argv.csp[3]);


        for (let i = 0; i < max || max == 0; i++) {

            await user.channelMsg(`${argv.csp[0]}`, `${argv.csp[1]}`).then((msg) => {
                if (msg != null)
                    console.log(`#${i + 1} ${msg.channel.type} to ${msg.channel.name} (${msg.guild.name}) "${msg.content}"`);
            });
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    if (argv.usp) {
        let max = Number(argv.usp[2]);
        let delay = Number(argv.usp[3]);


        for (let i = 0; i < max || max == 0; i++) {
            await user.directMsg(`${argv.usp[0]}`, `${argv.usp[1]}`).then((msg) => {
                if (msg != null)
                    console.log(`#${i + 1} ${msg.channel.type} to ${msg.channel.recipient.username}#${msg.channel.recipient.discriminator} "${msg.content}"`);
            });
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    process.exit(0);
};

main();