const fuzz = require('fuzzball');

class Server
{
    cache = async () =>
    {
        return client.guilds.cache;
    };

    find = async (name) =>
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
}

module.exports = Server;