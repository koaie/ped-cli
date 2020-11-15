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
        describe: '[TOKEN]',
        type: 'string',
        nargs: 1
    })
    .option('dm', {
        alias: 'direct-message',
        describe: '[USER_ID] [MSG]',
        type: 'string',
        nargs: 2
    })
    .option('cm', {
        alias: 'channel-message',
        describe: '[CHANNEL_ID] [MSG]',
        type: 'string',
        nargs: 2
    })
    .option('fl', {
        alias: 'friend-list',
        describe: 'returns friend list',
        nargs: 0
    })
    .option('cl', {
        alias: 'channel-list',
        describe: 'returns all messages from channel',
        type: 'string',
        nargs: 1
    })
    .option('fu', {
        alias: 'find-user',
        describe: 'returns userid',
        type: 'string',
        nargs: 1
    })
    .option('sa', {
        alias: 'set-activity',
        describe: 'sets activity [NAME]] [ACTION] [URL]',
        type: 'string',
        nargs: 3
    })
    .argv;

// Set paths
const ACTIVE_PATH = __dirname; // Active directory
const LOG_PATH = `./logs`; // Log directory
const CONFIG_PATH = `./config.json`; // Config path


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
    client.channels.cache.get(channel).send(msg).catch(err =>
    {
        let errReq = {
            "type": "cm",
            "channel": channel,
            "msg": msg,
            "error": err
        };

        console.log(`${err}`); //Output request
        fs.appendFileSync(`${LOG_PATH}/err.log`, `${JSON.stringify(errReq, null, 0)}\n`); //Write request to error log
    });
    let msgReq = {
        "type": "cm",
        "channel": channel,
        "msg": msg
    };

    console.log(`${JSON.stringify((msgReq), null, 0)}`); //Output request
    fs.appendFileSync(`${LOG_PATH}/dm.log`, `${JSON.stringify(msgReq, null, 0)}\n`); //Write request to log
};

const sendDirectMsg = async (user, msg) =>
{
    client.users.fetch(`${user}`).then(user =>
    {
        user.send(msg).catch(err =>
        {
            let errReq = {
                "type": "dm",
                "user": user,
                "msg": msg,
                "error": err
            };

            console.log(`${err}`); //Output request
            fs.appendFileSync(`${LOG_PATH}/err.log`, `${JSON.stringify(errReq, null, 0)}\n`); //Write request to error log
        });
        let msgReq = {
            "type": "cm",
            "user": user,
            "msg": msg
        };

        console.log(`${JSON.stringify(msgReq, null, 0)}`); //Output request
        fs.appendFileSync(`${LOG_PATH}/dm.log`, `${JSON.stringify(msgReq, null, 0)}\n`); //Write request to log
    });
};

const sortObjectEntries = (obj) =>
{
    console.log(obj)
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
};

const findID = async (name) =>
{
    let MIN_MATCH = 50;
    let users = {};
    client.guilds.cache.forEach(server =>
    {
        const list = client.guilds.cache.get(server.id);
        list.members.cache.forEach((member) =>
        {
            let results = fuzz.ratio(member.user.username, name);
            let nicResults;
            if (member.nickname == !null)
            {
                nicResults = fuzz.ratio(member.nickname, name);
                if (results > MIN_MATCH || nicResults > MIN_MATCH)
                {
                    users[member] = results + nicResults;
                }
            }
            else
            {
                if (results > MIN_MATCH)
                {
                    users[member] = results;
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

    if (argv.dm)
    {
        sendDirectMsg(`${argv.dm[0]}`, `${argv.dm[1]}`);
    }
    if (argv.cm)
    {
        sendChannelMsg(`${argv.cm[0]}`, `${argv.cm[1]}`);
    }
    if (argv.fl)
    {
        console.log("// TODO implmeant friendlist");
    }
    if (argv.cl)
    {
        //client.user.setActivity("cutest koala", { type: "STREAMING", url: "https://www.twitch.tv/koa"});
    }
    if (argv.sa)
    {
        client.user.setActivity(`${argv.sa[0]}`, { type: `${argv.sa[1].toUpperCase}`, url: `${argv.sa[2]}` });
    }
    if (argv.fu)
    {
        let results = await findID(argv.fu);

        for(let i =0;i<results.length;i++)
        {
            console.log(results[i]);
        }   
    }

};


main();