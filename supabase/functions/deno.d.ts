/// <reference no-default-lib="true" />
/// <reference lib="deno.window" />
/// <reference lib="esnext" />

declare const Deno: {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
  // Add other Deno globals as needed
};

// Add global types that are missing in Deno
declare const console: Console;
declare const Error: ErrorConstructor;
declare const Array: ArrayConstructor;

declare interface Console {
  log(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
}
