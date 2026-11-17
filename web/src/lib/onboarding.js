// Menandai apakah panduan pembuka sudah pernah dilihat di perangkat ini
const KEY = "rosette:onboarded";

export const onboarding = {
  isDone() {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return true; // storage tidak tersedia: jangan paksa panduan terus muncul
    }
  },
  markDone() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* abaikan */
    }
  },
};
