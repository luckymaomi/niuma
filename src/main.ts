import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { createController } from "./ui/controller";

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Missing #app");

createController(app);
