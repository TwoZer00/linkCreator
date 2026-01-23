import en from '../locales/en.json'
import es from '../locales/es.json'
import { navigatorLang } from '../utils/navigator';

const labels = { en, es }

export const label = (key) => {
    const currentLang = labels[navigatorLang] || labels['en'];
    return currentLang[key] || labels['en'][key] || key;
};

