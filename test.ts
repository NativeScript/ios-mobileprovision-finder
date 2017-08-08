import * as fs from "fs";
import * as path from "path";
import { readdirSync, readFileSync } from "fs";
import { provision, cert } from "./index";
import { parse as certParse } from "./parsers/security-find-certificate";
import { parse as identitiesParse } from "./parsers/security-find-identity";
import * as chai from "chai";
import * as spies from "chai-spies";
import { assert } from "chai";
chai.use(spies);

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

// These run end to end tests and run security tool and depend on the keychain, they will run only on mac. Consider running them during development.
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

describe("security find-identity parse", () => {
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

describe("security find-certificate parse", () => {
    it("some", () => {
        const result = certParse(fs.readFileSync("./tests/find-certificate/some-found.txt").toString());
        const expected = JSON.parse(fs.readFileSync("./tests/find-certificate/some-found.expected.json").toString());
        assert.deepEqual(result, expected);
    });
});

describe("provision", function() {
    it("looks at the default path", () => {
        let fs: provision.FileSystem = {
            readdirSync(dir: string) {
                assert(dir.endsWith("Library/MobileDevice/Provisioning Profiles/"));
                return [];
            },
            readFileSync(path: string) { return null; }
        }
        const spy = chai.spy(fs.readdirSync);
        fs.readdirSync = spy;
        provision.read(fs);

        chai.expect(spy).called.exactly(1);
    });

    let testfsMac1: provision.FileSystem;

    before(() => {
        testfsMac1 = {
            readdirSync(dir: string) {
                return readdirSync("./tests/provisioning/mac1/");
            },
            readFileSync(filePath: string) {
                return readFileSync(path.join("./tests/provisioning/mac1", path.basename(filePath)));
            }
        };
    });

    it("read the plist files from the plists directory", () => {
        const profiles = provision.read(testfsMac1);
        assert.equal(profiles.length, 2);

        const first = profiles[0];
        assert.equal(first.TeamName, "Telerik A D");
        assert.equal(first.UUID, "3aa58a65-f8da-4c67-ZZZZ-ZZZZZZZZZZZZ");
        assert.equal(first.Type, "Development");
        assert.deepEqual(first.TeamIdentifier, [ "CHSQ3M3P37" ]);
        assert.equal(first.ProvisionedDevices.length, 80);
        assert(first.ProvisionedDevices.some(udid => udid === "c0f5ffad********************************"));
        assert(first.DeveloperCertificates.some(cert => cert.toString().startsWith("MIIFmTCCBIGgAwIBAgIICS/7/s0P8fMwDQYJKoZIhvcNAQELBQAwgZYxCzAJ")));

        const second = profiles[1];
        assert.equal(second.TeamName, "Telerik AD");
        assert.equal(second.UUID, "bb53a533-e88d-470f-ZZZZ-ZZZZZZZZZZZZ");
        assert.equal(second.Type, "Development");
        assert.deepEqual(second.TeamIdentifier, [ "W7TGC3P93K" ]);
        assert.equal(second.ProvisionedDevices.length, 59);
        assert(second.ProvisionedDevices.some(udid => udid === "d39c73c7********************************"));
        assert(second.DeveloperCertificates.some(cert => cert.toString().startsWith("MIIFmDCCBICgAwIBAgIIcZcoImBSvQcwDQYJKoZIhvcNAQELBQAwgZYxCzAJ")));
    });

    it("can find profiles for devices", () => {
        const profiles = provision.read(testfsMac1);
        const result = provision.select(profiles, {
            ProvisionedDevices: ["c0f5ffad********************************"]
        });
        assert.equal(result.eligable.length, 1);
        assert.equal(result.eligable[0].UUID, "3aa58a65-f8da-4c67-ZZZZ-ZZZZZZZZZZZZ");
        assert.equal(result.nonEligable.length, 1);
    });

    it("can find profiles for certificate", () => {
        const profiles = provision.read(testfsMac1);
        const result = provision.select(profiles, {
            Certificates: [ { pem: "MIIFmDCCBICgAwIBAgIIcZcoImBSvQcwDQYJKoZIhvcNAQELBQAwgZYxCzAJ" } ]
        });
        assert.equal(result.eligable.length, 1);
        assert.equal(result.eligable[0].UUID, "bb53a533-e88d-470f-ZZZZ-ZZZZZZZZZZZZ");
        assert.equal(result.nonEligable.length, 1);
    });

    it("can find profiles by app id", () => {
        const profiles = provision.read(testfsMac1);
        const result1 = provision.select(profiles, {
            AppId: "org.nativescript.examples"
        });
        assert.equal(result1.eligable.length, 2);
        assert.equal(result1.nonEligable.length, 0);
    });

    // This test need to be added in future.
    it("can find profile by app-id, device udid and certificate");
    it("unique filters duplicates");
    it("can parse a provisioning profile file");
});
