const rastrojs = require('rastrojs');

async function example() {

    const tracks = await rastrojs.track('JT124720455BR', 'NOT-CODE', 'AA124720455US');

    console.log(tracks);

};

example();
