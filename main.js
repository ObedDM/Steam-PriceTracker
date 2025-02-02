import readline from 'readline';

async function input(message) {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const res = await new Promise(resolve => rl.question(message, resolve));
    rl.close();
    
    return  res
}

async function getGamePrice(appid) {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`,
        {   method: 'GET'
    });

    const result = await response.json();

    if (!result[appid].success || result === undefined) {

        return null;
    }
       
    const name = result[appid].data.name;

    if (result[appid].data.is_free) {
        const status = 'free'
        return {name, status};
    }

    else if (result[appid].data.release_date.coming_soon) {
        const status = 'coming soon'
        return {name, status};
    }

    else {
        const price = result[appid].data.price_overview.final_formatted;
        return {name, price};
    }
    
}

async function getWishlist(SteamID) {

    const regex = /^[0-9]{17}$/;

    // Exits if the provided SteamID does not match the SteamID64 format
    if (!regex.test(SteamID)) {

        const error = new Error('Not a valid Steam ID');
        return error
    }

    try {                                
        const response = await fetch(`https://api.steampowered.com/IWishlistService/GetWishlist/v1?steamid=${SteamID}`, {
            method: 'GET',
        });
    
        const result = await response.json();

        // Exits if wishlist is empty
        if (Object.keys(result.response).length === 0) {
            
            const error = new Error('Wishlist is empty');
            return error;
        }
    
        // Proceeds if wishlist is not empty
        const length = result.response.items.length;
        const appid_list = [];
    
        for (let index = 0; index < length; index++) {
         
           appid_list.push(result.response.items[index].appid);
        }
    
        return appid_list;

    } catch(error) {

        console.error('Error: ', error);
    }
}

let appid_list;
let games = [];

// shift+ctrl+V to paste
const steamID = await input('Enter your Steam ID: ')

for (let index = 0; index < 1; index++) {
    
    appid_list = await getWishlist(steamID);

    if (appid_list instanceof Error) {
        console.error(`No results: ${appid_list.message}`)
    }

    else {

        const promise = appid_list.map(id => getGamePrice(id));
        games = await Promise.all(promise)

        games = Object.fromEntries(games.map(data => [data.name, data.price || data.status]))

        console.log(games)
    }
}