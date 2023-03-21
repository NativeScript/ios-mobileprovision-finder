export interface Certificate {
    /**
     * SHA-1 hash code of the certificate.
     */
    hash: string;
    /**
     * Certificate PEM in Base64 encoded string format.
     */
    pem: string;
}

export function parse(input: string): Certificate[];
