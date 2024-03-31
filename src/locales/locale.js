import en from '../locales/en.json'
import es from '../locales/es.json'
import { navigatorLang } from '../utils/navigator';

export const labels = { en, es }

export const label = (key) => {
    if (!labels[navigatorLang][key]) {
        return key;
    }
    if (!labels[navigatorLang]) {
        return labels["en"][key] + "."
    }
    return labels[navigatorLang][key] + "."
};

