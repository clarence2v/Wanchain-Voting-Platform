'use client'
import "./page.css";
import Image from "next/image";
import { useTheme } from 'next-themes';
import ProposalItem from "@/components/ProposalItem";
import Link from 'next/link';
import { useEffect, useMemo, useState } from "react";
import { useSdk } from "../providers";
import { useAccount } from "wagmi";
import { ProposalInfoType, OriginalMyVoteInfoType, MyVoteInfoType, ProposalInfoListType, OriginalSerializeProposalInfoListType, OriginalSerializeProposalInfoType, DescriptionType } from "@/types/proposalTypes";
import { convertArrayItemsBigIntToNumber } from "@/utils/utils";
import { decodeProposalDescriptionData, ProposalInfo } from "@wandevs/governance-contracts-sdk";

export default function Votes() {
  const { theme } = useTheme();
  const isdark = useMemo(() => theme === 'dark', [theme])
  const sdk = useSdk();
  const { address } = useAccount();
  const [voteArr, setVoteArr] = useState<MyVoteInfoType[]>([])
  const arr = [
    {
      id: '23',
      state: 'Active',
      choice: 'yes',
      stake: '500',
      burn: '0',
      reward: 'pending',
      lockTime: '-1',
      endTime: '526234',
      title: 'Adjust Gas Fees Parameters'
    },
    {
      id: '19',
      state: 'Passed',
      choice: 'no',
      stake: '100',
      burn: '50',
      reward: '12',
      lockTime: '6',
      endTime: '-1',
      title: 'Grant for Community Hackathon'
    },
    {
      id: '15',
      state: 'Failed',
      choice: 'yes',
      stake: '2000',
      burn: '0',
      reward: '0',
      lockTime: '12',
      endTime: '356234',
      title: 'Strategic Partnership Initiative'
    },
    {
      id: '28',
      state: 'Prospective',
      choice: 'yes',
      stake: '500',
      burn: '0',
      reward: 'pending',
      lockTime: '-1',
      endTime: '-1',
      title: 'Community Hackathon Grant Program'
    },
  ];
    
  const serializeDescriptionAndDedupeById = (serializeArr: OriginalMyVoteInfoType[]): MyVoteInfoType[] => {
    let arr: OriginalMyVoteInfoType[] = JSON.parse(JSON.stringify(convertArrayItemsBigIntToNumber(serializeArr)));
    const newArr: ProposalInfoListType = [];
    arr.forEach((v: OriginalMyVoteInfoType) => {
      const { description } = v.proposalInfo;
      const decodeDescription = decodeProposalDescriptionData(description) as DescriptionType;
      let obj = JSON.parse(JSON.stringify(v));
      obj.proposalInfo.description = decodeDescription
      console.log('obj', obj)
      newArr.push(obj)
    })
    const map = new Map();
    newArr.forEach(item => map.set(item.proposalId, item));
    const resultArr = [...map.values()];
    return resultArr;
  }

  useEffect(() => {
    const getDataFn = async () => {
      if (!sdk || !address) {
        console.error('sdk init or not connect', sdk, address)
        return;
      }
      const res = await sdk.getAccountProposalCount(address)
      console.log('res', res)
      const count = Number(res.voterProposalCount)
      if (count === 0) return;
      console.log('count proposal', count, Math.max(count - 1, 0))
      const arr = await sdk.getVoterProposals(address, {
        start: 0,
        end: Math.max(count - 1, 0)
      })
      console.log('arr', arr)
      const numArr = serializeDescriptionAndDedupeById(arr)
      console.log('numArr', numArr)
      setVoteArr(numArr)
    }
    getDataFn();
  }, [sdk, address])
  return (
    <div className="min-h-screen px-[120]">
      <div className="pt-4 w-fit">
        <Link className="back-title flex items-center" href="/">
          <Image className="smal-icon-size mr-3" width={16} height={16} src={!isdark ? "/arrow_back_icon_light.svg" : "/arrow_back_icon_dark.svg"} alt="back home icon" />
          &nbsp;Back to Dashboard
        </Link>
      </div>
      <div className="proposal-title flex items-center py-8">
        <Image className="large-icon-size mr-3" width={26} height={26} src={!isdark ? "/proposal_icon_light@3x.webp" : "/proposal_icon_dark@3x.webp"} alt="proposal icon" />
        My Voting History
      </div>
      <div>
        {
          voteArr.map((v, k) => (
            <ProposalItem
              key={k}
              id={v.proposalInfo.proposalId}
              choice={v.voterInfo.voteType}
              type={v.proposalInfo.category}
              state={v.proposalInfo.state}
              stake={v.proposalInfo.proposerFundInfo.pledgeType === 2 ? v.proposalInfo.proposerFundInfo.wanAmount : 0}
              burn={v.proposalInfo.proposerFundInfo.pledgeType === 1 ? v.proposalInfo.proposerFundInfo.wanAmount : 0}
              reward={v.proposalInfo.proposerFundInfo.claimWanAmount}
              lockTime={v.proposalInfo.proposerFundInfo.lockDuration}
              endTime={v.proposalInfo.state === 4 ? v.proposalInfo.fundraisingDeadline : v.proposalInfo.voteDeadline}
              title={v.proposalInfo.description.title}
              status='vote'
            />
          ))
        }
      </div>
    </div>
  )
}