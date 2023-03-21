// Parses results from calls to `security find-identity -p codesigning`

// TODO: What if there are no valid, or no matching profiles...

Result = NL? policy:Policy? matching:MatchingIdentities NL valid:ValidIdentities NL?
{ return { policy, matching, valid }}

Policy = 'Policy: ' policy:StringToNL NL { return policy }
MatchingIdentities = WS 'Matching identities' NL identities:Identity* MatchingIdentitiesCount { return identities };
ValidIdentities = WS 'Valid identities only' NL identities:Identity* count:MatchingValidIdentitiesCount { return identities };
Identity = WS Number ')' WS hash:Hash WS name:Name issue:Issue? NL { return issue ? { hash, name, issue } : { hash, name }}

Number = $[1-9][0-9]* / '0'
Hash = $[0-9a-fA-F]*
Name = '"' literal:$[^'"']* '"' { return literal; }
Issue = WS '(' code:$[^)]* ')' { return code; }
WS = ' '*
NL = '\n'
StringToNL = $[^\n]*

MatchingIdentitiesCount = WS c:Number WS 'identities found' WS NL
MatchingValidIdentitiesCount = WS c:Number WS 'valid identities found' WS NL
