import "./style.css";
import { mount } from "@lucidity/core";
import Counter from "./components/Counter.tsx";

mount(document.querySelector("#app")!, () => Counter({}));