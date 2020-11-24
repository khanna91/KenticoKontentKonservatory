import { writable } from 'svelte/store';

export const localStore = <T>(key: string, defaultValue?: T) => {
  if (typeof window !== "undefined") {
    defaultValue = JSON.parse(localStorage.getItem(key));

    window.addEventListener(
      "storage",
      (event) => event.key === key && set(JSON.parse(event.newValue))
    );
  }

  const { subscribe, set, update } = writable(defaultValue);

  return {
    subscribe,
    set: (value: T) =>
      typeof window !== "undefined" &&
      localStorage.setItem(key, JSON.stringify(value)),
  };
};
