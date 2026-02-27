const ytdl = require('@distube/ytdl-core');
const fs = require('fs');

const url = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'; // Just a random small lofi video

ytdl.getInfo(url).then(info => {
  console.log('Title:', info.videoDetails.title);
  const stream = ytdl(url, { filter: 'audioonly' });
  const file = fs.createWriteStream('test_audio.mp3');
  stream.pipe(file);
  stream.on('end', () => console.log('Download finished'));
}).catch(err => {
  console.error('YTDL Error:', err.message);
});
