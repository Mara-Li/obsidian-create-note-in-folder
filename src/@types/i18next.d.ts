import { ressources } from "../i18n/i18next";

declare module "i18next" {
    interface CustomTypeOptions {
        resources: typeof ressources["en"];
        returnNull: false
    }
}
