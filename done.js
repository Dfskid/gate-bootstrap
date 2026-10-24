// Step 2 page. Reads GitHub's one-time ?code=, removes it from the address bar, and shows the
// server setup block with the code filled in. Nothing is sent anywhere; the code stays in this tab.
(function () {
  "use strict";
  var TEMPLATE = "#cloud-config\n<<: {ssh_pwauth: false, allow_public_ssh_keys: false, disable_root: true}\nwrite_files:\n- {path: /etc/gate-runner/manifest-code, permissions: 0o400, content: !!str PASTE_CODE_HERE}\nruncmd:\n- >-\n  p=/run/g1-bootstrap.sh; for i in 1 2 3 4 5; do curl -fsSLo $p https://raw.githubusercontent.com/Dfskid/gate-bootstrap/1ea8b37b1461f584b96c9f1a418e917ae114a00c/g1-bootstrap.sh && break; sleep 3; done; [ -s $p ] || { echo G1 FAILED: bootstrap download | tee /dev/tty1 /dev/ttyS0; exit 1; };\n  echo 253c413fe0e190be2d9cdf9a296a65bd225329e003d7206345a8a282c16690a3 $p | sha256sum -c - || { echo G1 FAILED: bootstrap fingerprint mismatch | tee /dev/tty1 /dev/ttyS0; exit 1; }; sh $p\n";
  var params = new URLSearchParams(window.location.search);
  var code = (params.get("code") || "").trim();
  try { window.history.replaceState(null, "", window.location.pathname); } catch (e) { /* keep going */ }
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(code) || TEMPLATE.indexOf("PASTE_CODE_HERE") < 0) {
    document.getElementById("bad").hidden = false;
    return;
  }
  var text = TEMPLATE.replace("PASTE_CODE_HERE", code);
  var pre = document.getElementById("block");
  var btn = document.getElementById("copy");
  pre.textContent = text;
  document.getElementById("good").hidden = false;
  function selectBlock() {
    var r = document.createRange();
    r.selectNodeContents(pre);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function copied() { btn.textContent = "Copied. Now go to Hetzner"; btn.className = "done"; }
  btn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(copied, function () {
        selectBlock();
        btn.textContent = "Text selected: tap Copy in the menu";
      });
    } else {
      selectBlock();
      btn.textContent = "Text selected: tap Copy in the menu";
    }
  });
})();
