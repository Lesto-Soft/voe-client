import moment from "moment";
import "moment/dist/locale/bg";

// Force bg as global locale — must run after the locale file is loaded
moment.locale("bg");

// Customize relative time strings (overrides default bg relativeTime)
moment.updateLocale("bg", {
  relativeTime: {
    past: (input: string) =>
      input === "няколко секунди" ? "току-що" : `преди ${input}`,
    s: "няколко секунди",
    ss: "%d секунди",
    m: "минута",
    mm: "%d минути",
    h: "час",
    hh: "%d часа",
    d: "ден",
    dd: "%d дни",
    M: "месец",
    MM: "%d месеца",
    y: "година",
    yy: "%d години",
  },
});

// Verify locale is set (will log during dev)
if (moment.locale() !== "bg") {
  console.warn("[moment-setup] Expected locale 'bg', got:", moment.locale());
}
