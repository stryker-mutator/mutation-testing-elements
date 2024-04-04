declare module 'http' {
  interface ServerResponse {
    /**
     * Forces the partially-compressed response to be flushed to the client.
     *
     * Only available when using compression.
     */
    flush?: () => void;
  }
}
