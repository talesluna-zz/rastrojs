import rastrojs, { RastroJS, Tracking } from 'rastrojs';


// Simple example
async function getObjects() {

    const tracks1 = await rastrojs.track('JT124720455BR');
    const tracks2 = await rastrojs.track(['JT124720455BR', '123']);
    const tracks3 = await rastrojs.track('JT124720455BR', 'JT124720455BC', '123');

    console.log(tracks1, tracks2, tracks3);

}

getObjects();


// Class example
class Example extends RastroJS {

    constructor(private codes: string[]) {
        super();
    }

    public get tracks(): Promise<Tracking[]> {
        return this.track(this.codes);
    }

}

const example = new Example(['JT124720455BR', 'JT124720455BC', '123']);

example
    .tracks
    .then(tracks => console.log(tracks));