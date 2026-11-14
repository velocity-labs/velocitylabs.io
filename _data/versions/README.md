Version support panels for the stack code audit pages (code-audit/*.html), one
file per stack, drawn by _includes/blocks/version-panel.html. A page names its
file in front matter (`versions: rails`) and shows it beside a text band with
`aside="version-panel"`.

Each file: title, source and source_url (the official support policy), checked
(the date the rows were last verified), latest (the newest release), optional
columns (the two column labels, default Bug fixes and Security fixes), and
series: a list of { name, status (supported or ended), label, bug_fixes,
security }. Re-check against the source when a release ships or support ends.

bin/check-versions compares each file with the project's release data (the
newest release, new release series, support dates that have passed, and a
`checked` date over 90 days old). It runs monthly in
.github/workflows/version-check.yml, which keeps a `version-check` issue open
while a panel needs updating. A new panel needs its release source added to
LATEST and SERIES in that script.
