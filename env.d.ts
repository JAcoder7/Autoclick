/// <reference types="vite/client" />
/// <reference types="chrome" />


type Data = {
  items: {
    [id: string]: {
      selector: string,
      urlPattern: string,
      enabled: boolean,
      outerHTML: string,
      checkOuterHTML: boolean,
      lastError: null | string,
      once:boolean
    }
  }
}