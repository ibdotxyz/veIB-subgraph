import { BigInt, log } from "@graphprotocol/graph-ts";
import { FeeDistCreated } from "../generated/feeDistributorFactory/feeDistributorFactory";
import {
  CheckpointToken,
  Claimed,
} from "../generated/feeDistributorFactory/feeDistributor";
import {
  FeeDistributor,
  NFT,
  FeeToken,
  FeeClaimAction,
} from "../generated/schema";
import { feeDistributor } from "../generated/templates/feeDistributor/feeDistributor";

function createFeeDist(
  contractAddress: string,
  tokenAddress: string
): FeeDistributor {
  let feeDist = new FeeDistributor(contractAddress);
  feeDist.token = tokenAddress;
  return feeDist;
}

export function handleFeeDistCreated(event: FeeDistCreated): void {
  let feeDist = FeeDistributor.load(event.params.dist.toHexString());
  if (feeDist == null) {
    feeDist = createFeeDist(
      event.params.dist.toHexString(),
      event.params.token.toHexString()
    );
  }
  feeDist.save();
}
export function handleCheckpointToken(event: CheckpointToken): void {
  let feeDist = FeeDistributor.load(
    event.address.toHexString()
  ) as FeeDistributor;
  if (feeDist == null) {
    let feeDistributorContract = feeDistributor.bind(event.address);
    feeDist = createFeeDist(
      event.address.toHexString(),
      feeDistributorContract.token().toHexString()
    );
  }
  feeDist.totalDeposited += event.params.tokens;
  feeDist.save();
}

export function handleClaimed(event: Claimed): void {
  let feeDist = FeeDistributor.load(
    event.address.toHexString()
  ) as FeeDistributor;
  if (feeDist == null) {
    let feeDistributorContract = feeDistributor.bind(event.address);
    feeDist = createFeeDist(
      event.address.toHexString(),
      feeDistributorContract.token().toHexString()
    );
    feeDist.save();
  }

  let nft = NFT.load(event.params.tokenId.toString()) as NFT;
  if (nft == null) {
    log.error("[handleClaimed] NFT not found #{}. Hash: {}", [
      event.params.tokenId.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  let feeTokenId = event.params.tokenId
    .toString()
    .concat("-")
    .concat(feeDist.token);
  let feeToken = FeeToken.load(feeTokenId);
  if (feeToken == null) {
    feeToken = new FeeToken(feeTokenId);
    feeToken.token = feeDist.token;
    feeToken.nft = nft.id;
  }

  let feeClaimAction = new FeeClaimAction(event.transaction.hash.toHex());
  feeClaimAction.nft = nft.id;
  feeClaimAction.feeDistributor = feeDist.id;
  feeClaimAction.amount = event.params.amount;
  feeClaimAction.blockTimestamp = event.block.timestamp;
  feeClaimAction.save();

  feeToken.totalClaimed += event.params.amount;
  feeToken.save();

  feeDist.totalClaimed += event.params.amount;
  feeDist.save();
}
