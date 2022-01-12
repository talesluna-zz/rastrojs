declare module 'rastrojs' {

    export interface Tracking {
        code: string;
        type?: string;
        tracks?: {
            locale: string;
            status: string;
            observation: string;
            trackedAt: Date;
        }[];
        isDelivered?: boolean;
        postedAt?: Date;
        updatedAt?: Date;
        isInvalid?: boolean;
        error?: string;
    }

    export function track(codes: string[]): Promise<Tracking[]>;
    export function track(...codes: string[]): Promise<Tracking[]>;
    export function isValidOrderCode(code: string): boolean;

    export class RastroJS {
        public track: typeof track;
        private requestObject;
        private parseResponse;
        static isValidOrderCode: typeof isValidOrderCode;
    }

}
