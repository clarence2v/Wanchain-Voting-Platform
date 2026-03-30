import { ProposalCategory, PledgeType, ProposalState, ProposalInfo, FundInfo, VoteType, VoterInfo } from "@wandevs/governance-contracts-sdk"

export type HexType = `0x${string}`

export type DescriptionType = {
  version: number,
  title: string,
  email: string,
  description: string,
  telegram: string
}

export type ProposerFundInfoType = {
  claimStWanAmount: number,
  claimWanAmount: number,
  exited: boolean,
  lockDuration: number,
  pledgeType: PledgeType,
  reason: HexType,
  requestId: number,
  wanAmount: number,
  wanPower: number
}

export type TallyType = {
  yes: number,
  no: number
}

export type OriginalSerializeProposalInfoType= {
  description: HexType,
  proposalId: HexType,
  category: ProposalCategory,
  fundraisingDeadline: number,
  proposer: HexType,
  proposerFundInfo: ProposerFundInfoType,
  reason: HexType,
  requestMinVotingWanPower: number,
  requestWanAmount: number,
  requireXpAmount: number,
  state: ProposalState,
  submitTimestamp: number,
  tally: TallyType,
  totalBurnedWanAmount: number,
  totalClaimeStWanAmount: number,
  totalLockingWanAmount: number,
  totalPledgingWanAmount: number,
  totalPledgingWanPower: number,
  totalStWanAmount: number,
  totalVotingWanAmount: number,
  totalVotingWanPower: number,
  totalWanAmount: number,
  voteDeadline: number,
}

export type ProposalInfoType = {
  description: DescriptionType,
  proposalId: HexType,
  category: ProposalCategory,
  fundraisingDeadline: number,
  proposer: HexType,
  proposerFundInfo: ProposerFundInfoType,
  reason: HexType,
  requestMinVotingWanPower: number,
  requestWanAmount: number,
  requireXpAmount: number,
  state: ProposalState,
  submitTimestamp: number,
  tally: TallyType,
  totalBurnedWanAmount: number,
  totalClaimeStWanAmount: number,
  totalLockingWanAmount: number,
  totalPledgingWanAmount: number,
  totalPledgingWanPower: number,
  totalStWanAmount: number,
  totalVotingWanAmount: number,
  totalVotingWanPower: number,
  totalWanAmount: number,
  voteDeadline: number,
}

export type OriginalProposalInfoListType = Array<ProposalInfo>

export type ProposalInfoListType = Array<ProposalInfoType>

export type OriginalSerializeProposalInfoListType = Array<OriginalSerializeProposalInfoType>

export type FundInfoType = {
  wanAmount: number,
  wanPower: number,
  requestId: number,
  claimStWanAmount: number,
  claimWanAmount: number,
  lockDuration: number,
  pledgeType: PledgeType;
  reason: HexType,
  exited: boolean,
};

export type VoterInfoType = {
  fundInfo: FundInfoType,
  voteType: VoteType,
}

export type OriginalMyVoteInfoType = {
  proposalInfo: ProposalInfo,
  voterInfo: VoterInfo
}

export type MyVoteInfoType = {
  proposalInfo: ProposalInfoType,
  voterInfo: VoterInfoType
}

export type PlegeMultiplierReturn = {
  pledgeType: PledgeType,
  lockDuration: number,
  multiplier: number,
}

export type ProposalItemStatusType = 'proposal' | 'vote'

export type ProposalType = 'all' | 'active' | 'prospective' | 'passed' | 'failed'