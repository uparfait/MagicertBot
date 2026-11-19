// Starts every part of the page once it has loaded.
import { setup_tabs } from "./tabs.js";
import { setup_drop_zones } from "./files.js";
import { setup_new_certificate } from "./new_certificate.js";
import { setup_check_certificate } from "./check_certificate.js";

setup_tabs();
setup_drop_zones();
setup_new_certificate();
setup_check_certificate();
