# gate-bootstrap

Phone setup page and sha256-pinned bootstrap for the Vandelay gate-isolated runner host. No secrets live here.
The one-time GitHub code reaches GitHub (which issued it and serves this page) in the redirect, stays in the
browser tab, and goes only into Hetzner via the paste. The page itself sends nothing anywhere.
Source of truth: Vandelay-Org/cmf-kernel ops/gate-runner/v2 (the bootstrap is generated there, byte-identical).
