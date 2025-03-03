import BigNumber from 'bignumber.js';

import config from 'config';

BigNumber.prototype.scaleBy = function (decimals?: number): BigNumber | undefined {
  if (decimals === undefined) {
    return undefined;
  }

  return this.multipliedBy(10 ** decimals);
};

BigNumber.prototype.unscaleBy = function (decimals?: number): BigNumber | undefined {
  if (decimals === undefined) {
    return undefined;
  }

  return this.dividedBy(10 ** decimals);
};

BigNumber.ZERO = new BigNumber(0);
BigNumber.MAX_UINT_256 = new BigNumber(2).pow(256).minus(1);

BigNumber.from = (value?: BigNumber.Value): BigNumber | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const bnValue = new BigNumber(value);

  if (bnValue.isNaN()) {
    return undefined;
  }

  return bnValue;
};

BigNumber.sumEach = <T = any>(items: T[], predicate: (item: T) => BigNumber | undefined): BigNumber | undefined => {
  let sum = BigNumber.ZERO;

  for (let item of items) {
    const val = predicate?.(item);

    if (!val || val.isNaN()) {
      return undefined;
    }

    sum = sum.plus(val);
  }

  return sum;
};

export const MAX_UINT_256 = new BigNumber(2).pow(256).minus(1);
export const ZERO_BIG_NUMBER = new BigNumber(0);
export const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000';

export function getEtherscanTxUrl(txHash?: string, chainId = config.web3.chainId): string | undefined {
  if (txHash) {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/tx/${txHash}`;
      case 4:
        return `https://rinkeby.etherscan.io/tx/${txHash}`;
      case 42:
        return `https://kovan.etherscan.io/tx/${txHash}`;
      default:
    }
  }

  return undefined;
}

export function getEtherscanAddressUrl(address?: string, chainId = config.web3.chainId): string | undefined {
  if (address) {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/address/${address}`;
      case 4:
        return `https://rinkeby.etherscan.io/address/${address}`;
      case 42:
        return `https://kovan.etherscan.io/address/${address}`;
      default:
    }
  }

  return undefined;
}

export function getEtherscanABIUrl(
  address?: string,
  apiKey?: string,
  chainId = config.web3.chainId,
): string | undefined {
  if (address) {
    switch (chainId) {
      case 1:
        return `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;
      case 4:
        return `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;
      case 42:
        return `https://api-kovan.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;
      default:
    }
  }

  return undefined;
}

export function getExponentValue(decimals = 0): BigNumber {
  return new BigNumber(10).pow(decimals);
}

export function getHumanValue(value?: BigNumber, decimals = 0): BigNumber | undefined {
  return value?.div(getExponentValue(decimals));
}

export function getNonHumanValue(value: BigNumber | number, decimals = 0): BigNumber {
  return new BigNumber(value).multipliedBy(getExponentValue(decimals));
}

export function getGasValue(price: number): number {
  return getNonHumanValue(price, 9).toNumber();
}

export function formatBigValue(
  value?: BigNumber | number,
  decimals = 4,
  defaultValue = '-',
  minDecimals: number | undefined = undefined,
): string {
  if (value === undefined) {
    return defaultValue;
  }

  const bnValue = new BigNumber(value);

  if (bnValue.isNaN()) {
    return defaultValue;
  }

  return new BigNumber(bnValue.toFixed(decimals)).toFormat(minDecimals);
}

type FormatNumberOptions = {
  decimals?: number;
};

export function formatNumber(value: number | BigNumber | undefined, options?: FormatNumberOptions): string | undefined {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }

  const { decimals } = options ?? {};

  const val = BigNumber.isBigNumber(value) ? value.toNumber() : value;

  return Intl.NumberFormat('en', {
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatPercent(value: number | BigNumber | undefined, decimals: number = 2): string | undefined {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }

  const rate = BigNumber.isBigNumber(value) ? value.toNumber() : value;

  return (
    Intl.NumberFormat('en', {
      maximumFractionDigits: decimals,
    }).format(rate * 100) + '%'
  );
}

type FormatTokenOptions = {
  tokenName?: string;
  decimals?: number;
  minDecimals?: number;
  maxDecimals?: number;
  scale?: number;
  compact?: boolean;
};

export function formatToken(value: number | BigNumber | undefined, options?: FormatTokenOptions): string | undefined {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined;
  }

  let val = new BigNumber(value);

  if (val.isNaN()) {
    return undefined;
  }

  if (options) {
    if (options.hasOwnProperty('scale') && options.scale === undefined) {
      return undefined;
    }
  }

  const { tokenName, compact = false, decimals = 4, minDecimals, scale = 0 } = options ?? {};

  if (scale > 0) {
    val = val.unscaleBy(scale)!;
  }

  let str = '';

  if (compact) {
    str = Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(val.toNumber());
  } else {
    str = new BigNumber(val.toFixed(decimals)).toFormat(minDecimals);
  }

  return tokenName ? `${str} ${tokenName}` : str;
}

type FormatUSDOptions = {
  decimals?: number;
  compact?: boolean;
};

export function formatUSD(
  value: number | BigNumber | string | undefined,
  options?: FormatUSDOptions,
): string | undefined {
  let val = value;

  if (val === undefined || val === null) {
    return undefined;
  }

  if (typeof val === 'string') {
    val = Number(val);
  }

  if (BigNumber.isBigNumber(val)) {
    if (val.isNaN()) {
      return undefined;
    }
  } else if (typeof val === 'number') {
    if (!Number.isFinite(val)) {
      return undefined;
    }
  }

  const { decimals = 2, compact = false } = options ?? {};

  if (0 > decimals || decimals > 20) {
    console.trace(`Decimals value is out of range 0..20 (value: ${decimals})`);
    return undefined;
  }

  let str = '';

  if (compact) {
    str = Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: decimals !== 0 ? decimals : undefined,
    }).format(BigNumber.isBigNumber(val) ? val.toNumber() : val);
  } else {
    str = new BigNumber(val.toFixed(decimals)).toFormat(decimals);
  }

  return `$${str}`;
}

export function formatUSDValue(value?: BigNumber | number, decimals = 2, minDecimals: number = decimals): string {
  if (value === undefined) {
    return '-';
  }

  const val = BigNumber.isBigNumber(value) ? value : new BigNumber(value);
  const formattedValue = formatBigValue(val.abs(), decimals, '-', minDecimals);

  return val.isPositive() ? `$${formattedValue}` : `-$${formattedValue}`;
}

export function formatLeagValue(value?: BigNumber): string {
  return formatBigValue(value, 4);
}

export function isSmallLeagValue(value?: BigNumber): boolean {
  return !!value && value.gt(ZERO_BIG_NUMBER) && value.lt(0.0001);
}

export function shortenAddr(addr: string | undefined, first = 6, last = 4): string | undefined {
  return addr ? [String(addr).slice(0, first), String(addr).slice(-last)].join('...') : undefined;
}

export function fetchContractABI(address: string): any {
  const url = getEtherscanABIUrl(address, config.web3.etherscan.apiKey);

  if (!url) {
    return Promise.reject();
  }

  return fetch(url)
    .then(result => result.json())
    .then(({ status, result }: { status: string; result: string }) => {
      if (status === '1') {
        return JSON.parse(result);
      }

      return Promise.reject(result);
    });
}

type GasPriceResult = {
  veryFast: number;
  fast: number;
  average: number;
  safeLow: number;
};

export function fetchGasPrice(): Promise<GasPriceResult> {
  return fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${config.web3.etherscan.apiKey}`)
    .then(result => result.json())
    .then(result => result.result)
    .then(result => {
      return {
        veryFast: Number(result.FastGasPrice),
        fast: Number(result.ProposeGasPrice),
        average: Math.round((Number(result.ProposeGasPrice) + Number(result.SafeGasPrice)) / 2),
        safeLow: Number(result.SafeGasPrice),
      };
    });
}
