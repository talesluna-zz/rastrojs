import rastrojs, { RastroJS, Tracking } from 'rastrojs';

(async () => {

    class MyDeliveries extends RastroJS {

        constructor(private codes: string[]) {
            super();
        }
    
        public get tracks(): Promise<Tracking[]> {
            return this.track(this.codes);
        }
    
    }

    const myDeliveries = new MyDeliveries(['123', 'NX673812505BR']);

    const tracks = await myDeliveries.tracks;
    const [ other ] = await rastrojs.track('JT124720455BC');

    console.log([...tracks, other]);

})();
