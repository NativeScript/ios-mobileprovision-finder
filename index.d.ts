export declare namespace provision {
    interface MobileProvision {
        Name: string;
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
        Type: "Development" | "Distribution" | "AdHoc";
    }
    interface Query {
        path?: string;
        ExpirationDate?: Date;
        TeamName?: string;
        AppId?: string;
        ProvisionedDevices?: string[];
        Type?: "Development" | "Distribution" | "AdHoc";
        Certificates?: {
            /**
             * Certificate PEMs in base64 encoded string format.
             */
            pem: string;
        }[];
    }
    interface Result {
        eligable: MobileProvision[];
        nonEligable: MobileProvision[];
    }
    /**
     * Read all provisioning profiles from the target directory.
     * If the path is not specified reads from ~/Library/MobileDevice/Provisioning Profiles/
     */
    function read(path?: string): MobileProvision[];
    function select(mobileprovisions: MobileProvision[], {ExpirationDate, TeamName, AppId, ProvisionedDevices, Type, Certificates}: Query): Result;
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
