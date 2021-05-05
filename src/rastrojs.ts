import url from 'url';
import https from 'https';
import cheerio from 'cheerio';

import { Tracking } from 'rastrojs';
import { TypesEnum } from './enums/types.enums';

/**
 * Track Correios orders by code
 */
export class RastroJS {


    /**
     * Get the track of orders/objects
     *
     * @param  {string|string[]} codes
     */
    public track = (...codes: string[]) => Promise.all(codes.map(this.requestObject));


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
                const lineData = document(line)
                    .find('td')
                    .toArray()
                    .map(column => (document(column).text().replace(/[\n\r\t]/g, '')).trim())
                    .filter(data => !!data)
                    .map(data => data.split(/\s\s+/g))

                // Create a track object
                return {
                    locale: lineData[0][2].toLowerCase(),
                    status: lineData[1][0].toLowerCase(),
                    observation: lineData[1][1] ? lineData[1][1].toLowerCase() : null,
                    trackedAt: new Date(lineData[0][0].split('/').reverse().join('-').concat(` ${lineData[0][1]} -3`)),
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

        return new url.URL(Buffer.from(
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
            '\x62\x61\x73\x65\x36\x34'
        ).toString());

    }

    /**
     * Random user agents
     */
    private get userAgent(): string {

        const UAS = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.51'
        ];

        return UAS[Math.floor(Math.random() * UAS.length)];

    }


    /**
     * Check if the order code is valid
     *
     * @param  {string} code
     */
    public static isValidOrderCode = (code: string) => /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(code);

}