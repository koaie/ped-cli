const yargs = require('yargs');

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
    .option('crd', {
        alias: 'channel-read',
        describe: 'returns all messages from a channel | [CHANNEL_ID] [MESSAGE_QUANTITY]',
        type: 'string',
        nargs: 2
    })
    .option('urd', {
        alias: 'user-read',
        describe: 'returns all messages from a user | [CHANNEL_ID] [MESSAGE_QUANTITY]',
        type: 'string',
        nargs: 1
    })
    .option('sf', {
        alias: 'server-find',
        describe: 'returns all similar servers  | [TEXT]',
        type: 'string',
        nargs: 1
    })
    .option('uf', {
        alias: 'user-find',
        describe: 'returns all similar users  | [TEXT]',
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


    module.exports = argv;