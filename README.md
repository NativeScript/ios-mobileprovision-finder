# ios-mobileprovision-finder
API to find an iOS mobile provision

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
