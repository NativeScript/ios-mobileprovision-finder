import * as fs from "fs";
import {extname, join} from "path";
import * as plist from "plist";
import { execSync } from "child_process";

import * as sec_find_id from "./parsers/security-find-identity";
import * as sec_find_cert from "./parsers/security-find-certificate";

export namespace provision {

    const defaultPath = join(process.env.HOME, "Library/MobileDevice/Provisioning Profiles/");
    const plistStartToken = new Buffer("<plist", "ascii");
    const plistEndToken = new Buffer("</plist>", "ascii");

    export interface MobileProvision {
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

    export interface Query {
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
            pem: string
        }[];
    }

    export interface Result {
        eligable: MobileProvision[];
        nonEligable: MobileProvision[];
    }

    function parseAppIdSelector(id: string) {
        const teamIdDot = id.indexOf(".");
        const isWildcard = id.substring(id.length - 2) === ".*";
        const team = id.substring(0, teamIdDot);

        const prefixStart = teamIdDot + 1;
        const prefixEnd = isWildcard ? id.length - 2 : id.length;
        const identifier = prefixStart < prefixEnd ? id.substring(prefixStart, prefixEnd) : "";

        const test = isWildcard ? (testId: string) => { return testId.substring(0, identifier.length) == identifier } : (testId: string) => { return testId === identifier };

        return { team, identifier, isWildcard, test };
    }

    /**
     * Read all provisioning profiles from the target directory.
     * If the path is not specified reads from ~/Library/MobileDevice/Provisioning Profiles/
     */
    export function read(path: string = defaultPath): MobileProvision[] {
        return fs
            .readdirSync(path)
            .filter(file => extname(file) === ".mobileprovision")
            .map<MobileProvision>(file => {
                try {
                    const filePath = join(path, file);
                    const fileContent = fs.readFileSync(filePath);
                    const plistStart = fileContent.indexOf(plistStartToken);
                    const plistEnd = fileContent.indexOf(plistEndToken) + plistEndToken.length;
                    if (plistStart >= 0 && plistStart < plistEnd) {
                        const plistContent = fileContent.toString('utf-8', plistStart, plistEnd);
                        const plistJson = plist.parse(plistContent);
                        if (plistJson.DeveloperCertificates) {
                            plistJson.DeveloperCertificates = plistJson.DeveloperCertificates.map(c => c.toString('base64'));
                        }

                        if (plistJson.ProvisionsAllDevices) {
                            plistJson.Type = "AdHoc";
                        } else if (!plistJson.ProvisionedDevices || !plistJson.ProvisionedDevices.length) {
                            plistJson.Type = "Distribution";
                        } else {
                            plistJson.Type = "Development";
                        }

                        return plistJson;
                    } else {
                        return null;
                    }
                } catch(e) {
                    return null;
                }
            })
            .filter(p => !!p);
    }

    type ProvisionFilter = (provision: MobileProvision) => boolean;

    export function select(mobileprovisions: MobileProvision[],
        {
            ExpirationDate = new Date(),
            TeamName,
            AppId,
            ProvisionedDevices,
            Type,
            Certificates
        }: Query): Result {

        let filter: ProvisionFilter = () => true;

        const both = (a: ProvisionFilter, b: ProvisionFilter) => provision => a(provision) && b(provision);
        const chain = (next: ProvisionFilter) => filter = both(filter, next);

        chain(provision => provision.ExpirationDate >= ExpirationDate);

        TeamName && chain(provision => provision.TeamName === TeamName);
        AppId && chain(provision => parseAppIdSelector(provision.Entitlements["application-identifier"]).test(AppId));
        ProvisionedDevices && chain(provision => provision.ProvisionsAllDevices || ProvisionedDevices.every(required => provision.ProvisionedDevices && provision.ProvisionedDevices.some(provisioned => required === provisioned)));
        Type && chain(provision => provision.Type === Type);

        if (Certificates) {
            const validPemHeads: { [pemHead: string]: boolean } = {};
            Certificates.forEach(c => validPemHeads[c.pem.substr(0, 60)] = true);
            chain(provision => provision.DeveloperCertificates.some(dc => validPemHeads[dc.substr(0, 60)]));
        }

        filter = (test => provision => {
            try {
                return test(provision);
            } catch(e) {
                return false;
            }
        })(filter);

        return mobileprovisions.reduce((acc, next) => {
            (filter(next) ? acc.eligable : acc.nonEligable).push(next);
            return acc;
        }, { eligable: [], nonEligable: [] });
    }
}

export namespace cert {
    export interface Result {
        valid: Certificate[];
        invalid: Certificate[];
    }

    export interface Certificate {
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
    export function read(): Result {
        const findIdentity = execSync("security find-identity -p codesigning").toString();
        const certIdentities = sec_find_id.parse(findIdentity);

        const findCertificate = execSync("security find-certificate -apZ").toString();
        const certHashes = sec_find_cert.parse(findCertificate);

        const hashToPem: { [hash: string]: string } = {};
        certHashes.forEach(certHash => hashToPem[certHash.hash] = certHash.pem);

        const hashToIsValid: { [hash: string]: boolean } = {};
        certIdentities.valid.forEach(id => hashToIsValid[id.hash] = true);

        const certs = certIdentities.matching.map(cert => ({
            hash: cert.hash,
            name: cert.name,
            issue: cert.issue,
            isValid: hashToIsValid[cert.hash] && !cert.issue,
            pem: hashToPem[cert.hash]
        })).reduce((acc, cert) => (cert.isValid ? acc.valid : acc.invalid).push(cert) && acc, { valid: [], invalid: [] });

        return certs;
    }
}
