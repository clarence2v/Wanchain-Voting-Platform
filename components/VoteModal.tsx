import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab
} from "@heroui/react";
import Image from "next/image";
import "./VoteModal.css";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from 'next-themes';
import { ProposalInfoType, PlegeMultiplierReturn } from "@/types/proposalTypes";
import BigNumber from "bignumber.js";
import { formatValue, convertBigIntToNumber, handleTimeThMaxPer } from "@/utils/utils";
import { useSdk } from "@/app/providers";
import { useAccount } from "wagmi";
import {
  waitForTransactionReceipt,
  sendTransaction,
} from '@wagmi/core';
import { walletConfig } from "@/app/wagmi";
import { toHex } from "viem";
import { decodeProposalDescriptionData } from "@wandevs/governance-contracts-sdk";

const wanDecimal = 18;

export default function VoteModal(props: {
  proposalInfo: ProposalInfoType,
  isOpen: boolean,
  onClose: () => void,
  proposalWanMultiplierCount: number,
  votingWanMultiplierCount: number
}) {
  const {
    isOpen, onClose, proposalInfo, proposalWanMultiplierCount, votingWanMultiplierCount
  } = props;
  proposalInfo.state = 3;
  const { theme } = useTheme();
  const isdark = useMemo(() => theme === 'dark', [theme])
  const sdk = useSdk();
  const { address } = useAccount();
  const [voteType, setVoteType] = useState(true);
  const [pledgeType, setVoteValue] = useState(2);   // burn: 1   lock: 2
  const [voteDurationIndex, setVoteDurationIndex] = useState(0);
  const [voteAmount, setVoteAmount] = useState('');
  const [burnMultiplierInfo, setBurnMultiplierInfo] = useState<PlegeMultiplierReturn>({
    pledgeType: 0,
    lockDuration: 0,
    multiplier: 0
  });
  const [lockMultiplierArr, setLockMultiplierArr] = useState<Array<PlegeMultiplierReturn>>([])
  const [sponsorLockMultiplierInfo, setSponsorLockMultiplierInfo] = useState<PlegeMultiplierReturn>({
    pledgeType: 0,
    lockDuration: 0,
    multiplier: 0
  });
  const [sponsorBurnMultiplierInfo, setSponsorBurnMultiplierInfo] = useState<PlegeMultiplierReturn>({
    pledgeType: 0,
    lockDuration: 0,
    multiplier: 0
  });

  useEffect(() => {
    setVoteType(true)
    setVoteValue(2)
    setVoteDurationIndex(0)
    setVoteAmount('')
  }, [isOpen])

  useEffect(() => {
    const getMultipliers = async () => {
      if (!sdk || proposalWanMultiplierCount === void 0 || votingWanMultiplierCount === void 0) {
        console.error('sdk init')
        return
      }
      const multipliers = await sdk.getProposalMultipliers({
        proposalWanMultiplier: {
          start: 0,
          end: Math.max(proposalWanMultiplierCount - 1, 0)
        },
        votingWanMultiplier : {
          start: 0,
          end: Math.max(votingWanMultiplierCount - 1, 0)
        }
      })
      console.log('multipliers', multipliers)
      const { votingWanMultipliers, proposalWanMultipliers } = multipliers
      const votingWanMultipliersArr = convertBigIntToNumber(votingWanMultipliers)
      let lockMultiplierArray: Array<PlegeMultiplierReturn> = [];
      votingWanMultipliersArr.forEach((v: PlegeMultiplierReturn) => {
        if (v.pledgeType === 1) {
          // burn
          setBurnMultiplierInfo(v)
        } else {
          lockMultiplierArray.push(v)
        }
      })
      setLockMultiplierArr(lockMultiplierArray)
      const proposalWanMultipliersArr = convertBigIntToNumber(proposalWanMultipliers)
      proposalWanMultipliersArr.forEach((v: PlegeMultiplierReturn) => {
        if (v.pledgeType === 1) {
          // burn
          setSponsorBurnMultiplierInfo(v)
        } else {
          setSponsorLockMultiplierInfo(v)
        }
      })

    }
    getMultipliers()
  }, [sdk, proposalWanMultiplierCount, votingWanMultiplierCount, isOpen])

  const isProspective = useMemo(() => {
    return proposalInfo?.state === 3
  }, [proposalInfo])

  const durationPer = useMemo(() => {
    if (isProspective) {
      if (pledgeType === 2) {
        // lock
        return sponsorLockMultiplierInfo.multiplier
      } else {
        return sponsorBurnMultiplierInfo.multiplier
      }
    } else {
      if (pledgeType === 2) {
        // lock
        if (!lockMultiplierArr.length) return 0
        return lockMultiplierArr[voteDurationIndex].multiplier
      } else {
        return burnMultiplierInfo.multiplier
      }
    }
  }, [pledgeType, voteDurationIndex, burnMultiplierInfo, lockMultiplierArr, sponsorLockMultiplierInfo, sponsorBurnMultiplierInfo, isProspective])

  const curDuration = useMemo(() => {
    if (isProspective) {
      if (pledgeType === 2) {
        // lock
        return sponsorLockMultiplierInfo.lockDuration
      } else {
        return sponsorBurnMultiplierInfo.lockDuration
      }
    } else {
      if (pledgeType === 2) {
        // lock
        if (!lockMultiplierArr.length) return 0
        return lockMultiplierArr[voteDurationIndex].lockDuration
      } else {
        return burnMultiplierInfo.lockDuration
      }
    }
  }, [pledgeType, voteDurationIndex, burnMultiplierInfo, lockMultiplierArr, sponsorLockMultiplierInfo, sponsorBurnMultiplierInfo, isProspective])

  const handleVoteAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVoteAmount(value);
  }

  const voteWanPower = useMemo(() => {
    const num = Number(voteAmount)
    const wanPower = new BigNumber(num).times(durationPer).toFormat();
    return wanPower;
  }, [voteAmount, durationPer])

  const handleConfirm = async () => {
    if (!sdk || !address) {
      console.error('sdk init or not connect')
      return
    }
    const pledgeWanAmount = new BigNumber(voteAmount).times(Math.pow(10, wanDecimal)).toString()
    if (new BigNumber(proposalInfo.requestMinVotingWanPower).div(Math.pow(10, wanDecimal)).gte(pledgeWanAmount)) {
      console.error('invalid amount')
      return
    }
    const voteTypeNum = voteType ? 1 : 2
    const reason = toHex('');
    // walletClient.account, proposalId, pledgeWanAmount, lockDuration, pledgeType, voteType, toHex(reason)
    let request
    if (isProspective) {
      request = await sdk.buildContributeProposalTx(
        address,
        proposalInfo.proposalId,
        BigInt(pledgeWanAmount),
        pledgeType,
        reason
      )
    } else {
      request = await sdk.buildVoteProposalTx(
        address,
        proposalInfo.proposalId,
        BigInt(pledgeWanAmount),
        BigInt(curDuration),
        pledgeType,
        voteTypeNum,
        reason
      )
    }
    const hash = await sendTransaction(walletConfig, request);

    console.log('isProspective: ', isProspective, 'raw tx hash', hash);

    // 4. 等待上链（可选）
    const receipt = await waitForTransactionReceipt( walletConfig, { hash });
    console.log('raw tx receipt', receipt);
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          base: "w-[480] max-w-[480] m-0 p-0",
          closeButton: "top-6 right-6",
          body: "gap-0"
        }}
        closeButton={
          <div className="top-6 right-6">
            <Image src="/close_icon.svg" width={20} height={20} alt="close icon" />
          </div>
        }
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex pt-6 pb-2">
                {
                  isProspective ? (
                    <div className="vote-modal-type-sponsor">Sponsor Proposal</div>
                  ) : (
                    <div className="vote-modal-type">VOTE NOW</div>
                  )
                }
              </ModalHeader>
              <ModalBody>
                <div className="vote-modal-title pb-3">
                  {proposalInfo?.description?.title}
                  <div className="line"></div>
                </div>
                {
                  !isProspective ? (
                    <>
                      <p className="vote-modal-item-title pt-7 mb-2">
                        I Want to Vote
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div
                          className={`vote-type-item ${voteType && "vote-selected-yes"}`}
                          onClick={() => setVoteType(true)}
                        >
                          <Image
                            className="normal-icon-size mr-1.5"
                            src={voteType ? "/favor_selected.svg" : "/favor_notselected.svg"}
                            width={18}
                            height={18}
                            alt="favor icon"
                          />
                          &nbsp;Yes
                        </div>
                        <div
                          className={`vote-type-item ${!voteType && "vote-selected-no"}`}
                          onClick={() => setVoteType(false)}
                        >
                          <Image
                            className="normal-icon-size mr-1.5"
                            src={!voteType ? "/against_selected.svg" : "/against_notselected.svg"}
                            width={18}
                            height={18}
                            alt="favor icon"
                          />
                          &nbsp;No
                        </div>
                      </div>
                    </>
                  ) : null
                }
                <p className={`vote-modal-item-title mb-2 ${isProspective ? 'pt-7' : ''}`}>
                  VOTING MECHANISM
                </p>
                <div className="voting-mechanism-con grid grid-cols-2 gap-0 mb-6">
                  <div
                    className={`voting-mechanism-item ${pledgeType === 2 ? isProspective ? "bg-customPurple-0 text-white" : "bg-customBlue-0 text-white" : ""}`}
                    onClick={() => setVoteValue(2)}
                  >
                    <Image
                      className="normal-icon-size mr-1.5"
                      src={pledgeType === 2 ? "/lock_selected_icon.svg" : "/lock_notselected_icon.svg"}
                      width={18}
                      height={18}
                      alt="favor icon"
                    />&nbsp;Lock (Bond)
                  </div>
                  <div
                    className={`voting-mechanism-item ${pledgeType === 1 && "bg-customYellow-0 text-white"}`}
                    onClick={() => setVoteValue(1)}
                  >
                    <Image
                      className="normal-icon-size mr-1.5"
                      src={pledgeType === 1 ? "/burn_selected_icon.svg" : "/burn_notselected_icon.svg"}
                      width={18}
                      height={18}
                      alt="favor icon"
                    />&nbsp;Burn (Consume)
                  </div>
                </div>
                <p className="vote-modal-item-title mb-2">
                  Select lock duration multiplier:
                </p>
                {
                  pledgeType === 2 ? 
                    isProspective ? (
                      <>
                        <div className="sponsor-modal-burn-description">
                          <Image
                            src="/sponsor_modal_decription_icon.svg"
                            alt=""
                            width={18}
                            height={18}
                            className="normal-icon-size mr-3.5"
                          />
                          <div>
                            <p className="vote-modal-sponsor-lock-decription-title mb-1">{durationPer}x Support Multiplier</p>
                            <p className="vote-modal-sponsor-lock-decription-value">
                              Locked WAN grants access to {durationPer}x the pledged amount towards the funding goal. Funds are locked for {handleTimeThMaxPer(curDuration, true)}.
                            </p>
                          </div>
                        </div>
                        <div className="sponsor-modal-burn-description justify-between">
                          <p className="vote-modal-sponsor-lock-decription-title">Lock for {handleTimeThMaxPer(curDuration)}</p>
                          <Image
                            src="/sponsor_prospective_icon.svg"
                            alt=""
                            width={16}
                            height={16}
                            className="small-icon-size mt-1"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {
                          lockMultiplierArr.map((v, k) => (
                            <div
                              className={`vote-lock-duration-item mb-2 ${voteDurationIndex === k && "vote-lock-duration-active-item"}`}
                              onClick={() => setVoteDurationIndex(k)}
                              key={k}
                            >
                              <p>{v.lockDuration === 0 ? 'Duration' : handleTimeThMaxPer(v.lockDuration)}</p>
                              <div className={`vote-lock-duration-multiple-item ${voteDurationIndex === k && "vote-lock-duration-multiple-active-item"}`}>{v.multiplier}x</div>
                            </div>
                          ))
                        }
                      </div>
                  ) : (
                    <div className="vote-modal-burn-description">
                      <Image
                        src="/vote_modal_burn_decription_icon.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="normal-icon-size mr-3.5"
                      />
                      <div>
                        <p className="vote-modal-burn-decription-title mb-1">{durationPer}x {isProspective ? 'Support' : 'Voting Power'} Multiplier</p>
                        <p className="vote-modal-burn-decription-value">
                          {
                            isProspective ?
                              `Locked WAN grants access to ${durationPer}x the pledged amount towards the funding goal. Funds are locked for ${handleTimeThMaxPer(curDuration, true)}.`
                                : 'Warning: Tokens used for this vote will be permanently destroyed. This action cannot be undone.'
                          }
                        </p>
                      </div>
                    </div>
                  )
                }
                <p className="vote-modal-item-title mb-2">
                  Amount
                </p>
                <div className="vote-modal-amount-con mb-6">
                  <input
                    className="vote-modal-amount-inp"
                    placeholder="0.00"
                    value={voteAmount}
                    onChange={handleVoteAmount}
                  />
                  <div className="vote-modal-amount-per">WAN</div>
                </div>
                <div className="estimated-voting-power flex items-center justify-between">
                  <div className="w-1/3 flex items-center">
                    <Image
                      className="normal-icon-size mr-2"
                      width={18}
                      height={18}
                      alt="estimated voting power icon"
                      src={!isdark ? "/vote_power_icon_light.svg" : "/vote_power_icon_dark.svg"}
                    />
                    <div className="estimated-voting-power-title">Estimated Voting Power:</div>
                  </div>
                  <div className="flex-1">
                    <div className="voting-power-value">{voteWanPower} WAN Value</div>
                    <div className="voting-power-value-discription">{formatValue(voteAmount, 0)} WAN x {durationPer}x Multiplier</div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="vote-modal-cancel-btn" onClick={onClose}>
                  Cancel
                </div>
                <div className="vote-modal-confirm-sponsor-btn" onClick={handleConfirm}>
                  Confirm Vote
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}