// Import dependencies
const fs = require(`fs`); // File server
const { Client } = require(`discord.js`); // Discord's API implementation
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const readlineSync = require('readline-sync');
const fuzz = require('fuzzball');


// Initiate dependencies
const client = new Client(); // Discord client
var argv = require('yargs/yargs')(process.argv.slice(2))
    .option('login', {
        describe: 'enter user/bot token | [TOKEN]',
        type: 'string',
        nargs: 1
    })
    .option('dm', {
        alias: 'direct-message',
        describe: 'send a message to a user | [USER_ID] [MSG]',
        type: 'string',
        nargs: 2
    })
    .option('cm', {
        alias: 'channel-message',
        describe: 'send a message to a channel | [CHANNEL_ID] [MSG]',
        type: 'string',
        nargs: 2
    })
    .option('cl', {
        alias: 'channel-list',
        describe: 'returns all channels of a server | [SERVER_ID] ',
        type: 'string',
        nargs: 1
    })
    .option('sl', {
        alias: 'server-list',
        describe: 'returns all joined servers'
    })
    .option('fu', {
        alias: 'find-user',
        describe: 'returns all similar users  | [TEXT]',
        type: 'string',
        nargs: 1
    })
    .option('fs', {
        alias: 'find-server',
        describe: 'returns all similar servers  | [TEXT]',
        type: 'string',
        nargs: 1
    })
    .option('sa', {
        alias: 'set-activity',
        describe: 'sets activity | [TEXT] [ACTION] [URL]',
        type: 'string',
        nargs: 3
    })
    .argv;

// Set paths
const ACTIVE_PATH = __dirname; // Active directory
const LOG_PATH = `./logs`; // Log directory
const CONFIG_PATH = `./config.json`; // Config path

// Global vars
const MIN_MATCH = 80;

// Set global variables
var CONFIG = new Object();

const importFile = (path) =>
{
    if (fs.existsSync(path))
    {
        let fileData = fs.readFileSync(path);
        JSONobj = JSON.parse(fileData);
        return JSONobj;
    }
    else
    {
        return Error(`${path} does not exist`);
    }
};

const createMissingDir = (path) =>
{
    if (!fs.existsSync(path))
    {
        console.log(`Couldnt find the folder ${path} creating now`);
        fs.mkdirSync(path);
    }
};


const login = async (token) =>
{
    CONFIG = importFile(CONFIG_PATH);
    if (token != null)
    {
        if (token !== CONFIG.token)
        {
            CONFIG.token = token;
            console.log(`Saving new token...`);
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG, null, 2));
            login(token);
        }
        else if (CONFIG instanceof Error)
        {
            CONFIG.token = "";
            console.log(`Saving default token and exiting...`);
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG, null, 2));
            process.exit(0);
        }
    }
    if (String(CONFIG.token).startsWith("mfa."))
    {
        await client.login(CONFIG.token).catch((err) =>
        {
            console.log(err);
        });
    }
    else
    {
        console.log(`Inoccrect token formart detected, exiting...`);
        process.exit(1);
    }
};

const sendChannelMsg = async (channel, msg) =>
{
    return client.channels.cache.get(`${channel}`, true, false).send(msg).catch(err =>
    {
        console.log(`${err}`); //Output request
        fs.appendFileSync(`${LOG_PATH}/err.log`, `${JSON.stringify(err, null, 0)}\n`); //Write request to error log
    });
};

const sendDirectMsg = async (user, msg) =>
{
    return client.users.cache.get(`${user}`, true, false).send(msg).catch(err =>
    {
        console.log(`${err}`); //Output request
        fs.appendFileSync(`${LOG_PATH}/err.log`, `${JSON.stringify(err, null, 0)}\n`); //Write request to error log
    });
};

const sortObjectEntries = (arr) =>
{

    const uniqueArray = arr.filter((v, i, a) => a.findIndex(t => (t.member.user.id === v.member.user.id)) === i);
    return uniqueArray.sort((a, b) => b.results - a.results);
};

const getServers = async () =>
{
    return client.guilds.cache;
};


const findServer = async (name) =>
{
    let MIN_MATCH = 80;
    let servers = [];
    client.guilds.cache.forEach(server =>
    {
        const list = client.guilds.cache.get(server.id);

        let results = fuzz.partial_token_sort_ratio(server.name, name);
        if (results > MIN_MATCH)
        {
            servers.push({ server, results: results });
        }
    });
    return servers.sort((a, b) => b.results - a.results);
};

const findID = async (name) =>
{
    let users = [];
    client.guilds.cache.forEach(server =>
    {
        const list = client.guilds.cache.get(server.id);
        list.members.cache.forEach((member) =>
        {
            const results = fuzz.partial_token_sort_ratio(member.user.username, name);
            if (member.nickname !== null)
            {
                const nicResults = fuzz.partial_token_sort_ratio(member.nickname, name);
                if (results > MIN_MATCH || nicResults > MIN_MATCH)
                {
                    if (nicResults > results)
                        users.push({ member, results: nicResults });
                    else
                    {
                        users.push({ member, results: results });
                    }
                }
            }
            else
            {
                if (results > MIN_MATCH)
                {
                    users.push({ member, results: results });
                }
            }
        });
    });

    return sortObjectEntries(users);
};

const prompt = (query) =>
{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans =>
    {
        rl.close();
        resolve(ans);
    }));
};

const main = async () =>
{
    if (argv.login)
    {
        login(argv.login);
    }
    await login();
    const servers = await getServers();

    if (argv.dm)
    {
      await sendDirectMsg(`${argv.dm[0]}`, `${argv.dm[1]}`).then((msg) =>{
          console.log(`${msg.channel.type} to ${msg.channel.recipient.username}#${msg.channel.recipient.discriminator} "${msg.content}"`);
      });
    }
    if (argv.cm)
    {
        await sendChannelMsg(`${argv.cm[0]}`, `${argv.cm[1]}`).then((msg) =>{
            console.log(`${msg.channel.type} to ${msg.channel.name} (${msg.guild.name}) "${msg.content}"`);
        });
    }
    if (argv.cl)
    {
        client.guilds.cache.get(`${argv.cl}`).channels.cache.forEach((channel) =>
        {
            if (channel.type === 'text')
            {
                console.log(channel.id, channel.name);
            }
        });
    }
    if (argv.sa)
    {
        // FIXME: set acivity currently does not realibly work
        client.user.setActivity(`${argv.sa[0]}`, { type: `${argv.sa[1].toUpperCase}`, url: `${argv.sa[2]}` });
    }
    if (argv.sl)
    {
        servers.forEach((server) =>
        {
            console.log(server.id, server.name);
        });
    }
    if (argv.fu)
    {
        await findID(argv.fu).then((users) => {
            users.forEach((user) => {
                const results = user.results;
                const member = user.member;
                user = user.member.user;
                if (member.nickname !== null)
                {
                    console.log(`${user.username}#${user.discriminator} (${member.nickname}) ${user.id} ${results}`);
                }
                else
                {
                    console.log(`${user.username}#${user.discriminator} ${user.id} ${results}`);
                }
            });
        } );
    }
    if (argv.fs)
    {
        await findServer(argv.fs).then((servers) => {
            servers.forEach((server) => {
                const results = server.results;
                server = server.server;

                console.log(`${server.name} results: ${results}`);
            });
        });
    }
    process.exit(0);
};


main();