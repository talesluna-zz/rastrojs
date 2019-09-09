const { rastro } = require('rastrojs');

async function example() {

    const track = await rastro.track('JT124720455BR');

    console.log(track);

};

example();
