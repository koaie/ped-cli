// Import dependencies
const fs = require(`fs`); // File server
const { Client } = require(`discord.js`); // Discord's API implementation
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


const main = async () =>
{
    file.createDir(CONFIG_PATH);
    if (argv.login)
    {
        const token = argv.login;
        if (token != null)
        {
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

    if (argv.dm)
    {
      await user.directMsg(`${argv.dm[0]}`, `${argv.dm[1]}`).then((msg) =>{
          console.log(`${msg.channel.type} to ${msg.channel.recipient.username}#${msg.channel.recipient.discriminator} "${msg.content}"`);
      });
    }
    if (argv.cm)
    {
        await user.channelMsg(`${argv.cm[0]}`, `${argv.cm[1]}`).then((msg) =>{
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
        await user.search(argv.fu).then((users) => {
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
        await server.find(argv.fs).then((servers) => {
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