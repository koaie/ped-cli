const fs = require(`fs`); // File server
const fuzz = require('fuzzball');

class User {
    login = async (token) => {
        if (token != null) {
            await client.login(token).catch((err) => {
                return Error(err);
            });
        }
        else {
            return Error(`Inoccrect token formart detected, exiting...`);
            process.exit(0);
        }
    };

    search = async (name) => {
        let users = [];
        client.guilds.cache.forEach(server => {
            const list = client.guilds.cache.get(server.id);
            list.members.cache.forEach((member) => {
                const results = fuzz.partial_token_sort_ratio(member.user.username, name);
                if (member.nickname !== null) {
                    const nicResults = fuzz.partial_token_sort_ratio(member.nickname, name);
                    if (results > MIN_MATCH || nicResults > MIN_MATCH) {
                        if (nicResults > results)
                            users.push({ member, results: nicResults });
                        else {
                            users.push({ member, results: results });
                        }
                    }
                }
                else {
                    if (results > MIN_MATCH) {
                        users.push({ member, results: results });
                    }
                }
            });
        });

        const uniqueArray = users.filter((v, i, a) => a.findIndex(t => (t.member.user.id === v.member.user.id)) === i);
        return uniqueArray.sort((a, b) => b.results - a.results);
    };

    channelRead = async (channel) => {
        await client.channels.fetch(`${channel}`);
        return await client.channels.cache.get(`${channel}`, true, false).messages.fetch({ limit: 10 }).catch(err => {
            console.log(`${err}`); //Output request
            fs.appendFileSync(`err.log`, `${JSON.stringify(err, null, 0)}\n`); //Write request to error log
        });
    }

    directRead = async (user, limit) => {
        await client.users.fetch(`${user}`);
        let dm = await client.users.cache.get(`${user}`, true, false).createDM();
        return await dm.messages.fetch({ limit: limit }).catch(err => {
            console.log(`${err}`); //Output request
            fs.appendFileSync(`err.log`, `${JSON.stringify(err, null, 0)}\n`); //Write request to error log
        });
    }

    directMsg = async (user, limit) => {
        await client.users.fetch(`${user}`);
        return await client.users.cache.get(`${user}`, true, false).send(msg).catch(err => {
            console.log(`${err}`); //Output request
            fs.appendFileSync(`err.log`, `${JSON.stringify(err, null, 0)}\n`); //Write request to error log
        });
    };

    channelMsg = async (channel, msg) => {
        await client.channels.fetch(`${channel}`);
        return client.channels.cache.get(`${channel}`, true, false).send(msg).catch(err => {
            console.log(`${err}`); //Output request
            fs.appendFileSync(`err.log`, `${JSON.stringify(err, null, 0)}\n`); //Write request to error log
        });
    };
}
module.exports = User;