// Shared field styling for the dark-theme forms (checkout and /account).
// Kept in one place so the account pages and the checkout can never drift into
// looking like two different sites.

export const INPUT_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm " +
  "placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors";

export const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none`;

// Native <select> arrows cannot be recoloured, so the chevron is an inline SVG
// background and the built-in one is hidden with appearance-none.
export const SELECT_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-brand-yellow/60 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff80%22%3E%3Cpath%20d%3D%22M5.5%207.5L10%2012l4.5-4.5z%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_0.75rem_center] bg-no-repeat pr-10";

export const CARD_CLASS = "section-card rounded-2xl p-6 border border-white/5";
