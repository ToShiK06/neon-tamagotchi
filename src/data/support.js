export const SUPPORT_PHONE = '+7 (951) 727-15-79';
export const SUPPORT_PHONE_RAW = '+79517271579';
export const SUPPORT_BANK = 'Т-Банк';

// Основные ссылки для перевода через СБП
// 1. Универсальный СБП-виджет (открывает список банков на телефоне)
export const SBP_UNIVERSAL = 'https://qr.nspk.ru/';

// 2. Диплинк Т-Банка (открывает приложение Т-Банк с готовым переводом)
export const TBANK_DEEPLINK = `https://www.tbank.ru/transfers/phone/?phone=${encodeURIComponent(SUPPORT_PHONE_RAW)}`;

// 3. Веб-ссылка на перевод через Т-Банк (для ПК)
export const TBANK_WEB = 'https://www.tbank.ru/';