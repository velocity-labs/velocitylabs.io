Version support panels for the stack code audit pages (code-audit/*.html), one
file per stack, drawn by _includes/blocks/version-panel.html. A page names its
file in front matter (`versions: rails`) and shows it beside a text band with
`aside="version-panel"`.

Each file: title, source and source_url (the official support policy), checked
(the date the rows were last verified), latest (the newest release), optional
columns (the two column labels, default Bug fixes and Security fixes), and
series: a list of { name, status (supported or ended), label, bug_fixes,
security }. Re-check against the source when a release ships or support ends.
