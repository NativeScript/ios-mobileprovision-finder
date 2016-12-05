Result = Certificate*
Certificate = hash:SHAHeader PEMStart pem:PEM PEMEnd { return { hash, pem }}
SHAHeader = 'SHA-1 hash: ' hash:$[0-9a-fA-F]* '\n' { return hash; }
PEMStart = '-----BEGIN CERTIFICATE-----\n'
PEM = pem:$[A-Za-z0-9+/\n=]* { return pem.trim('\n'); }
PEMEnd = '-----END CERTIFICATE-----\n'
