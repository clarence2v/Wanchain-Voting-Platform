'use client'
import Image from "next/image";
import "./Home.css";
import { Progress, Tabs, Tab, useDisclosure, Card, CardBody } from "@heroui/react";
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VoteModal from "./VoteModal";
import { useSdk } from "@/app/providers";
import { TESTNET_XP_ADDR } from "@/config/address";
import { BigNumber } from "bignumber.js";
import { formatValue, convertArrayItemsBigIntToNumber, convertBigIntToNumber, handleTime, formatBalance, removeExtraZero, clipString, copyTxt2Clipboard } from "@/utils/utils";
import { decodeProposalDescriptionData } from "@wandevs/governance-contracts-sdk";
import { useRouter } from "next/navigation";
import CategoryTag from "./CategoryTag";
import StateTag from "./StateTag";
import IdTag from "./IdTag";
import { wanDecimal } from "@/config/config";
// import { ProposalInfoType } from "@/types/proposalTypes"

// test
// import { toHex } from "viem";
// import { useAccount } from "wagmi";
// import {
//   waitForTransactionReceipt,
//   sendTransaction,
// } from '@wagmi/core';
// import { walletConfig } from "@/app/wagmi";

const LIMIT_NUM = 8;

const Banner = () => {
  return (
    <div className={`banner px-[120] py-[118] w-full bg-[url(/banner@3x.webp)] bg-contain bg-right-top bg-no-repeat`}>
      <p className="title mb-6">Wanchain Voting Platform</p>
      <p className="discription max-w-[648px]">
        Shape Wanchain's future through community governance and treasury management.
      </p>
    </div>  
  )
}

const VoteInfoItem = (props) => {
  const {
    category,     // Funding	0	 Technical	1
    state,  // Canceled	2	Fundraising	3	None	0	Rejected	6	Succeeded	5	UnderReview	1 VotingInProgress 4
    onOpen,
    voteInfo
  } = props;
  const { theme } = useTheme();
  const isdark = useMemo(() => theme === 'dark', [theme])
  const router = useRouter();

  const yesPercent = useMemo(() => {
    if (voteInfo.totalVotingWanPower === 0) return '0';
    const yes = formatBalance(voteInfo.tally.yes);
    const total = formatBalance(voteInfo.totalVotingWanPower)
    const per = new BigNumber(yes).div(total).times(100).toFormat(2);
    return removeExtraZero(per);
  }, [voteInfo.tally, voteInfo.totalVotingWanPower])
  
  const noPercent = useMemo(() => {
    if (voteInfo.totalVotingWanPower === 0) return '0';
    const no = formatBalance(voteInfo.tally.no);
    const total = formatBalance(voteInfo.totalVotingWanPower)
    const per = new BigNumber(no).div(total).times(100).toFormat(2);
    return removeExtraZero(per);
  }, [voteInfo.tally, voteInfo.totalVotingWanPower])

  const leftTime = useMemo(() => {
    if (!voteInfo) return 'N/A'
    const curTime = new Date().getTime() / 1000
    const deadLine = voteInfo.state === 3 ? voteInfo.fundraisingDeadline : voteInfo.voteDeadline
    if (curTime > deadLine) {
      return 'Ended'
    } else if (deadLine === 0) {
      return 'N/A'
    } else {
      return handleTime(deadLine - curTime)
    }
  }, [voteInfo?.state, voteInfo?.fundraisingDeadline, voteInfo?.voteDeadline])
  return (
    <div className="vote-info-con p-6 rounded-2xl">
      <div className="flex justify-between mb-5">
        <div className="flex">
          <div className="mr-2">
            <CategoryTag category={category}></CategoryTag>
          </div>
          <IdTag id={voteInfo.proposalId}></IdTag>
        </div>
        <StateTag state={state} showPoint={state === 4}></StateTag>
      </div>
      <div className="vote-title mb-3" onClick={() => {
        router.push(`/proposalInfo?proposalId=${voteInfo?.proposalId}`)
      }}>{voteInfo.description.title}</div>
      <div className="flex items-center mb-4">
        <Image className="normal-icon-size mr-2" src={!isdark ? "/pledged_icon_light@3x.webp" : "/pledged_icon_dark@3x.webp"} width={16} height={16} alt="pledged icon" />
        {/* <div className="account-name mr-2">Wanda_Team</div> */}
        <div className="account-address" onClick={() => copyTxt2Clipboard(voteInfo.proposer)}>({clipString(voteInfo.proposer, 4, 4)})</div>
      </div>
      <div className="vote-info-item-con p-4 mb-4">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <Image className="small-icon-size mr-1" src={!isdark ? "/doller_icon_light@3x.webp" : "/doller_icon_dark@3x.webp"} width={14} height={14} alt="doller icon" />
            <div className="vote-info-item-title">Request</div>
          </div>
          <div className="flex items-center">
            <Image className="small-icon-size mr-1" src={!isdark ? "/end_in_icon_light@3x.webp" : "/end_in_icon_dark@3x.webp"} width={14} height={14} alt="end in icon" />
            <div className="vote-info-item-title">{state === 3 ? 'Sponsor' : 'Vote'}&nbsp;Ends In</div>
          </div>
        </div>
        <div className="flex justify-between vote-info-item-value">
          <p>
            {formatValue(voteInfo.requestWanAmount, wanDecimal)} WAN
          </p>
          <p>
            {leftTime}
          </p>
        </div>
      </div>
      {
        state === 3 ? (
          <div className="vote-info-item-con mb-4">
            <div className="p-4">
              <div className="flex items-center mb-2">
                <Image className="small-icon-size mr-1.5" src={!isdark ? "/sponsor_btn_icon_light.webp" : "/sponsor_btn_icon_dark.webp"} width={14} height={14} alt="chart icon" />
                <div className="vote-info-item-title">Current Voted Amount</div>
              </div>
              <div className="flex items-center mb-3">
                <div className="sponsor-amount">{formatValue(voteInfo.totalPledgingWanPower, wanDecimal)}&nbsp;</div>
                <div className="sponsor-amount-per pt-0.5">VOTES</div>
              </div>
              <div className="w-full h-2 mb-2">
                <Progress
                  classNames={{
                    base: "w-full h-full",
                    track: "sponsor-progress-track",
                    indicator: "sponsor-progress-indicator"
                  }}
                  aria-label={`${yesPercent}%`}
                  value={yesPercent}
                />
              </div>
              <div className="flex items-center">
                <Image className="small-icon-size mr-1.5" src="/lock_icon@3x.webp" width={14} height={14} alt="lock icon" />
                <div className="lock-amount-title mr-2">Gap (Lock)</div>
                <div className="lock-amount-value">{formatValue(voteInfo.totalWanAmount - voteInfo.totalBurnedWanAmount, wanDecimal)} WAN</div>
                <div className="segmentation mx-4"></div>
                <Image className="small-icon-size mr-1.5" src="/fire_icon@3x.webp" width={14} height={14} alt="fire icon" />
                <div className="lock-amount-title mr-2">Gap (Burn)</div>
                <div className="lock-amount-value">{formatValue(voteInfo.totalBurnedWanAmount, wanDecimal)} WAN</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="vote-info-item-con mb-4">
            <div className="p-4">
              <div className="flex items-center mb-2">
                <Image className="small-icon-size mr-1.5" src={!isdark ? "/chart_icon_light@3x.webp" : "/chart_icon_dark@3x.webp"} width={14} height={14} alt="chart icon" />
                <div className="vote-info-item-title">Current Voted Amount</div>
              </div>
              <div className="flex items-center mb-3">
                <div className="voted-amount">{formatValue(voteInfo.totalVotingWanPower, wanDecimal)}&nbsp;</div>
                <div className="voted-amount-per pt-0.5">VOTES</div>
              </div>
              <div className="flex items-center">
                <Image className="small-icon-size mr-1.5" src="/lock_icon@3x.webp" width={14} height={14} alt="lock icon" />
                <div className="lock-amount-title mr-2">Locked</div>
                <div className="lock-amount-value">{formatValue(voteInfo.totalWanAmount - voteInfo.totalBurnedWanAmount, wanDecimal)} WAN</div>
                <div className="segmentation mx-4"></div>
                <Image className="small-icon-size mr-1.5" src="/fire_icon@3x.webp" width={14} height={14} alt="fire icon" />
                <div className="lock-amount-title mr-2">Burned</div>
                <div className="lock-amount-value">{formatValue(voteInfo.totalBurnedWanAmount, wanDecimal)} WAN</div>
              </div>
            </div>
            <div className="item-line"></div>
            <div className="p-4">
              <div className="vote-sentiment-title mb-2">Vote Sentiment</div>
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
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Image className="small-icon-size mr-1.5" src="/favor_selected.svg" width={14} height={14} alt="favor icon" />
                  <div className="favor">{yesPercent}%&nbsp;Yes</div>
                </div>
                <div className="flex items-center">
                  <div className="against">{noPercent}%&nbsp;No</div>
                  <Image className="small-icon-size ml-1.5" src="/against_selected.svg" width={14} height={14} alt="against icon" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="vote-sentiment-value">{formatValue(voteInfo.tally.yes, wanDecimal)} VOTES</div>
                <div className="vote-sentiment-value">{formatValue(voteInfo.tally.no, wanDecimal)} VOTES</div>
              </div>
            </div>
          </div>
        )
      }
      {
        ![4, 3].includes(state) ? null : (
          <>
            {
              state === 4 ? (
                <div className="vote-btn" onClick={() => onOpen()}>
                  Vote Now&nbsp;
                  <Image className="large-icon-size" src="/right_arrow.svg" width={20} height={20} alt="arrow icon" />
                </div>
              ) : (
                <div className="sponsor-btn" onClick={() => onOpen()}>
                  Sponsor Now&nbsp;
                  <Image className="large-icon-size" src="/sponsor_btn_icon.svg" width={20} height={20} alt="sponsor icon" />
                </div>
              )
            }
          </>
        )
      }
    </div>
  )
}

export default function Home() {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const { theme } = useTheme();
  const isdark = useMemo(() => theme === 'dark', [theme])
  const sdk = useSdk();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [curVoteInfo, setCurVoteInfo] = useState({});
  const [baseInfo, setBaseInfo] = useState({
    totalProposals: '-',
    activeProposals: '-',
    fundingProposals: '-',
    technicalProposals: '-',
    treasuryBalance: '-',
    allProposalBurnedWanAmount: '-',
    allProposalLockingWanAmount: '-',
    allProposalWanAmount: '-',
    votingWanMultiplierCount: 0,
    proposalWanMultiplierCount: 0,
    prospectiveProposalCount: 0,
    succeededProposalCount: 0,
    failedProposalCount: 0,
  })
  const [allProposalsIndex, setAllProposalsIndex] = useState(0);
  const [allProposalsArr, setAllProposalsArr] = useState([]);
  const [activeProposalsIndex, setActiveProposalsIndex] = useState(0);
  const [activeProposalsArr, setActiveProposalsArr] = useState([]);
  const [prospectiveProposalsIndex, setProspectiveProposalsIndex] = useState(0);
  const [prospectiveProposalsArr, setProspectiveProposalsArr] = useState([]);
  const [passedProposalsIndex, setPassedProposalsIndex] = useState(0);
  const [passedProposalsArr, setPassedProposalsArr] = useState([]);
  const [failedProposalsIndex, setFailedProposalsIndex] = useState(0);
  const [failedProposalsArr, setFailedProposalsArr] = useState([]);

  // test
  // const {address} = useAccount()
  // const approveTs = async () => {
  //   console.log('approveTs', sdk, address)
  //   if (!sdk || !address) return 
  //   var request = await sdk.buildReviewProposalTx(address, '0xe1c09eca10e9cf33be0ece3b1cd1d9dd31044e02ef0d50581f207444a239df22', true, toHex(''));
 
  //   const hash = await sendTransaction(walletConfig, request);

  //   console.log('approveTs raw tx hash', hash);

  //   const receipt = await waitForTransactionReceipt( walletConfig, { hash });
  //   console.log('approveTs raw tx receipt', receipt);
  // }

  const handleModal = (info) => {
    setCurVoteInfo(info);
    onOpen();
  }
  const [selectFilterKey, setSelectFilterKey] = useState('all');

  const xpAddr = useMemo(() => {
    if (true) {
      return TESTNET_XP_ADDR;
    } else {
      return TESTNET_XP_ADDR;
    }
  }, [TESTNET_XP_ADDR]);

  useEffect(() => {
    const getInfo = async () => {
      let baseRes = await sdk.getBaseParameters();
      baseRes = convertBigIntToNumber(baseRes)
      const {
        votingWanMultiplierCount,
        proposalWanMultiplierCount,
        prospectiveProposalCount,
        succeededProposalCount,
        failedProposalCount,
      } = baseRes
      const treasuryAddr = baseRes.wanTreasury;
      const treasuryBalance = await sdk.publicClient.getBalance({
        address: treasuryAddr
      })
      const proposalsRes = await sdk.getProposalCounts();
      var activeProposalCategoryRes = await sdk.getActiveProposalCategoryCounts();
      const foundationsRes = await sdk.getFoundations();
      console.log('baseRes', baseRes, proposalsRes, activeProposalCategoryRes, foundationsRes, treasuryBalance)
      const voteBaseInfo = {
        totalProposals: new BigNumber(proposalsRes.allProposalCount).toString(10),
        activeProposals: new BigNumber(proposalsRes.votingProposalCount).toString(10),
        fundingProposals: new BigNumber(activeProposalCategoryRes.fundingProposalCount).toString(10),
        technicalProposals: new BigNumber(activeProposalCategoryRes.technicalProposalCount).toString(10),
        treasuryBalance,
        allProposalBurnedWanAmount: new BigNumber(baseRes.allProposalBurnedWanAmount).div(Math.pow(10, wanDecimal)).toString(10),
        allProposalLockingWanAmount: new BigNumber(baseRes.allProposalWanAmount).minus(baseRes.allProposalBurnedWanAmount).div(Math.pow(10, wanDecimal)).toString(10),
        allProposalWanAmount: new BigNumber(baseRes.allProposalWanAmount).div(Math.pow(10, wanDecimal)).toString(10),
        votingWanMultiplierCount,
        proposalWanMultiplierCount,
        prospectiveProposalCount,
        succeededProposalCount,
        failedProposalCount
      }
      const allNum = Number(proposalsRes.allProposalCount) - 1;
      setAllProposalsIndex(allNum)
      const activeNum = Number(proposalsRes.votingProposalCount) - 1;
      setActiveProposalsIndex(activeNum)
      const prospectiveNum = prospectiveProposalCount - 1;
      setProspectiveProposalsIndex(prospectiveNum)
      const passedNum = succeededProposalCount - 1;
      setPassedProposalsIndex(passedNum)
      const failedNum = failedProposalCount - 1
      setFailedProposalsIndex(failedNum)
      setBaseInfo(voteBaseInfo)
      await loadPage()
    }
    getInfo();
  }, [sdk])

  const serializeDescriptionAndDedupeById = (dedupeArr, serializeArr) => {
    const copyArr = JSON.parse(JSON.stringify(convertArrayItemsBigIntToNumber(dedupeArr)));
    let arr = JSON.parse(JSON.stringify(convertArrayItemsBigIntToNumber(serializeArr)));
    arr = arr.map(v => {
      const { description } = v;
      const decodeDescription = decodeProposalDescriptionData(description);
      v.description = decodeDescription
      return v
    })
    arr = [].concat(arr, copyArr);
    const map = new Map();
    arr.forEach(item => map.set(item.proposalId, item));
    arr = [...map.values()];
    return arr;
  }

  const fetchAllProposalsInfo = useCallback(async () => {
    if (allProposalsIndex === -1 || baseInfo.totalProposals === '-' || !baseInfo.totalProposals) return;
    const res = await sdk.getRecentReviewedProposals({
      start: allProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(allProposalsArr, res.proposals);
    setAllProposalsArr(arr);
    setAllProposalsIndex(res.nextIndex);
    console.log('all vote info', arr);
  }, [allProposalsIndex, sdk, allProposalsArr, baseInfo.totalProposals])

  const fetchActiveProposalsInfo = useCallback(async () => {
    if (activeProposalsIndex === -1 || Number(baseInfo.activeProposals) === 0) return;
    const res = await sdk.getRecentVotingProposals({
      start: activeProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(activeProposalsArr, res.proposals);
    setActiveProposalsArr(arr);
    setActiveProposalsIndex(res.nextIndex);
    console.log('active vote info', res);
  }, [activeProposalsIndex, sdk, activeProposalsArr, baseInfo.activeProposals])

  const fetchProspectiveProposalsInfo = useCallback(async () => {
    if (prospectiveProposalsIndex === -1 || baseInfo.prospectiveProposalCount === 0) return;
    const res = await sdk.getRecentProspectiveProposals({
      start: prospectiveProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(prospectiveProposalsArr, res.proposals);
    setProspectiveProposalsArr(arr);
    setProspectiveProposalsIndex(res.nextIndex);
    console.log('prospective vote info', res);
  }, [prospectiveProposalsIndex, sdk, prospectiveProposalsArr, baseInfo.prospectiveProposalCoun])

  const fetchPassedProposalsInfo = useCallback(async () => {
    if (passedProposalsIndex === -1 || baseInfo.succeededProposalCount === 0) return;
    const res = await sdk.getRecentSucceededProposals({
      start: passedProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(passedProposalsArr, res.proposals);
    setPassedProposalsArr(arr);
    setPassedProposalsIndex(res.nextIndex);
    console.log('passed vote info', res);
  }, [passedProposalsIndex, sdk, passedProposalsArr, baseInfo.succeededProposalCount])

  const fetchFailedProposalsInfo = useCallback(async () => {
    if (failedProposalsIndex === -1 || baseInfo.failedProposalCount === 0) return;
    const res = await sdk.getRecentRejectedProposals({
      start: failedProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(failedProposalsArr, res.proposals);
    setFailedProposalsArr(arr);
    setFailedProposalsIndex(res.nextIndex);
    console.log('failed vote info', res);
  }, [failedProposalsIndex, sdk, failedProposalsArr, baseInfo.failedProposalCount])

  const loadPage = useCallback(() => {
    try {
      if (selectFilterKey === 'active') {
        fetchActiveProposalsInfo();
      } else if (selectFilterKey === 'prospective') {
        fetchProspectiveProposalsInfo()
      } else if (selectFilterKey === 'passed') {
        fetchPassedProposalsInfo()
      } else if (selectFilterKey === 'failed') {
        fetchFailedProposalsInfo()
      } else {
        // selectFilterKey === 'all'
        fetchAllProposalsInfo();
      }
    } catch (e) {
      console.log('error', e)
    }
  }, [selectFilterKey, fetchAllProposalsInfo, fetchActiveProposalsInfo, fetchProspectiveProposalsInfo, fetchPassedProposalsInfo, fetchFailedProposalsInfo])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      entries => {
        const e = entries[0]
        if (e.isIntersecting) {
          loadPage()
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    )

    observerRef.current.observe(sentinel)

    return () => observerRef.current && observerRef.current.disconnect()
  }, [loadPage])

  const handleSelectFilterKey = (key) => {
    setSelectFilterKey(key)
    if (key === 'active') {
      if (activeProposalsArr.length) return
    } else if (key === 'prospective') {
      if (prospectiveProposalsArr.length) return
    } else if (key === 'passed') {
      if (passedProposalsArr.length) return
    } else if (key === 'failed') {
      if (failedProposalsArr.length) return
    } else {
      // key === 'all'
      if (allProposalsArr.length) return
    }
    loadPage()
  }
  
  const updateItem = async () => {
    if (!sdk) return
    const newOriginalProposalInfo = await sdk.getProposalInfo(proposalId);
    const description = decodeProposalDescriptionData(newOriginalProposalInfo.description)
    let newProposalInfo = convertBigIntToNumber(newOriginalProposalInfo)
    newProposalInfo.description = description
    console.log('newProposalInfo', newProposalInfo, selectFilterKey)

    const updateFn = prev =>
      prev.map(item =>
        item.proposalId === curVoteInfo.proposalId
          ? newProposalInfo
          : item
      )

    switch (selectFilterKey) {
      case 'all':
        setAllProposalsArr(updateFn)
      break;
      case 'active':
        setAllProposalsArr(updateFn)
      break;
      case 'prospective':
        setAllProposalsArr(updateFn)
      break;
      case 'passed':
        setAllProposalsArr(updateFn)
      break;
      case 'failed':
        setAllProposalsArr(updateFn)
      break;
      default:
        setAllProposalsArr(updateFn)
    }
  }

  return (
    <div className="min-h-screen">
      <main className="flex min-h-screen w-full flex-col">
        <Banner></Banner>
        {/* <div
          className="w-20 h-8 flex justify-center items-center rounded-lg bg-black text-white cursor-pointer"
          onClick={approveTs}
        >approve</div> */}
        <div className="px-[120]">
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="introduction-item px-6 py-6 rounded-2xl">
              <div className="introduction-title mb-6">
                <Image src={!isdark ? "/treasury_balance_icon_light@3x.webp" : "/treasury_balance_icon_dark@3x.webp"} width={16} height={16} alt="treasury balance icon" />
                <p>TREASURY BALANCE</p>
              </div>
              <div className="treasury-balance-value mb-7">
                {formatValue(baseInfo.treasuryBalance)}&nbsp;
                {
                  baseInfo.treasuryBalance === '-' ? null : (
                    <span className="treasury-balance-per">WAN</span>
                  )
                }
              </div>
              <div className="treasury-balance-introduction mb-2.5">Funds available for ecosystem growth</div>
            </div>
            <div className="introduction-item px-6 py-6 rounded-2xl">
              <div className="introduction-title mb-6">
                <Image src={!isdark ? "/proposals_icon_light@3x.webp" : "/proposals_icon_dark@3x.webp"} width={16} height={16} alt="proposals icon" />
                <p>PROPOSALS</p>
              </div>
              <div className="treasury-balance-value mb-6">
                {baseInfo.activeProposals}&nbsp;
                <span className="treasury-balance-per">Active</span>&nbsp;
                <span className="proposals-total-value">/&nbsp;{baseInfo.totalProposals}&nbsp;Total</span>
              </div>
              <div className="proposals-tab-con mb-1">
                <div className={`proposals-tab-item ${'funding'}`}>Funding: {baseInfo.fundingProposals}</div>
                <div className={`proposals-tab-item ${'tech'}`}>Tech: {baseInfo.technicalProposals}</div>
              </div>
            </div>
            <div className="introduction-item px-6 py-6 rounded-2xl">
              <div className="introduction-title mb-6">
                <Image src={!isdark ? "/pledged_icon_light@3x.webp" : "/pledged_icon_dark@3x.webp"} width={16} height={16} alt="pledged icon" />
                <p>PLEDGED WAN</p>
              </div>
              <div className="pledged-title mb-3">
                <span className="pledged-title-txt">
                  <Image src="/fire_icon@3x.webp" width={14} height={14} alt="pledged icon" />
                  &nbsp;Burned
                </span>
                <span>{baseInfo.allProposalBurnedWanAmount}&nbsp;WAN</span>
              </div>
              <div className="w-full h-2 mb-4">
                {
                  baseInfo.allProposalWanAmount === '-' ? null : (
                    <Progress
                      classNames={{
                        base: "w-full h-full",
                        track: "burn-progress-track",
                        indicator: "burn-progress-indicator"
                      }}
                      aria-label={`${Math.floor(baseInfo.allProposalBurnedWanAmount/baseInfo.allProposalWanAmount*100)}%`}
                      value={baseInfo.allProposalBurnedWanAmount/baseInfo.allProposalWanAmount*100}
                    />
                  )
                }
              </div>
              <div className="pledged-title mb-3">
                <span className="pledged-title-txt">
                  <Image src="/lock_icon@3x.webp" width={14} height={14} alt="pledged icon" />
                  &nbsp;Locked
                </span>
                <span>{baseInfo.allProposalLockingWanAmount}&nbsp;WAN</span>
              </div>
              <div className="w-full h-2">
                <Progress
                  classNames={{
                    base: "w-full h-full",
                    track: "burn-progress-track",
                    indicator: "lock-progress-indicator"
                  }}
                  aria-label={`${Math.floor(baseInfo.allProposalLockingWanAmount/baseInfo.allProposalWanAmount*100)}%`}
                  value={baseInfo.allProposalLockingWanAmount/baseInfo.allProposalWanAmount*100}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col relative">
            <Tabs
              aria-label="filter"
              selectedKey={selectFilterKey}
              classNames={{
                cursor: "",
                tab: [
                  "filter-tab-item",
                  "data-[selected=true]:bg-customBlue-0",
                ],
                tabList: "filter-tab-con",
                tabContent: [
                  "group-data-[selected=true]:text-white"
                ]
              }}
            >
              <Tab
                key="all"
                onClick={() => handleSelectFilterKey('all')}
                title="All"
              >
                <div className="grid grid-cols-2 gap-6">
                  {
                    allProposalsArr.map(v => (
                      <VoteInfoItem
                        key={v.proposalId}
                        category={v.category}
                        state={v.state}
                        onOpen={() => handleModal(v)}
                        voteInfo={v}
                      />
                    ))
                  }
                  <div className="w-full h-【1px】" ref={sentinelRef}></div>
                </div>
              </Tab>
              <Tab
                key="active"
                onClick={() => handleSelectFilterKey('active')}
                title="Active"
              >
                <div className="grid grid-cols-2 gap-6">
                  {
                    activeProposalsArr.map(v => (
                      <VoteInfoItem
                        key={v.proposalId}
                        category={v.category}
                        state={v.state}
                        onOpen={() => handleModal(v)}
                        voteInfo={v}
                      />
                    ))
                  }
                  <div className="w-full h-【1px】" ref={sentinelRef}></div>
                </div>
              </Tab>
              <Tab
                key="prospective"
                onClick={() => handleSelectFilterKey('prospective')}
                title="Prospective"
              >
                <div className="grid grid-cols-2 gap-6">
                  {
                    prospectiveProposalsArr.map(v => (
                      <VoteInfoItem
                        key={v.proposalId}
                        category={v.category}
                        state={v.state}
                        onOpen={() => handleModal(v)}
                        voteInfo={v}
                      />
                    ))
                  }
                  <div className="w-full h-【1px】" ref={sentinelRef}></div>
                </div>
              </Tab>
              <Tab
                key="passed"
                onClick={() => handleSelectFilterKey('passed')}
                title="Passed"
              >
                <div className="grid grid-cols-2 gap-6">
                  {
                    passedProposalsArr.map(v => (
                      <VoteInfoItem
                        key={v.proposalId}
                        category={v.category}
                        state={v.state}
                        onOpen={() => handleModal(v)}
                        voteInfo={v}
                      />
                    ))
                  }
                  <div className="w-full h-【1px】" ref={sentinelRef}></div>
                </div>
              </Tab>
              <Tab
                key="failed"
                onClick={() => handleSelectFilterKey('failed')}
                title="Failed"
              >
                <div className="grid grid-cols-2 gap-6">
                  {
                    failedProposalsArr.map(v => (
                      <VoteInfoItem
                        key={v.proposalId}
                        category={v.category}
                        state={v.state}
                        onOpen={() => handleModal(v)}
                        voteInfo={v}
                      />
                    ))
                  }
                  <div className="w-full h-【1px】" ref={sentinelRef}></div>
                </div>
              </Tab>
            </Tabs>
            <div className="absolute top-0 right-0">
              <div>123123
                <input />
              </div>
              <div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <VoteModal
        onClose={onClose}
        isOpen={isOpen}
        proposalInfo={curVoteInfo}
        votingWanMultiplierCount={baseInfo?.votingWanMultiplierCount}
        proposalWanMultiplierCount={baseInfo?.proposalWanMultiplierCount}
        handleModal={updateItem}
      />
    </div>
  );
}
