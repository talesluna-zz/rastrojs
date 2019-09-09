import iconv from 'iconv-lite';
import moment from 'moment';
import cheerio from 'cheerio';
import request, { Response } from 'request';
import { Tracking } from 'rastrojs';

/**
 * Track Correios orders by code
 */
export class RastroJS {


    /**
     * Get the track of orders/objects
     *
     * @param  {string|string[]} codes
     */
    public track = (codes: string | string[]) => Promise.all([].concat(codes).map(code => (this.requestObject(code))));

    
    /**
     * Request object/order by coode
     *
     * @param  {string} code
     */
    private requestObject(code: string): Tracking | Promise<Tracking> {

        // Invalid order code
        if (!RastroJS.isValidOrderCode(code)) return {
            code,
            isInvalid: true,
            error: 'invalid_code'
        };
        
        // Request the Correios page
        return new Promise((resolve, reject) => request(
            {
                uri: this.uri,
                form: { objetos: code },
                gzip: true,
                method: 'POST',
                encoding: null,
                strictSSL: false
            },
            (err: Error, res: Response, body: string) => err ? reject(err.message) : resolve(body),

        ))

        // Decode charset
        .then(html => iconv.decode(Buffer.from(html as string), 'binary'))

        // Parse the response
        .then(html => this.parseResponse(html))

        // Detect not found
        .then(track => track ? {code, ...track} : {
            code,
            isInvalid: true,
            error: 'not_found'
        });

    }


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
                    trackedAt: moment(lineData[0][0] + lineData[0][1], 'DD/MM/YYYYHH:mm').toDate(),
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
            isDelivered : lastTrack.status.includes('objeto entregue'),
            postedAt    : firstTrack.trackedAt,
            updatedAt   : lastTrack.trackedAt,
        };

    }


    /**
     * The magic
     */
    private get uri() {

        return Buffer.from(
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
        ).toString();

    }


    /**
     * Check if the order code is valid
     *
     * @param  {string} code
     */
    public static isValidOrderCode = (code: string) => /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(code);

}