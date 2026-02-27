const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();

async function test() {
    try {
        console.log('Searching SoundCloud API...');
        const res = await client.search('lofi chill', 'track');
        console.log(`Found tracks! First is ${res[0].title}`);
        
        const song = await client.getSongInfo(res[0].url);
        const stream = await song.downloadProgressive();
        
        stream.on('data', d => {
            console.log('Got audio stream payload!', d.length);
            process.exit(0);
        });
        
    } catch(e) {
        console.error('TEST ERROR:', e.message);
    }
}
test();
