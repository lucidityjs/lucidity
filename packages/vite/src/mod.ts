/**
 * The official Vite plugin for Lucidity.
 * @module
 */

import type { Plugin } from "npm:vite@5.4.10";
import { lucidity } from "jsr:@lucidity/compiler@0.1.11";

/**
 * Creates the Lucidity Vite plugin.
 */
export default (): Plugin => {
    return {
        name: "lucidity",
        enforce: "pre",
        transform(src, id) {
            if(/\.(js|ts|jsx|tsx)$/.test(id)) {
                return {
                    code: lucidity(src)
                }
            }
        }
    }
}