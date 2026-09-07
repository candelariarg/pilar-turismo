import i18next from 'i18next';
import { initReactI18next, Translation} from 'react-i18next';
import {getLocales} from 'expo-localization';

import es from './locales/es.json';
import en from './locales/en.json';

const devicelanguage = getLocales()[0]?.languageCode ?? 'es';

i18next.use(initReactI18next).init({
    resources: {
        es: {translation: es},
        en: {translation: en}
    },
    lng: devicelanguage === 'en' ? 'en' : 'es',
    fallbackLng: 'es',
    interpolation: {escapeValue: false}  
});

export default i18next;