import { provision, cert } from "./index";

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

describe("certificates", () => {
    it("list all", () => {
        const result = cert.read();
    });
});

describe("provisioning profiles", () => {
    it("lists all", () => {
        const result = provision.read();
        // TODO: Asserts
    });
    it("filters by team", () => {
        const result = provision.select(provision.read(), {
            TeamName: "Telerik AD"
        });
        // printEligable(result);
        // TODO: Asserts
    });
    it("filters by app id", () => {
        const result = provision.select(provision.read(), {
            AppId: "org.nativescript.CertTest2"
        });
        // printEligable(result);
        // TODO: Asserts
    });
    it("filters by app id and team id", () => {
        const result = provision.select(provision.read(), {
            AppId: "org.nativescript.CertTest2",
            TeamName: "Telerik AD"
        });
        // printEligable(result);
        // TODO: Asserts
    });
    it("filters by app id, team id and device", () => {
        const result = provision.select(provision.read(), {
            AppId: "org.nativescript.CertTest2",
            TeamName: "Telerik AD",
            ProvisionedDevices: ["d97ff43f5d13677a2fb09fc9b4da3066464ff5f4"]
        });
        // printEligable(result);
        // TODO: Asserts
    });
    it("find distribution profile", () => {
        const all = provision.read();
        const result = provision.select(all, {
            AppId: "org.nativescript.examples",
            TeamName: "Telerik AD"
        });
        // printEligable(result);
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
        // printEligable(result);
    });
});
