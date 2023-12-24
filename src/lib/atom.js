import { atom } from 'recoil';

export const activeTab = atom({
    key: 'Tab',
    default: 0,
  });
  export const colaps = atom({
    key: 'Colaps',
    default: true,
  });