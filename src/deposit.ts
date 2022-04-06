import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  Deposit
} from '../generated/ve/ve';
import { DepositEvent } from '../generated/schema';

export function handleDeposit(event: Deposit): void {
  let depositEvent = new DepositEvent(event.transaction.hash.toHex())
  depositEvent.provider = event.params.provider.toHexString()
  depositEvent.tokenId = event.params.tokenId;
  depositEvent.value = event.params.value;
  depositEvent.lockTime = event.params.locktime
  depositEvent.depositType = event.params.deposit_type
  depositEvent.blockTimestamp = event.params.ts
  depositEvent.save()
}