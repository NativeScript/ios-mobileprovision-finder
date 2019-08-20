export declare namespace provision {
    interface MobileProvision {
        Name: string;
        CreationDate: Date;
        ExpirationDate: Date;
        TeamName: string;
        TeamIdentifier: string[];
        ProvisionedDevices: string[];
        Entitlements: {
            /**
             * App Id. May contain wildcard. Ex: W7TG***.com.telerik.*
             */
            "application-identifier": string;
            "com.apple.developer.team-identifier": string;
        };
        UUID: string;
        ProvisionsAllDevices: boolean;
        ApplicationIdentifierPrefix: string;
        /**
         * Developer certificate PEMs in base64 string format.
         */
        DeveloperCertificates: string[];
        Type: "Development" | "Distribution" | "AdHoc" | "Enterprise";
    }
    interface Query {
        path?: string;
        ExpirationDate?: Date;
        TeamName?: string;
        AppId?: string;
        ProvisionedDevices?: string[];
        Type?: "Development" | "Distribution" | "AdHoc" | "Enterprise";
        Certificates?: {
            /**
             * Certificate PEMs in base64 encoded string format.
             */
            pem: string;
        }[];
        /**
         * Return provisining profiles with unique names.
         * As a result if there are collisions, eligable ones will shadow the nonEligable, and if there are multiple eligable or multiple nonEligable only the one with the most recent CreationDate will be listed.
         * Default is considered "true", set explcitly to "false" to list all results.
         */
        Unique?: boolean;
    }
    interface Result {
        eligable: MobileProvision[];
        nonEligable: MobileProvision[];
    }
    /**
     * Read all provisioning profiles.
     */
    function read({ readdirSync, readFileSync }?: FileSystem): MobileProvision[];
    /**
     * Reads a provisioning profile.
     */
    function readFromFile(filePath: string, { readdirSync, readFileSync }?: FileSystem): MobileProvision;
    function select(mobileprovisions: MobileProvision[], { ExpirationDate, TeamName, AppId, ProvisionedDevices, Type, Certificates, Unique }: Query): Result;
    interface FileSystem {
        readdirSync(path: string): string[];
        /**
         * Returns node Buffer.
         */
        readFileSync(path: string): any;
    }
}
export declare namespace cert {
    interface Result {
        valid: Certificate[];
        invalid: Certificate[];
    }
    interface Certificate {
        hash: string;
        name: string;
        /**
         * Some certificates have issue codes such as 'CSSMERR_TP_CERT_REVOKED'.
         */
        issue: string;
        isValid: boolean;
        /**
         * Certificate PEM in Base64 encoded string format.
         */
        pem: string;
    }
    /**
     * Read all codesigning sertificates using the 'security' tool from the default keychain search list.
     */
    function read(): Result;
}
