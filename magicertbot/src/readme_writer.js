const long_date = (iso) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// A plain guide that explains each file in the zip.
function make_readme(info) {
  return [
    `Your certificate files for ${info.name}`,
    `Made with MagicertBot on ${long_date(new Date().toISOString())}`,
    "",
    "This certificate keeps these addresses safe with HTTPS:",
    ...info.domains.map((domain) => `  - ${domain}`),
    "",
    `It was issued by ${info.issuer} on ${long_date(info.from)}.`,
    `It ends on ${long_date(info.to)}. Renew it before then by uploading`,
    "this zip in the Renew tab of MagicertBot.",
    "",
    "What each file is for",
    "---------------------",
    "cert.pem        Your certificate on its own.",
    "chain.pem       The middle certificate. It links yours to a root",
    "                that browsers already trust.",
    "fullchain.pem   cert.pem and chain.pem together. Most web servers",
    "                want this one.",
    "privkey.pem     Your private key. Keep it secret. Anyone who has it",
    "                can pretend to be your website.",
    "",
    "How to use them in Nginx",
    "  ssl_certificate      /path/to/fullchain.pem;",
    "  ssl_certificate_key  /path/to/privkey.pem;",
    "",
    "How to use them in Apache",
    "  SSLCertificateFile    /path/to/fullchain.pem",
    "  SSLCertificateKeyFile /path/to/privkey.pem",
    "",
    "Change /path/to/ to the folder where you put these files, then",
    "reload your web server.",
    "",
    "Keep this zip somewhere safe. You can upload it to MagicertBot",
    "later to renew or check this certificate.",
    "",
  ].join("\r\n");
}

module.exports = { make_readme };
