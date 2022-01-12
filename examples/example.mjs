import rastrojs from 'rastrojs';

(async () => {
    const tracks = await rastrojs.track('NX673812505BR', 'NX673812505CH');
    console.log(tracks);
})();
