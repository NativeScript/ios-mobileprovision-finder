API to find an iOS mobile provision

[![Build Status](https://travis-ci.org/NativeScript/ios-mobileprovision-finder.svg?branch=master)](https://travis-ci.org/NativeScript/ios-mobileprovision-finder)

## Using as command line tool
```
Usage: ios-mobileprovision-finder -u [device uuid] -i [app bundle id]

Options:
  -h, --help      Show help                                            [boolean]
  -u, --uuid      Provide one or more device UUIDs the searched provisioning
                  profile should be able to deploy to.                   [array]
  -i, --app-id    Provide application bundle identifier the searched
                  provisioning profile should match.                    [string]
  -e, --eligable  Prints only eligable profiles       [boolean] [default: false]
  -t, --team      Provide team name the provisioning profile should belong to.
                                                                        [string]
  -p, --type      'development', 'distribution', 'adhoc' or 'all'; - specify the
                  provisioning profile type.   [string] [default: "development"]
```

Example:
```
mcsofcankov:ios-mobileprovision-finder cankov$ ios-mobileprovision-finder -e -i org.nativescript.examples -t 'Telerik A D'
eligable:
 - 'iOS Team Provisioning Profile: *' Telerik A D (exp: 5 Nov 2017) 16455071-eb38-4ebc-9a79-0ef50f76307a id: CHSQ3M3P37.* Development
 - 'NativeScriptWildCard' Telerik A D (exp: 2 Nov 2017) 3aa58a65-f8da-4c67-bce8-ff9624822e31 id: CHSQ3M3P37.* Development
 - 'iOS Team Provisioning Profile: org.nativescript.examples' Telerik A D (exp: 5 Nov 2017) f79232c0-b3b3-4b9d-be8e-f4f398cead88 id: CHSQ3M3P37.org.nativescript.examples Development
```

## JavaScript API
Read the public API from index.d.ts and the ios-mobileprovision-finder.ts command line tool for example.

``` TypeScript
import { provision, cert } from "./index";

const certificates = cert.read();
const provisionProfiles = provision.read();
const result = provision.select(provisionProfiles, {
    AppId: "org.nativescript.examples",
    TeamName: "Telerik AD",
    Certificates: certificates.valid
});
result.eligable.forEach(({Name, UUID}) => {
    console.log(` - ${Name} ${UUID}`);
});
```

## Under the hood
### Provisioning profiles
Read all files in Library/MobileDevice/Provisioning Profiles/ and scan for the plist containing provisioning profile information.
Parse the plist and keep the data.

### Certificates
List all the valid certificates in the default keychain search list using:
```
security find-identity -p codesigning
```
It yelds output such as:
```
  1) FAE6210D184FCC1707B87F1C582280A286898EE3 "iPhone Distribution: Telerik A D (CHSQ3M3P37)"
  2) 89936062DD52C7FEF2273E677AC98D109F198A84 "iPhone Developer: Panayot Cankov (3KZR3BE4ZD)" (CSSMERR_TP_CERT_REVOKED)
  3) 0F0077D3EBEA9D0AB6668B8BCB90152ACE7BA4E9 "iPhone Developer: Panayot Cankov (TT4M4FMX2A)" (CSSMERR_TP_CERT_REVOKED)
  4) 07AB20E16C86E2B548A91920B83EC27D78AFC7EB "iPhone Developer: Panayot Cankov (3KZR3BE4ZD)"
  5) 9354FAEF631DC3E9B07929F20991829FF5E21C36 "iPhone Developer: Panayot Cankov (TT4M4FMX2A)"
  6) 9D591A6ADAF9C99A9C19FC1A8EE7FA153C613441 "iPhone Distribution: Telerik AD"
```
That is then parsed and the PEMs are retrieved using:
```
security find-certificate -apZ
```

This prints the certificate SHAs, match ths SHA with the valid certs from the previous step, along PEMs.
The PEMs and cert names are combined and later certificates can be matched with the certificates in the provisioning profiles.

This relies on the cert hashes.
