// typescript this someday pls

import { ref, watch } from "vue";

const darkStyle = {
  "--background-color": "var(--darkmode-background-color)",
  "--white": "var(--darkmode-white)",
  "--black": "var(--darkmode-black)",
  "--slyColor": "var(--darkmode-slyColor)",
  "--rogue-red": "var(--darkmode-rogue-red)",
  "--rogue-red-active": "var(--darkmode-rogue-red-active)",
  "--filter": 1
};

const lightStyle = {
  "--background-color": "#fff",
  "--white": "#f6f6f6",
  "--black": "#000",
  "--slyColor": "#414569",
  "--rogue-red": "#ffeef0",
  "--rogue-red-active": "#fdaeb7",
  "--filter": 0
};

export const isDark = ref(false);

watch(isDark, () => {
  const newStyle = isDark.value ? darkStyle : lightStyle;
  Object.entries(newStyle).forEach(([prop, value]) => {
    document.documentElement.style.setProperty(prop, value);
  });
  localStorage.setItem("dark", isDark.value);
});

isDark.value = localStorage.getItem("dark") === "true";
