const ytdlp = require('yt-dlp-exec');

async function test() {
    try {
        const url = 'https://www.youtube.com/watch?v=iTHtXgnhqfM';
        
        console.log('Testing python-based yt-dlp wrapper directly over Youtube');
        
        const stream = ytdlp.exec(url, {
            o: '-',
            q: '',
            f: 'bestaudio[ext=m4a]',
        }, { stdio: ['ignore', 'pipe', 'ignore'] });
        
        stream.stdout.on('data', d => {
            console.log('Got stream block length:', d.length);
            stream.kill();
            process.exit(0);
        });

        stream.on('error', err => {
            console.log('STREAM ERR', err);
        });

    } catch(e) {
        console.error('TEST ERROR:', e.message);
    }
}
test();
