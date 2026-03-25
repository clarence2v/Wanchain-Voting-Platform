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
import { formatValue, convertArrayItemsBigIntToNumber, handleTime, formatBalance, removeExtraZero, clipString } from "@/utils/utils";
import { decodeProposalDescriptionData } from "@wandevs/governance-contracts-sdk";
import { useRouter } from "next/navigation";

const LIMIT_NUM = 8;
const wanDecimal = 18;

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
    type = 1,     // Funding	0	 Technical	1
    status = 4,  // Canceled	2	Fundraising	3	None	0	Rejected	6	Succeeded	5	UnderReview	1 VotingInProgress 4
    onOpen,
    time,
    requestWanAmount,
    totalBurnedWanAmount,
    totalLockingWanAmount,
    tally,
    totalVotingWanPower,
    description,
    proposer
  } = props;

  const { theme } = useTheme();
  const router = useRouter();

  const typeName = useMemo(() => {
    if (type === 1) {
      return 'Technical'
    } else {
      return 'Funding'
    }
  }, [type])

  const typeClassName = useMemo(() => {
    if (typeName === 'Funding') {
      return 'funding'
    } else {
      return 'technical'
    }
  }, [typeName])

  const yesPercent = useMemo(() => {
    const yes = formatBalance(tally.yes);
    const total = formatBalance(totalVotingWanPower)
    const per = new BigNumber(yes).div(total).times(100).toFormat(2);
    return removeExtraZero(per);
  }, [tally, totalVotingWanPower])
  
  const noPercent = useMemo(() => {
    const per = new BigNumber(100).minus(yesPercent).toFormat(2);
    return removeExtraZero(per);
  }, [yesPercent])
  return (
    <div className="vote-info-con p-6 rounded-2xl">
      <div className="flex justify-between mb-5">
        <div className="flex">
          <div className={`vote-type vote-type-${typeClassName} mr-2`}>{typeName}</div>
          <div className="vote-id">#024</div>
        </div>
        <div className={`vote-status vote-status-${status}`}>
          <div className={`vote-status-point-${status} mr-1.5`}></div>
          Active
        </div>
      </div>
      <div className="vote-title mb-3" onClick={() => {
        router.push('/proposalInfo')
      }}>{description.title}</div>
      <div className="flex items-center mb-4">
        <Image className="normal-icon-size mr-2" src={theme === "light" ? "/pledged_icon_light@3x.webp" : "/pledged_icon_dark@3x.webp"} width={16} height={16} alt="pledged icon" />
        {/* <div className="account-name mr-2">Wanda_Team</div> */}
        <div className="account-address">({clipString(proposer, 4, 4)})</div>
      </div>
      <div className="vote-info-item-con p-4 mb-4">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <Image className="small-icon-size mr-1" src={theme === "light" ? "/doller_icon_light@3x.webp" : "/doller_icon_dark@3x.webp"} width={14} height={14} alt="doller icon" />
            <div className="vote-info-item-title">Request</div>
          </div>
          <div className="flex items-center">
            <Image className="small-icon-size mr-1" src={theme === "light" ? "/end_in_icon_light@3x.webp" : "/end_in_icon_dark@3x.webp"} width={14} height={14} alt="end in icon" />
            <div className="vote-info-item-title">Vote Ends In</div>
          </div>
        </div>
        <div className="flex justify-between vote-info-item-value">
          <p>
            {formatValue(requestWanAmount, wanDecimal)} WAN
          </p>
          <p>
            {handleTime(time)}
          </p>
        </div>
      </div>
      <div className="vote-info-item-con mb-4">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <Image className="small-icon-size mr-1.5" src={theme === "light" ? "/chart_icon_light@3x.webp" : "/chart_icon_dark@3x.webp"} width={14} height={14} alt="chart icon" />
            <div className="vote-info-item-title">Current Voted Amount</div>
          </div>
          <div className="flex items-center mb-3">
            <div className="voted-amount">{formatValue(totalVotingWanPower, wanDecimal)}&nbsp;</div>
            <div className="voted-amount-per pt-0.5">VOTES</div>
          </div>
          <div className="flex items-center">
            <Image className="small-icon-size mr-1.5" src="/lock_icon@3x.webp" width={14} height={14} alt="lock icon" />
            <div className="lock-amount-title mr-2">Locked</div>
            <div className="lock-amount-value">{formatValue(totalLockingWanAmount, wanDecimal)} WAN</div>
            <div className="segmentation mx-4"></div>
            <Image className="small-icon-size mr-1.5" src="/fire_icon@3x.webp" width={14} height={14} alt="fire icon" />
            <div className="lock-amount-title mr-2">Burned</div>
            <div className="lock-amount-value">{formatValue(totalBurnedWanAmount, wanDecimal)} WAN</div>
          </div>
        </div>
        <div className="item-line"></div>
        <div className="p-4">
          <div className="vote-sentiment-title mb-2">Vote Sentiment</div>
          <div className="w-full h-2 mb-2">
            <Progress
              classNames={{
                base: "w-full h-full",
                track: "vote-progress-track",
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
            <div className="vote-sentiment-value">{formatValue(tally.yes, wanDecimal)} VOTES</div>
            <div className="vote-sentiment-value">{formatValue(tally.no, wanDecimal)} VOTES</div>
          </div>
        </div>
      </div>
      <div className="vote_btn" onClick={() => onOpen({})}>
        Vote Now&nbsp;
        <Image className="large-icon-size" src="/right_arrow.svg" width={20} height={20} alt="arrow icon" />
      </div>
    </div>
  )
}

export default function Home() {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const { theme } = useTheme();
  const sdk = useSdk();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [curVoteInfo, setCurVoteInfo] = useState();
  const [baseInfo, setBaseInfo] = useState({
    totalProposals: '-',
    activeProposals: '-',
    fundingProposals: '-',
    technicalProposals: '-',
    treasuryBalance: '-',
    allProposalBurnedWanAmount: '-',
    allProposalLockingWanAmount: '-',
    allProposalWanAmount: '-'
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
      const baseRes = await sdk.getBaseParameters();
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
      }
      console.log('voteBaseInfo', voteBaseInfo, voteBaseInfo.allProposalBurnedWanAmount/voteBaseInfo.allProposalWanAmount*100)
      setBaseInfo(voteBaseInfo)
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
    arr.forEach(item => map.set(item.id, item));
    arr = [...map.values()];
    return arr;
  }

  const fetchAllProposalsInfo = useCallback(async () => {
    if (allProposalsIndex === -1) return;
    const res = await sdk.getRecentReviewedProposals({
      start: allProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(allProposalsArr, res.proposals);
    setAllProposalsArr(arr);
    setAllProposalsIndex(res.nextIndex);
    console.log('all vote info', arr);
  }, [allProposalsIndex, sdk, allProposalsArr])

  const fetchActiveProposalsInfo = useCallback(async () => {
    if (activeProposalsIndex === -1) return;
    const res = await sdk.getRecentVotingProposals({
      start: activeProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(activeProposalsArr, res.proposals);
    setActiveProposalsArr(arr);
    setActiveProposalsIndex(res.nextIndex);
    console.log('active vote info', res);
  }, [activeProposalsIndex, sdk, activeProposalsArr])

  const fetchProspectiveProposalsInfo = useCallback(async () => {
    if (prospectiveProposalsIndex === -1) return;
    const res = await sdk.getRecentProspectiveProposals({
      start: prospectiveProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(prospectiveProposalsArr, res.proposals);
    setProspectiveProposalsArr(arr);
    setProspectiveProposalsIndex(res.nextIndex);
    console.log('prospective vote info', res);
  }, [prospectiveProposalsIndex, sdk, prospectiveProposalsArr])

  const fetchPassedProposalsInfo = useCallback(async () => {
    if (passedProposalsIndex === -1) return;
    const res = await sdk.getRecentSucceededProposals({
      start: passedProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(passedProposalsArr, res.proposals);
    setPassedProposalsArr(arr);
    setPassedProposalsIndex(res.nextIndex);
    console.log('passed vote info', res);
  }, [passedProposalsIndex, sdk, passedProposalsArr])

  const fetchFailedProposalsInfo = useCallback(async () => {
    if (failedProposalsIndex === -1) return;
    const res = await sdk.getRecentRejectedProposals({
      start: failedProposalsIndex,
      limit: LIMIT_NUM
    })
    const arr = serializeDescriptionAndDedupeById(failedProposalsArr, res.proposals);
    setFailedProposalsArr(arr);
    setFailedProposalsIndex(res.nextIndex);
    console.log('failed vote info', res);
  }, [failedProposalsIndex, sdk, failedProposalsArr])

  const loadPage = useCallback(() => {
    console.log('loadPage', selectFilterKey, allProposalsIndex, activeProposalsIndex, prospectiveProposalsIndex, passedProposalsIndex, failedProposalsIndex)
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
    loadPage()
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    // 断开旧 observer
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      entries => {
        const e = entries[0]
        if (e.isIntersecting) {
          loadPage()
        }
      },
      {
        root: null, // 监听窗口（若监听容器滚动，传入容器元素）
        rootMargin: '200px', // 预加载阈值（提前触发）
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

  return (
    <div className="min-h-screen">
      <main className="flex min-h-screen w-full flex-col">
        <Banner></Banner>
        <div className="px-[120]">
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="introduction-item px-6 py-6 rounded-2xl">
              <div className="introduction-title mb-6">
                <Image src={theme === "light" ? "/treasury_balance_icon_light@3x.webp" : "/treasury_balance_icon_dark@3x.webp"} width={16} height={16} alt="treasury balance icon" />
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
                <Image src={theme === "light" ? "/proposals_icon_light@3x.webp" : "/proposals_icon_dark@3x.webp"} width={16} height={16} alt="proposals icon" />
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
                <Image src={theme === "light" ? "/pledged_icon_light@3x.webp" : "/pledged_icon_dark@3x.webp"} width={16} height={16} alt="pledged icon" />
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
                    allProposalsArr.map((v, k) => (
                      <VoteInfoItem
                        key={k}
                        type={v.category}
                        onOpen={(info) => handleModal(info)}
                        time={Number(v.voteDeadline)}
                        requestWanAmount={v.requestWanAmount}
                        totalBurnedWanAmount={v.totalBurnedWanAmount}
                        totalLockingWanAmount={v.totalWanAmount - v.totalBurnedWanAmount}
                        totalVotingWanPower={v.totalVotingWanPower}
                        tally={v.tally}
                        description={v.description}
                        proposer={v.proposer}
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
                    activeProposalsArr.map((v, k) => (
                      <VoteInfoItem
                        key={k}
                        type={v.category}
                        onOpen={(info) => handleModal(info)}
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
                    prospectiveProposalsArr.map((v, k) => (
                      <VoteInfoItem
                        key={k}
                        type={v.category}
                        onOpen={(info) => handleModal(info)}
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
                    passedProposalsArr.map((v, k) => (
                      <VoteInfoItem
                        key={k}
                        type={v.category}
                        onOpen={(info) => handleModal(info)}
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
                    failedProposalsArr.map((v, k) => (
                      <VoteInfoItem
                        key={k}
                        type={v.category}
                        onOpen={(info) => handleModal(info)}
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
      />
    </div>
  );
}
