import {
  NearBindgen, call, view, initialize, UnorderedMap
} from 'near-sdk-js';

// Define a token structure
type Token = {
  id: string;
  metadata: string;
};

@NearBindgen({})
class SBTContract {
  userTokens = new UnorderedMap<Token[]>("v-uid");

  @initialize({ privateFunction: true })
  init({ userTokens }: { userTokens: UnorderedMap<Token[]> }): void {
    this.userTokens = userTokens;
  }

  @call({})
  mint({ accountId, metadata }: { accountId: string, metadata: string }): string {
    const existingTokens = this.userTokens.get(accountId) || [];

    const newTokenId = `${Math.floor(100000000000 + Math.random() * 900000000000)}-${existingTokens.length + 1}`;

    const newToken: Token = {
      id: newTokenId,
      metadata,
    };

    existingTokens.push(newToken);
    this.userTokens.set(accountId, existingTokens);

    return newTokenId;
  }

  @view({})
  get_tokens({ accountId }: { accountId: string }): Token[] {
    return this.userTokens.get(accountId) || [];
  }
}
