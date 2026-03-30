'use client'
import "./page.css";
import Image from "next/image";
import { useTheme } from 'next-themes';
import VoteModal from "@/components/VoteModal";
import Link from 'next/link';
import { useDisclosure, Progress } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useSdk } from "../providers";
import { HexType, ProposalInfoType } from "@/types/proposalTypes";
import { convertBigIntToNumber, clipString, copyTxt2Clipboard, handleTime, formatValue, formatBalance, removeExtraZero } from "@/utils/utils";
import { decodeProposalDescriptionData } from "@wandevs/governance-contracts-sdk";
import { wanDecimal } from "@/config/config";
import BigNumber from "bignumber.js";

export default function Proposals() {
  const { theme } = useTheme();
  const isdark = useMemo(() => {
    return theme === "dark"
  }, [theme])
  const sdk = useSdk();
  const {isOpen, onClose, onOpen} = useDisclosure(); 
  const [proposalId, setProposalId] = useState<HexType>('0x')

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const queryObj = Object.fromEntries(params.entries());
    const id = queryObj.proposalId as HexType
    setProposalId(id)
  }, [])

  const [proposalInfo, setProposalInfo] = useState<ProposalInfoType | null>()
  const [votingWanMultiplierNum, setVotingWanMultiplierNum] = useState(0)
  const [proposalWanMultiplierNum, setProposalWanMultiplierNum] = useState(0)
  useEffect(() => {
    const getInfo = async () => {
      if (!sdk || !proposalId || proposalId === '0x') return
      const info = await sdk.getProposalInfo(proposalId);
      const description = decodeProposalDescriptionData(info.description)
      let obj = convertBigIntToNumber(info)
      obj.description = description
      setProposalInfo(obj)
      let baseRes = await sdk.getBaseParameters();
      setVotingWanMultiplierNum(Number(baseRes.votingWanMultiplierCount))
      setProposalWanMultiplierNum(Number(baseRes.proposalWanMultiplierCount))
    }
    getInfo()
  }, [sdk, proposalId])
  
  const yesPercent = useMemo(() => {
    if (!proposalInfo || proposalInfo.totalVotingWanPower === 0) return 0
    const yes = formatBalance(proposalInfo.tally.yes);
    const total = formatBalance(proposalInfo.totalVotingWanPower)
    const per = new BigNumber(yes).div(total).times(100).toFormat(2);
    return Number(per);
  }, [proposalInfo?.tally, proposalInfo?.totalVotingWanPower])
  
  const noPercent = useMemo(() => {
    if (!proposalInfo || proposalInfo.totalVotingWanPower === 0) return '0';
    const no = formatBalance(proposalInfo.tally.no);
    const total = formatBalance(proposalInfo.totalVotingWanPower)
    const per = new BigNumber(no).div(total).times(100).toFormat(2);
    return Number(per);
  }, [proposalInfo?.tally, proposalInfo?.totalVotingWanPower])

  const leftTime = useMemo(() => {
    if (!proposalInfo) return 'N/A'
    const curTime = new Date().getTime() / 1000
    const deadLine = proposalInfo.state === 3 ? proposalInfo.fundraisingDeadline : proposalInfo.voteDeadline
    if (curTime > deadLine) {
      return 'Ended'
    } else if (deadLine === 0) {
      return 'N/A'
    } else {
      return handleTime(deadLine - curTime) + ' left'
    }
  }, [proposalInfo?.state, proposalInfo?.fundraisingDeadline, proposalInfo?.voteDeadline])
  return (
    <>
      {
        proposalInfo ? (
          <div className="min-h-screen px-[120]">
            <div className="pt-4 w-fit">
              <Link className="back-title flex items-center" href="/">
                <Image className="smal-icon-size mr-3" width={16} height={16} src={isdark ? "/arrow_back_icon_dark.svg" : "/arrow_back_icon_light.svg"} alt="back home icon" />
                &nbsp;Back to Home
              </Link>
            </div>
            <div className="flex pt-8">
              <div className="proposal-info-con proposal-info-item-con">
                <div className="flex"></div>
                <div className="proposal-info-title">{proposalInfo.description?.title}</div>
                <div className="proposal-info-user-info-con mb-4">
                  <div className="flex items-center">
                    <div className="proposal-info-user-icon-con">
                      <Image
                        className="large-icon-size"
                        src={isdark ? "/pledged_icon_dark@3x.webp" : "/pledged_icon_light@3x.webp"}
                        width={20}
                        height={20}
                        alt="pledged icon"
                      />
                    </div>
                    <div>
                      {/* <p className="proposal-info-user-name">Wanda_Team</p> */}
                      <p className="proposal-info-user-account" onClick={() => copyTxt2Clipboard(String(proposalInfo.proposer))}>{clipString(String(proposalInfo.proposer), 4, 4)}</p>
                    </div>
                  </div>
                </div>
                <p className="proposal-info-decription-title">Description</p>
                <p>{proposalInfo.description?.description}</p>
              </div>
              <div className="proposal-info-con proposal-info-status-con">
                <div className="flex justify-between items-center mb-6">
                  <p className="proposal-info-status-title">Current Status</p>
                  <p className="proposal-info-status-value">
                    <Image
                      className="small-icon-size mr-1"
                      src={isdark ? "/end_in_icon_dark@3x.webp" : "/end_in_icon_light@3x.webp"}
                      width={14}
                      height={14}
                      alt="end in icon"
                    />
                    {leftTime}
                  </p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="proposal-info-total-votes-title">Total Votes</p>
                  <p className="proposal-info-total-votes-value">{formatValue(proposalInfo.totalPledgingWanPower, wanDecimal)} Votes</p>
                </div>
                <div className="w-full h-2 mb-2">
                  <Progress
                    classNames={{
                      base: "w-full h-full",
                      track: `${Number(noPercent) ? 'vote-progress-track' : 'vote-progress-no-burn-track'}`,
                      indicator: "vote-progress-indicator"
                    }}
                    aria-label={`${yesPercent}%`}
                    value={yesPercent}
                  />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <Image className="small-icon-size mr-1.5" src="/favor_selected.svg" width={14} height={14} alt="favor icon" />
                    <div className="favor">{yesPercent}%&nbsp;Yes</div>
                  </div>
                  <div className="flex items-center">
                    <div className="against">{noPercent}%&nbsp;No</div>
                    <Image className="small-icon-size ml-1.5" src="/against_selected.svg" width={14} height={14} alt="against icon" />
                  </div>
                </div>
                {
                  ![4, 3].includes(proposalInfo.state) ? null : (
                    <>
                      {
                        proposalInfo.state === 4 ? (
                          <div className="proposal-info-vote-btn" onClick={() => onOpen()}>
                            Vote Now
                          </div>
                        ) : (
                          <div className="sponsor-btn" onClick={() => onOpen()}>
                            Sponsor Now
                          </div>
                        )
                      }
                    </>
                  )
                }
              </div>
            </div>
            <VoteModal
              onClose={onClose}
              isOpen={isOpen}
              proposalInfo={proposalInfo}
              votingWanMultiplierCount={votingWanMultiplierNum}
              proposalWanMultiplierCount={proposalWanMultiplierNum}
            />
          </div>
        ) : null
      }
    </>
  )
}