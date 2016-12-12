import * as fs from "fs";
import { provision, cert } from "./index";
import { parse as certParse } from "./parsers/security-find-certificate";
import { parse as identitiesParse } from "./parsers/security-find-identity";
import { assert } from "chai";

declare var describe, it;

function printProfile(profile: provision.MobileProvision) {
    console.log(` - ${profile.Name} (${profile.TeamName}) ${profile.Entitlements["application-identifier"]} ${profile.Type} ${profile.UUID}`);
}

function printEligable(result: provision.Result) {
    console.log("eligable:");
    result.eligable.forEach(printProfile);
}

function printNonEligable(result: provision.Result) {
    console.log("non eligable:");
    result.nonEligable.forEach(printProfile);
}

function print(result: provision.Result) {
    printEligable(result);
    printNonEligable(result);
}

describe("api", () => {
    describe("certificates", () => {
        it("list all", () => {
            const result = cert.read();
        });
    });

    describe("provisioning profiles", () => {
        it("lists all", () => {
            const result = provision.read();
        });
        it("filters by team", () => {
            const result = provision.select(provision.read(), {
                TeamName: "Telerik AD"
            });
        });
        it("filters by app id", () => {
            const result = provision.select(provision.read(), {
                AppId: "org.nativescript.CertTest2"
            });
        });
        it("filters by app id and team id", () => {
            const result = provision.select(provision.read(), {
                AppId: "org.nativescript.CertTest2",
                TeamName: "Telerik AD"
            });
        });
        it("filters by app id, team id and device", () => {
            const result = provision.select(provision.read(), {
                AppId: "org.nativescript.CertTest2",
                TeamName: "Telerik AD",
                ProvisionedDevices: ["d97ff43f5d13677a2fb09fc9b4da3066464ff5f4"]
            });
        });
        it("find distribution profile", () => {
            const all = provision.read();
            const result = provision.select(all, {
                AppId: "org.nativescript.examples",
                TeamName: "Telerik AD"
            });
        });
    });

    describe("integrated", () => {
        it("can find valid provision", () => {
            const certificates = cert.read();
            const provisionProfiles = provision.read();
            const result = provision.select(provisionProfiles, {
                AppId: "org.nativescript.examples",
                TeamName: "Telerik AD",
                Certificates: certificates.valid
            });
        });
    });
});

describe.only("security find-identity parse", () => {
    it("none", () => {
        const result = identitiesParse(fs.readFileSync("./tests/find-identity/none-found.txt").toString());
        assert.deepEqual({ policy: 'Code Signing', matching: [], valid: [] }, result);
    });
    it("some", () => {
        const result = identitiesParse(fs.readFileSync("./tests/find-identity/some-found.txt").toString());
        assert.deepEqual({ policy: 'Code Signing',
            matching: 
            [ { hash: '9D591A6ADAF9C99A9C19FC1A8EE7FA153C613441',
                name: 'iPhone Distribution: Telerik AD' },
                { hash: 'FAE6210D184FCC1707B87F1C582280A286898EE3',
                name: 'iPhone Distribution: Telerik A D (CHSQ3M3P37)' },
                { hash: '0F0077D3EBEA9D0AB6668B8BCB90152ACE7BA4E9',
                name: 'iPhone Developer: Panayot Cankov (TT4M4FMX2A)',
                issue: 'CSSMERR_TP_CERT_REVOKED' },
                { hash: '9354FAEF631DC3E9B07929F20991829FF5E21C36',
                name: 'iPhone Developer: Panayot Cankov (TT4M4FMX2A)' },
                { hash: '89936062DD52C7FEF2273E677AC98D109F198A84',
                name: 'iPhone Developer: Panayot Cankov (3KZR3BE4ZD)',
                issue: 'CSSMERR_TP_CERT_REVOKED' },
                { hash: '07AB20E16C86E2B548A91920B83EC27D78AFC7EB',
                name: 'iPhone Developer: Panayot Cankov (3KZR3BE4ZD)' } ],
            valid: 
            [ { hash: '9D591A6ADAF9C99A9C19FC1A8EE7FA153C613441',
                name: 'iPhone Distribution: Telerik AD' },
                { hash: 'FAE6210D184FCC1707B87F1C582280A286898EE3',
                name: 'iPhone Distribution: Telerik A D (CHSQ3M3P37)' },
                { hash: '0F0077D3EBEA9D0AB6668B8BCB90152ACE7BA4E9',
                name: 'iPhone Developer: Panayot Cankov (TT4M4FMX2A)',
                issue: 'CSSMERR_TP_CERT_REVOKED' },
                { hash: '9354FAEF631DC3E9B07929F20991829FF5E21C36',
                name: 'iPhone Developer: Panayot Cankov (TT4M4FMX2A)' },
                { hash: '89936062DD52C7FEF2273E677AC98D109F198A84',
                name: 'iPhone Developer: Panayot Cankov (3KZR3BE4ZD)',
                issue: 'CSSMERR_TP_CERT_REVOKED' },
                { hash: '07AB20E16C86E2B548A91920B83EC27D78AFC7EB',
                name: 'iPhone Developer: Panayot Cankov (3KZR3BE4ZD)' } ]
            }, result);
    });
});
