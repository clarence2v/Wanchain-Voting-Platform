'use client'
import "./page.css";
import Image from "next/image";
import { useTheme } from 'next-themes';
import ProposalItem from "@/components/ProposalItem";
import Link from 'next/link';
import { useEffect } from "react";
import { useSdk } from "../providers";
import { useAccount } from "wagmi";

export default function Proposals() {
  const { theme } = useTheme();
    const sdk = useSdk();
    const { address } = useAccount();
  const arr = [
    {
      id: '23',
      type: 'Technical',
      status: 'Active',
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
      type: 'Funding',
      status: 'Passed',
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
      type: 'Technical',
      status: 'Failed',
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
      type: 'Technical',
      status: 'Prospective',
      choice: 'yes',
      stake: '500',
      burn: '0',
      reward: 'pending',
      lockTime: '-1',
      endTime: '-1',
      title: 'Community Hackathon Grant Program'
    },
  ];
  useEffect(() => {
    const getDataFn = async () => {
      if (!sdk || !address) {
        console.error('sdk init or not connect', sdk, address)
        return;
      }
      const count = await sdk.getAccountProposalCount(address)
      if (Number(count) === 0) return;
      console.log('count proposal', count)
      const data = await sdk.getProposerProposals(address, {
        start: 0,
        end: 0
      })
      console.log('data', data)
    }
    getDataFn();
  }, [sdk, address])
  return (
    <div className="min-h-screen px-[120]">
      <div className="pt-4 w-fit">
        <Link className="back-title flex items-center" href="/">
          <Image className="smal-icon-size mr-3" width={16} height={16} src={theme === "light" ? "/arrow_back_icon_light.svg" : "/arrow_back_icon_dark.svg"} alt="back home icon" />
          &nbsp;Back to Dashboard
        </Link>
      </div>
      <div className="proposal-title flex items-center py-8">
        <Image className="large-icon-size mr-3" width={26} height={26} src={theme === "light" ? "/proposal_icon_light@3x.webp" : "/proposal_icon_dark@3x.webp"} alt="proposal icon" />
        My Proposals
      </div>
      <div>
        {
          arr.map((v, k) => (
            <ProposalItem
              key={k}
              id={v.id}
              type={v.type}
              status={v.status}
              choice={v.choice}
              stake={v.stake}
              burn={v.burn}
              reward={v.reward}
              lockTime={v.lockTime}
              endTime={v.endTime}
              title={v.title}
            />
          ))
        }
      </div>
    </div>
  )
}