const sc = require('soundcloud-scraper'); 
const c = new sc.Client(); 
c.search('lofi', 'track').then(r => console.log(r[0]));
