// Step 2 page. Reads GitHub's one-time ?code=, removes it from the address bar, and shows the
// server setup block with the code filled in. The page sends nothing anywhere. GitHub (which issued the
// code and serves this page) receives it in the redirect; it then goes only into Hetzner via the paste.
(function () {
  "use strict";
  var TEMPLATE = "#cloud-config\n<<: {ssh_pwauth: false, allow_public_ssh_keys: false, disable_root: true}\nwrite_files:\n- {path: /etc/gate-runner/manifest-code, permissions: 0o400, content: !!str PASTE_CODE_HERE}\nruncmd:\n- >-\n  p=/run/g1-bootstrap.sh; for i in 1 2 3 4 5; do curl -fsSL -m 120 -o $p https://raw.githubusercontent.com/Dfskid/gate-bootstrap/1aaed30796358e7bdc6f5d035c89932be835cb67/g1-bootstrap.sh && break; sleep 3; done; [ -s $p ] || { echo G1 FAILED: bootstrap download | tee /dev/tty1 /dev/ttyS0; exit 1; };\n  echo b3cfc13152a8e0ac73a7ed7fc7d8856203286441449e4d4c34375d5a503d07fb $p | sha256sum -c - || { echo G1 FAILED: bootstrap fingerprint mismatch | tee /dev/tty1 /dev/ttyS0; exit 1; }; sh $p\n";
  var KEY = "g1-code";
  var params = new URLSearchParams(window.location.search);
  var code = (params.get("code") || "").trim();
  try { window.history.replaceState(null, "", window.location.pathname); } catch (e) { /* keep going */ }
  // Survive an accidental reload in the same tab; sessionStorage is cleared when the tab closes.
  try {
    if (code) { window.sessionStorage.setItem(KEY, code); } else { code = window.sessionStorage.getItem(KEY) || ""; }
  } catch (e) { /* storage blocked: reload shows step 1 */ }
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(code) || TEMPLATE.indexOf("PASTE_CODE_HERE") < 0) {
    document.getElementById("bad").hidden = false;
    return;
  }
  var text = TEMPLATE.replace("PASTE_CODE_HERE", code);
  var box = document.getElementById("block");
  var btn = document.getElementById("copy");
  var manual = document.getElementById("manual");
  box.value = text;
  document.getElementById("good").hidden = false;
  function copied() { btn.textContent = "Copied. Now go to Hetzner"; btn.className = "done"; }
  function legacyCopy() {
    box.focus();
    box.setSelectionRange(0, box.value.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    if (ok) { copied(); } else { btn.textContent = "Copy did not work"; manual.hidden = false; }
  }
  btn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(copied, legacyCopy);
    } else {
      legacyCopy();
    }
  });
})();
