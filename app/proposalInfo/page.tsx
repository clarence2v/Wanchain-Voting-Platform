'use client'
import "./page.css";
import Image from "next/image";
import { useTheme } from 'next-themes';
import VoteModal from "@/components/VoteModal";
import Link from 'next/link';
import { useDisclosure, Progress } from "@heroui/react";
import { useMemo } from "react";

export default function Proposals() {
  const { theme } = useTheme();
  const isdark = useMemo(() => {
    return theme === "dark"
  }, [theme])
  const {isOpen, onClose, onOpen} = useDisclosure();
  const voteValue = 66.7
  // useSdk().getProposalInfo
  return (
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
          <div className="proposal-info-title">Wanchain Q1 Cross-chain Marketing Campaign</div>
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
                <p className="proposal-info-user-name">Wanda_Team</p>
                <p className="proposal-info-user-account">0x7a...A1B2</p>
              </div>
            </div>
          </div>
          <p className="proposal-info-decription-title">Description</p>
          <p>This proposal aims to launch a comprehensive marketing strategy for Q1 2024. The primary focus will be on increasing awareness of Wanchain's Layer 2 integration capabilities and cross-chain bridge infrastructure.</p>
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
              3d 5h left
            </p>
          </div>
          <div className="flex justify-between mb-2">
            <p className="proposal-info-total-votes-title">Total Votes</p>
            <p className="proposal-info-total-votes-value">255,000 WAN</p>
          </div>
          <div className="w-full h-2 mb-2">
            <Progress
              classNames={{
                base: "w-full h-full",
                track: "vote-progress-track",
                indicator: "vote-progress-indicator"
              }}
              aria-label={`${voteValue}%`}
              value={voteValue}
            />
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Image className="small-icon-size mr-1.5" src="/favor_selected.svg" width={14} height={14} alt="favor icon" />
              <div className="favor">66.7%&nbsp;Yes</div>
            </div>
            <div className="flex items-center">
              <div className="against">17.6%&nbsp;No</div>
              <Image className="small-icon-size ml-1.5" src="/against_selected.svg" width={14} height={14} alt="against icon" />
            </div>
          </div>
          <div className="proposal-info-vote-btn" onClick={onOpen}>Vote Now</div>
        </div>
      </div>
      <VoteModal
        onClose={onClose}
        isOpen={isOpen}
      />
    </div>
  )
}