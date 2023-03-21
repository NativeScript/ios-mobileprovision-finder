Result = Certificate*
Certificate = hash256:SHA256Header? hash:SHAHeader PEMStart pem:PEM PEMEnd { return { hash, pem }}
SHA256Header = 'SHA-256 hash: ' hash256:$[0-9a-fA-F]* '\n' { return hash256; }
SHAHeader = 'SHA-1 hash: ' hash:$[0-9a-fA-F]* '\n' { return hash; }
PEMStart = '-----BEGIN CERTIFICATE-----\n'
PEM = pem:$[A-Za-z0-9+/\n=]* { return pem.trim('\n'); }
PEMEnd = '-----END CERTIFICATE-----\n'
