import url from 'url';
import https from 'https';
import cheerio from 'cheerio';

import { Tracking } from 'rastrojs';
import { TypesEnum } from './enums/types.enums';

/**
 * Track Correios orders by code
 */
export class RastroJS {

    public parallelTracks = 10;

    /**
     * Get the track of orders/objects
     *
     * @param  {string|string[]} codes
     */
    public async track(...codes: string[]) {

        const chunkSize = Math.ceil(codes.length / this.parallelTracks);
        const tracks: Tracking[] = [];

        for (let i = 0; i < chunkSize; i++) {
            const results = await Promise.all(codes.slice(this.parallelTracks * i, this.parallelTracks * (i+1)).map(this.requestObject));
            tracks.push(...results);
        }

        return tracks;

    }


    /**
     * Check if the order code is valid
     *
     * @param  {string} code
     */
    public static isValidOrderCode = (code: string) => /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(code);


    /**
     * Request object/order by code
     *
     * @param  {string} code
     */
    private requestObject = (code: string): Promise<Tracking> => new Promise((resolve, reject) => {

        // Invalid order code
        if (!RastroJS.isValidOrderCode(code)) resolve({
            code,
            isInvalid: true,
            error: 'invalid_code'
        });

        const request = https.request(
            this.uri, 
            {
                method: 'POST',
                secureOptions: 0,
                headers: {
                    'User-Agent': this.userAgent,
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            },
            response => {

                if (response.statusCode !== 200) return reject(response.statusMessage);

                let html = '';
                response.setEncoding('binary')
                response.on('data', chunk => html += chunk);
                response.on('end', () => {

                    const track = this.parseResponse(html);

                    resolve(track ? {
                        code, 
                        type: TypesEnum[code.toUpperCase().substr(0,2)] || TypesEnum.UNKNOWN, 
                        ...track
                    } : {
                        code,
                        isInvalid: true,
                        error: 'not_found'
                    });

                });

            }
        );

        request.write(`objetos=${code}`);
        request.on('error', error => reject(error));
        request.end();

    });


    /**
     * Parse the request response and create tracking object
     *
     * @param  {string} html
     */
    private parseResponse(html: string) {

        // Load HTML document as cheerio
        const document = cheerio.load(html);

        // Load table lines
        const lines = document('.listEvent').find('tr');

        // Map lines
        const tracks = lines
            .toArray()
            .map(line => {

                // Map coluns and extract the data
                const [ [ date, time, locale ], [ status, observation ], ] = document(line)
                    .find('td')
                    .toArray()
                    .map(column => (document(column).text().replace(/[\n\r\t]/g, '')).trim())
                    .filter(data => !!data)
                    .map(data => data.split(/\s\s+/g))

                // Create a track object
                return {
                    locale: locale.toLowerCase(),
                    status: status.toLowerCase(),
                    observation: observation ? observation.toLowerCase() : null,
                    trackedAt: new Date(date.split('/').reverse().join('-').concat(` ${time} -3`)),
                };

        });

        // Not found order
        if (!tracks.length) return null;

        // Reorder tracks
        tracks.reverse();

        // Detect first and last tracks to calculate dates
        const [firstTrack, lastTrack] = [tracks[0],  tracks[tracks.length-1]];

        // Return full order tracking object
        return {
            tracks,
            isDelivered: lastTrack.status.includes('objeto entregue'),
            postedAt: firstTrack.trackedAt,
            updatedAt: lastTrack.trackedAt,
        };

    }


    /**
     * The magic
     */
    private get uri() {
        return new url.URL(this.decoder(
            `
            \x61\x48\x52\x30\x63\x48\x4D\x36\x4C\x79
            \x39\x33\x64\x33\x63\x79\x4C\x6D\x4E\x76
            \x63\x6E\x4A\x6C\x61\x57\x39\x7A\x4C\x6D
            \x4E\x76\x62\x53\x35\x69\x63\x69\x39\x7A
            \x61\x58\x4E\x30\x5A\x57\x31\x68\x63\x79
            \x39\x79\x59\x58\x4E\x30\x63\x6D\x56\x68
            \x62\x57\x56\x75\x64\x47\x38\x76\x63\x6D
            \x56\x7A\x64\x57\x78\x30\x59\x57\x52\x76
            \x58\x33\x4E\x6C\x62\x57\x4E\x76\x62\x6E
            \x52\x6C\x62\x6E\x51\x75\x59\x32\x5A\x74
            `,
        ));
    }

    /**
     * Random user agents
     */
    private get userAgent(): string {

        const UAS = [
            `\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x46\x64\x70\x62\x6d\x52\x76\x64\x33\x4d\x67\x54\x6c\x51\x67\x4d\x54\x41\x75\x4d\x44\x73\x67\x56\x32\x6c\x75\x4e\x6a\x51\x37\x49\x48\x67\x32\x4e\x44\x73\x67\x63\x6e\x59\x36\x4f\x44\x67\x75\x4d\x43\x6b\x67\x52\x32\x56\x6a\x61\x32\x38\x76\x4d\x6a\x41\x78\x4d\x44\x41\x78\x4d\x44\x45\x67\x52\x6d\x6c\x79\x5a\x57\x5a\x76\x65\x43\x38\x34\x4f\x43\x34\x77`,
            `\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x46\x64\x70\x62\x6d\x52\x76\x64\x33\x4d\x67\x54\x6c\x51\x67\x4d\x54\x41\x75\x4d\x44\x73\x67\x56\x32\x6c\x75\x4e\x6a\x51\x37\x49\x48\x67\x32\x4e\x43\x6b\x67\x51\x58\x42\x77\x62\x47\x56\x58\x5a\x57\x4a\x4c\x61\x58\x51\x76\x4e\x54\x4d\x33\x4c\x6a\x4d\x32\x49\x43\x68\x4c\x53\x46\x52\x4e\x54\x43\x77\x67\x62\x47\x6c\x72\x5a\x53\x42\x48\x5a\x57\x4e\x72\x62\x79\x6b\x67\x51\x32\x68\x79\x62\x32\x31\x6c\x4c\x7a\x6b\x77\x4c\x6a\x41\x75\x4e\x44\x51\x7a\x4d\x43\x34\x35\x4d\x79\x42\x54\x59\x57\x5a\x68\x63\x6d\x6b\x76\x4e\x54\x4d\x33\x4c\x6a\x4d\x32`,
            `\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x45\x31\x68\x59\x32\x6c\x75\x64\x47\x39\x7a\x61\x44\x73\x67\x53\x57\x35\x30\x5a\x57\x77\x67\x54\x57\x46\x6a\x49\x45\x39\x54\x49\x46\x67\x67\x4d\x54\x46\x66\x4d\x31\x38\x78\x4b\x53\x42\x42\x63\x48\x42\x73\x5a\x56\x64\x6c\x59\x6b\x74\x70\x64\x43\x38\x31\x4d\x7a\x63\x75\x4d\x7a\x59\x67\x4b\x45\x74\x49\x56\x45\x31\x4d\x4c\x43\x42\x73\x61\x57\x74\x6c\x49\x45\x64\x6c\x59\x32\x74\x76\x4b\x53\x42\x44\x61\x48\x4a\x76\x62\x57\x55\x76\x4f\x54\x41\x75\x4d\x43\x34\x30\x4e\x44\x4d\x77\x4c\x6a\x6b\x7a\x49\x46\x4e\x68\x5a\x6d\x46\x79\x61\x53\x38\x31\x4d\x7a\x63\x75\x4d\x7a\x59\x3d`,
            `\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x46\x64\x70\x62\x6d\x52\x76\x64\x33\x4d\x67\x54\x6c\x51\x67\x4d\x54\x41\x75\x4d\x44\x73\x67\x56\x32\x6c\x75\x4e\x6a\x51\x37\x49\x48\x67\x32\x4e\x43\x6b\x67\x51\x58\x42\x77\x62\x47\x56\x58\x5a\x57\x4a\x4c\x61\x58\x51\x76\x4e\x54\x4d\x33\x4c\x6a\x4d\x32\x49\x43\x68\x4c\x53\x46\x52\x4e\x54\x43\x77\x67\x62\x47\x6c\x72\x5a\x53\x42\x48\x5a\x57\x4e\x72\x62\x79\x6b\x67\x51\x32\x68\x79\x62\x32\x31\x6c\x4c\x7a\x6b\x77\x4c\x6a\x41\x75\x4e\x44\x51\x7a\x4d\x43\x34\x35\x4d\x79\x42\x54\x59\x57\x5a\x68\x63\x6d\x6b\x76\x4e\x54\x4d\x33\x4c\x6a\x4d\x32\x49\x45\x56\x6b\x5a\x79\x38\x35\x4d\x43\x34\x77\x4c\x6a\x67\x78\x4f\x43\x34\x31\x4d\x51\x3d\x3d`,
        ]

        return this.decoder(UAS[Math.floor(Math.random() * UAS.length)]);

    }

    /**
     * Part of magic
     *
     * @param value
     * @returns
     */
    private decoder = (value: string) => Buffer.from(value, '\x62\x61\x73\x65\x36\x34').toString('utf-8');

}