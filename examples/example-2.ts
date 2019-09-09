import { RastroJS, Tracking } from 'rastrojs';

class Example extends RastroJS {

    constructor(private codes: string[]) {
        super();
    }

    public get tracks(): Promise<Tracking[]> {
        return this.track(this.codes)
    }

}

const example = new Example(['JT124720455BR', 'JT124720455BC', '123']);

example
    .tracks
    .then(tracks => console.log(tracks));