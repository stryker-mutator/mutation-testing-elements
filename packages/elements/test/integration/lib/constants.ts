export const constants = Object.freeze({
  BASE_URL: 'http://localhost:8080/',
});

export const MAX_WEBDRIVER_CONCURRENCY = 5;

export const DEFAULT_TIMEOUT = 8000;

/**
 * Sleep time before taking a screenshot when the page is scrolling with scroll-behaviour "smooth"
 * The exact timing function used for "smooth" scroll-behavior is browser dependent, so better be safe than sorry 🤷‍♂️
 * https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior#values
 */
export const SLEEP_FOR_SCROLL = 2000;
