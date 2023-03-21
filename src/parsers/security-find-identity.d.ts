export interface Certificate {
    /**
     * SHA-1 hash code of the certificate.
     */
    hash: string;
    name: string;
    issue?: string;
}

export interface Result {
    policy: string;
    matching: Certificate[],
    valid: Certificate[]
}

export function parse(input: string): Result;
