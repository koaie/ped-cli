const fs = require(`fs`); // File server

class File
{
import = (path) =>
{
    if (fs.existsSync(path))
    {
        let fileData = fs.readFileSync(path);
        return JSON.parse(fileData);
    }
    else
    {
        return Error(`${path} does not exist`);
    }
};

createDir = (path) =>
{
    if (!fs.existsSync(path))
    {
        console.log(`Couldnt find the folder ${path} creating now`);
        fs.mkdirSync(path);
        return false;
    }
    return true;
};
}

module.exports = File;