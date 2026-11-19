// Starts every part of the page once it has loaded.
import { hydrate_icons } from "./icons.js";
import { setup_copy } from "./helpers.js";
import { setup_tabs } from "./tabs.js";
import { setup_back } from "./views.js";
import { setup_new_form } from "./new_form.js";
import { setup_new_submit } from "./new_submit.js";
import { setup_renew } from "./renew.js";
import { setup_check } from "./check.js";

hydrate_icons();
setup_copy();
setup_tabs();
setup_back();
setup_new_form();
setup_new_submit();
setup_renew();
setup_check();
