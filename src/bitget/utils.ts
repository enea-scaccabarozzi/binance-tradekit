export const normalizeSymbol = (symbol: string, sandbox: boolean): string => {
  return `${sandbox ? 'S' : ''}${symbol.split('/')[0]}${sandbox ? 'S' : ''}${
    symbol.split('/')[1].split(':')[0]
  }`;
};
