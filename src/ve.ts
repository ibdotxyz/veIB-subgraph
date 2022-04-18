import { BigInt, log } from "@graphprotocol/graph-ts";
import { Deposit, Transfer } from "../generated/ve/ve";
import { DepositEvent, NFT } from "../generated/schema";
export function handleTransfer(event: Transfer): void {
  let nft = NFT.load(event.params.tokenId.toString());
  if (nft == null) {
    nft = new NFT(event.params.tokenId.toString());
  }
  nft.owner = event.params.to.toHexString();
  nft.save();
}
export function handleDeposit(event: Deposit): void {
  let depositEvent = new DepositEvent(event.transaction.hash.toHex());
  let nft = NFT.load(event.params.tokenId.toString());
  if (nft == null) {
    log.error("[handleDeposit] NFT not found #{}. Hash: {}", [
      event.params.tokenId.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  depositEvent.provider = event.params.provider.toHexString();
  depositEvent.nft = nft.id;
  depositEvent.value = event.params.value;
  depositEvent.lockTime = event.params.locktime;
  depositEvent.depositType = event.params.deposit_type;
  depositEvent.blockTimestamp = event.params.ts;
  depositEvent.save();
}
