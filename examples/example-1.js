const rastrojs = require('rastrojs');

async function example() {

    const tracks = await rastrojs.track('OO423202293BR', 'NOT-CODE', 'AA124720455US');

    console.log(tracks);

};

example();
