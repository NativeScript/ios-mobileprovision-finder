import * as fs from "fs";
import * as path from "path";
import { readdirSync, readFileSync } from "fs";
import { provision, cert } from "../src/index";
import { parse as certParse } from "../src/parsers/security-find-certificate";
import { parse as identitiesParse } from "../src/parsers/security-find-identity";
import * as chai from "chai";
import * as spies from "chai-spies";
import { assert } from "chai";
chai.use(spies);

// function printProfile(profile: provision.MobileProvision) {
//     console.log(` - ${profile.Name} (${profile.TeamName}) ${profile.Entitlements["application-identifier"]} ${profile.Type} ${profile.UUID}`);
// }

// function printEligible(result: provision.Result) {
//     console.log("eligible:");
//     result.eligible.forEach(printProfile);
// }

// function printNonEligible(result: provision.Result) {
//     console.log("non eligible:");
//     result.nonEligible.forEach(printProfile);
// }

// function print(result: provision.Result) {
//     printEligible(result);
//     printNonEligible(result);
// }

// These run end to end tests and run security tool and depend on the keychain, they will run only on mac. Consider running them during development.
describe.skip("api", () => {
  describe("certificates", () => {
    it("list all", () => {
      cert.read();
    });
  });

  describe("provisioning profiles", () => {
    it("lists all", () => {
      provision.read();
    });
    it("filters by team", () => {
      provision.select(provision.read(), {
        TeamName: "Telerik AD",
      });
    });
    it("filters by app id", () => {
      provision.select(provision.read(), {
        AppId: "org.nativescript.CertTest2",
      });
    });
    it("filters by app id and team id", () => {
      provision.select(provision.read(), {
        AppId: "org.nativescript.CertTest2",
        TeamName: "Telerik AD",
      });
    });
    it("filters by app id, team id and device", () => {
      provision.select(provision.read(), {
        AppId: "org.nativescript.CertTest2",
        TeamName: "Telerik AD",
        ProvisionedDevices: ["d97ff43f5d13677a2fb09fc9b4da3066464ff5f4"],
      });
    });
    it("find distribution profile", () => {
      const all = provision.read();
      provision.select(all, {
        AppId: "org.nativescript.examples",
        TeamName: "Telerik AD",
      });
    });
  });

  describe("integrated", () => {
    it("can find valid provision", () => {
      const certificates = cert.read();
      const provisionProfiles = provision.read();
      provision.select(provisionProfiles, {
        AppId: "org.nativescript.examples",
        TeamName: "Telerik AD",
        Certificates: certificates.valid,
      });
    });
  });
});

describe("security find-identity parse", () => {
  it("none", () => {
    const result = identitiesParse(
      fs
        .readFileSync(
          path.resolve(__dirname, "./find-identity/none-found.txt")
        )
        .toString()
    );
    assert.deepEqual(
      { policy: "Code Signing", matching: [], valid: [] },
      result
    );
  });
  it("some", () => {
    const result = identitiesParse(
      fs
        .readFileSync(
          path.resolve(__dirname, "./find-identity/some-found.txt")
        )
        .toString()
    );
    assert.deepEqual(
      {
        policy: "Code Signing",
        matching: [
          {
            hash: "9D591A6ADAF9C99A9C19FC1A8EE7FA153C613441",
            name: "iPhone Distribution: Telerik AD",
          },
          {
            hash: "FAE6210D184FCC1707B87F1C582280A286898EE3",
            name: "iPhone Distribution: Telerik A D (CHSQ3M3P37)",
          },
          {
            hash: "0F0077D3EBEA9D0AB6668B8BCB90152ACE7BA4E9",
            name: "iPhone Developer: Panayot Cankov (TT4M4FMX2A)",
            issue: "CSSMERR_TP_CERT_REVOKED",
          },
          {
            hash: "9354FAEF631DC3E9B07929F20991829FF5E21C36",
            name: "iPhone Developer: Panayot Cankov (TT4M4FMX2A)",
          },
          {
            hash: "89936062DD52C7FEF2273E677AC98D109F198A84",
            name: "iPhone Developer: Panayot Cankov (3KZR3BE4ZD)",
            issue: "CSSMERR_TP_CERT_REVOKED",
          },
          {
            hash: "07AB20E16C86E2B548A91920B83EC27D78AFC7EB",
            name: "iPhone Developer: Panayot Cankov (3KZR3BE4ZD)",
          },
        ],
        valid: [
          {
            hash: "9D591A6ADAF9C99A9C19FC1A8EE7FA153C613441",
            name: "iPhone Distribution: Telerik AD",
          },
          {
            hash: "FAE6210D184FCC1707B87F1C582280A286898EE3",
            name: "iPhone Distribution: Telerik A D (CHSQ3M3P37)",
          },
          {
            hash: "0F0077D3EBEA9D0AB6668B8BCB90152ACE7BA4E9",
            name: "iPhone Developer: Panayot Cankov (TT4M4FMX2A)",
            issue: "CSSMERR_TP_CERT_REVOKED",
          },
          {
            hash: "9354FAEF631DC3E9B07929F20991829FF5E21C36",
            name: "iPhone Developer: Panayot Cankov (TT4M4FMX2A)",
          },
          {
            hash: "89936062DD52C7FEF2273E677AC98D109F198A84",
            name: "iPhone Developer: Panayot Cankov (3KZR3BE4ZD)",
            issue: "CSSMERR_TP_CERT_REVOKED",
          },
          {
            hash: "07AB20E16C86E2B548A91920B83EC27D78AFC7EB",
            name: "iPhone Developer: Panayot Cankov (3KZR3BE4ZD)",
          },
        ],
      },
      result
    );
  });
});

describe("security find-certificate parse", () => {
  it("some", () => {
    const result = certParse(
      fs
        .readFileSync(
          path.resolve(__dirname, "./find-certificate/some-found.txt")
        )
        .toString()
    );
    const expected = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            "./find-certificate/some-found.expected.json"
          )
        )
        .toString()
    );
    assert.deepEqual(result, expected);
  });

  it("macOS Catalina, SHA256 in security output", () => {
    const result = certParse(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            "./find-certificate/some-found-security-macos-catalina.txt"
          )
        )
        .toString()
    );
    const expected = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            "./find-certificate/some-found-security-macos-catalina.expected.json"
          )
        )
        .toString()
    );
    assert.deepEqual(result, expected);
  });
});

describe("provision", function () {
  it("looks at the default path", () => {

    let existingDirCount = 0;
    
    if(fs.existsSync(path.join(process.env.HOME, "/Library/MobileDevice/Provisioning Profiles/"))) {
      existingDirCount++;
    }
    if(fs.existsSync(path.join(process.env.HOME,"/Library/Developer/Xcode/UserData/Provisioning Profiles"))) {
      existingDirCount++;
    }

    let fsMock = {
      readdirSync(dir: string): string[] {
        assert(dir.endsWith("Library/MobileDevice/Provisioning Profiles/") ||
               dir.endsWith("Library/Developer/Xcode/UserData/Provisioning Profiles"));
        return [];
      },
      readFileSync(path: string): string {
        return null;
      },
    };
    const spy = chai.spy(fsMock.readdirSync);
    fsMock.readdirSync = spy;
    provision.read(fsMock as any);

    chai.expect(spy).called.exactly(existingDirCount);
  });

  let testfsMac1: any;

  before(() => {
    testfsMac1 = {
      readdirSync(dir: string) {
        return readdirSync(
          path.resolve(__dirname, "./provisioning/mac1/")
        );
      },
      readFileSync(filePath: string) {
        return readFileSync(
          path.join(
            path.resolve(
              __dirname,
              "./provisioning/mac1",
              path.basename(filePath)
            )
          )
        );
      },
    };
  });

  it("read the plist files from the plists directory", () => {
    const profiles = provision.read(testfsMac1);
    assert.equal(profiles.length, 2);

    const first = profiles[0];
    assert.equal(first.TeamName, "Telerik A D");
    assert.equal(first.UUID, "3aa58a65-f8da-4c67-ZZZZ-ZZZZZZZZZZZZ");
    assert.equal(first.Type, "Development");
    assert.deepEqual(first.TeamIdentifier, ["CHSQ3M3P37"]);
    assert.equal(first.ProvisionedDevices.length, 80);
    assert(
      first.ProvisionedDevices.some(
        (udid) => udid === "c0f5ffad********************************"
      )
    );
    assert(
      first.DeveloperCertificates.some((cert) =>
        cert
          .toString()
          .startsWith(
            "MIIFmTCCBIGgAwIBAgIICS/7/s0P8fMwDQYJKoZIhvcNAQELBQAwgZYxCzAJ"
          )
      )
    );

    const second = profiles[1];
    assert.equal(second.TeamName, "Telerik AD");
    assert.equal(second.UUID, "bb53a533-e88d-470f-ZZZZ-ZZZZZZZZZZZZ");
    assert.equal(second.Type, "Development");
    assert.deepEqual(second.TeamIdentifier, ["W7TGC3P93K"]);
    assert.equal(second.ProvisionedDevices.length, 59);
    assert(
      second.ProvisionedDevices.some(
        (udid) => udid === "d39c73c7********************************"
      )
    );
    assert(
      second.DeveloperCertificates.some((cert) =>
        cert
          .toString()
          .startsWith(
            "MIIFmDCCBICgAwIBAgIIcZcoImBSvQcwDQYJKoZIhvcNAQELBQAwgZYxCzAJ"
          )
      )
    );
  });

  it("can find profiles for devices", () => {
    const profiles = provision.read(testfsMac1);
    const result = provision.select(profiles, {
      ProvisionedDevices: ["c0f5ffad********************************"],
      ExpirationDate: new Date("2017-11-10T10:00:00.000Z"),
    });
    assert.equal(result.eligible.length, 1);
    assert.equal(
      result.eligible[0].UUID,
      "3aa58a65-f8da-4c67-ZZZZ-ZZZZZZZZZZZZ"
    );
    assert.equal(result.nonEligible.length, 1);
  });

  it("can find profiles for certificate", () => {
    const profiles = provision.read(testfsMac1);
    const result = provision.select(profiles, {
      Certificates: [
        { pem: "MIIFmDCCBICgAwIBAgIIcZcoImBSvQcwDQYJKoZIhvcNAQELBQAwgZYxCzAJ" },
      ],
      ExpirationDate: new Date("2017-11-10T10:00:00.000Z"),
    });
    assert.equal(result.eligible.length, 1);
    assert.equal(
      result.eligible[0].UUID,
      "bb53a533-e88d-470f-ZZZZ-ZZZZZZZZZZZZ"
    );
    assert.equal(result.nonEligible.length, 1);
  });

  it("can find profiles by app id", () => {
    const profiles = provision.read(testfsMac1);
    const result1 = provision.select(profiles, {
      AppId: "org.nativescript.examples",
      ExpirationDate: new Date("2017-11-10T10:00:00.000Z"),
    });
    assert.equal(result1.eligible.length, 2);
    assert.equal(result1.nonEligible.length, 0);
  });

  // This test need to be added in future.
  it("can find profile by app-id, device udid and certificate");
  it("unique filters duplicates");
});
