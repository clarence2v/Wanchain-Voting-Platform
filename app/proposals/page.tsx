'use client'
import "./page.css";
import Image from "next/image";
import { useTheme } from 'next-themes';
import ProposalItem from "@/components/ProposalItem";
import Link from 'next/link';
import { useEffect, useMemo, useState } from "react";
import { useSdk } from "../providers";
import { useAccount } from "wagmi";
import { ProposalInfoType, OriginalProposalInfoListType, ProposalInfoListType, OriginalSerializeProposalInfoListType, OriginalSerializeProposalInfoType, DescriptionType } from "@/types/proposalTypes";
import { convertArrayItemsBigIntToNumber } from "@/utils/utils";
import { decodeProposalDescriptionData, ProposalInfo } from "@wandevs/governance-contracts-sdk";
import BigNumber from "bignumber.js";
import { wanDecimal } from "@/config/config";

export default function Proposals() {
  const { theme } = useTheme();
  const isdark = useMemo(() => theme === 'dark', [theme])
  const sdk = useSdk();
  const { address } = useAccount();
  const [proposalArr, setProposalArr] = useState<ProposalInfoListType>([])
  
  const serializeDescriptionAndDedupeById = (serializeArr: OriginalProposalInfoListType): ProposalInfoListType => {
    let arr: OriginalSerializeProposalInfoListType = JSON.parse(JSON.stringify(convertArrayItemsBigIntToNumber(serializeArr)));
    const newArr: ProposalInfoListType = [];
    arr.forEach((v: OriginalSerializeProposalInfoType) => {
      const { description } = v;
      const decodeDescription = decodeProposalDescriptionData(description) as DescriptionType;
      let obj = JSON.parse(JSON.stringify(v));
      obj.description = decodeDescription
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
        return;
      }
      const res = await sdk.getAccountProposalCount(address)
      const count = Number(res.proposerProposalCount)
      if (count === 0) return;
      const arr = await sdk.getProposerProposals(address, {
        start: 0,
        end: Math.max(count - 1, 0)
      })
      const numArr = serializeDescriptionAndDedupeById(arr)
      console.log('proposal data', numArr)
      setProposalArr(numArr)
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
        My Proposals
      </div>
      <div>
        {
          proposalArr.map((v, k) => (
            <ProposalItem
              key={k}
              id={v.proposalId}
              type={v.category}
              state={v.state}
              stake={v.proposerFundInfo.pledgeType === 2 ? v.proposerFundInfo.wanAmount : 0}
              burn={v.proposerFundInfo.pledgeType === 1 ? v.proposerFundInfo.wanAmount : 0}
              reward={v.proposerFundInfo.claimWanAmount}
              lockTime={v.proposerFundInfo.lockDuration}
              endTime={v.state === 4 ? v.fundraisingDeadline : v.voteDeadline}
              title={v.description.title}
              status='proposal'
            />
          ))
        }
      </div>
    </div>
  )
}