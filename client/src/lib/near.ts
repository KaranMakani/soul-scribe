import { connect, WalletConnection, keyStores, Contract } from 'near-api-js';

export interface NearWalletInfo {
  walletId: string;
  publicAddress: string;
}

const CONTRACT_ID = 'ito-sbt-token.testnet';

const nearConfig = {
  networkId: 'testnet',
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://testnet.mynearwallet.com/',
  helperUrl: 'https://helper.testnet.near.org',
  contractName: CONTRACT_ID,
  headers: {},
};

let wallet: WalletConnection;
let contract: Contract;

export async function initNearWallet() {
  const near = await connect(nearConfig);
  wallet = new WalletConnection(near, 'soul-scribe');

  if (wallet.isSignedIn()) {
    const account = wallet.account();
    contract = new Contract(account, CONTRACT_ID, {
      viewMethods: ['get_tokens'],
      changeMethods: ['mint'],
      useLocalViewExecution: true,
    });
  }

  window.connectNearWallet = connectNearWallet;
}

export async function connectNearWallet(): Promise<NearWalletInfo | null> {
  if (!wallet) {
    console.warn("Wallet not initialized. Call initNearWallet first.");
    return null;
  }

  if (!wallet.isSignedIn()) {
    wallet.requestSignIn({
      contractId: CONTRACT_ID,
      successUrl: window.location.origin,
      failureUrl: window.location.origin,
      keyType: 'ed25519',
    });
    return null;
  }

  const accountId = wallet.getAccountId();
  const publicKey = (await wallet.account().connection.signer.getPublicKey(accountId, nearConfig.networkId)).toString();

  return {
    walletId: accountId,
    publicAddress: publicKey,
  };
}

export function isSignedIn(): boolean {
  return wallet?.isSignedIn() || false;
}

export function logoutNearWallet() {
  wallet?.signOut();
  window.location.reload();
}

export async function mintSBT(accountId: string, metadata: string) {
  if (!contract) throw new Error("Contract is not initialized. Did you call initNearWallet()?");
  if (!wallet || !wallet.isSignedIn()) throw new Error("Wallet is not signed in");
  
  const tokenId = await (contract as any).mint({
    args: { accountId, metadata }
  });

  return tokenId;
}

export async function getUserTokens(accountId: string) {
  if (!contract) throw new Error("Contract not initialized.");

  return await (contract as any).get_tokens({ accountId });
}

declare global {
  interface Window {
    connectNearWallet: () => Promise<NearWalletInfo | null>;
  }
}
