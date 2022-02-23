declare module 'waelio-utils' {
    _cleanResponse: (response: any) => any;
    _formatErrors: (err: any) => {};
    _equals: (array: any[], needle: any[]) => boolean;
    _hideRandom: (array: any[], difficulty?: number, replacement?: string) => any[];
    _parseErrors: (err: any) => any;
    _repeat: (num: number) => (fn: any) => void;
    _rotateArray: (array: string | number[]) => false | never[];
    _to: (promise: Promise<any>) => Promise<any>;
    _To: (promise: Promise<any>) => Promise<any>;
    a_or_an: (field: string) => "an" | "a";
    Base64: typeof Base64;
    toBase64: typeof Base64;
    calculateClockDrift: (iatAccessToken: number, iatIdToken: number) => number;
    camelToSnake: (payload: string, hyphenated?: boolean) => string;
    generateId: (start?: number, len?: number) => string;
    isArray: (payload: any) => boolean;
    isObject: (payload: any) => boolean;
    jsonToQueryString: (payload: {
        string: any;
    }) => string;
    meta: () => {
        meta: {};
    };
    notifyMe: (notification: string | {
        string: any;
    }, Site?: string) => void;
    queryStringToJson: (payload: string | {
        string: any;
    }, toObject?: boolean) => any;
    reParseString: (payload: string) => any;
    resetString: (payload: string) => string;
    snakeToCamel: (payload: string) => string;
    sniffId: (payload: any) => any;
    _encrypt: (salt: any, text: any) => any;
    _decrypt: (salt: any, encoded: any) => any;
};

// export default 'waelio-utils'