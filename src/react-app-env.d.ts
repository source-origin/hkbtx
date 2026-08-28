/// <reference types="react-scripts" />

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isTokenPocket?: boolean;
    isTrust?: boolean;
    isBraveWallet?: boolean;
    isCoinbaseWallet?: boolean;
    selectedAddress?: string;
    chainId?: string;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
  };
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}
