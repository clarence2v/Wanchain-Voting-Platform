'use client'
import "./ProposalItem.css";
import Image from "next/image";
import { handleTime, formatValue, handleTimeThMaxPer } from "@/utils/utils";
import CategoryTag from "./CategoryTag";
import { ProposalCategory, ProposalState, VoteType } from "@wandevs/governance-contracts-sdk";
import StateTag from "./StateTag";
import IdTag from "./IdTag";
import { HexType, ProposalItemStatusType } from "@/types/proposalTypes";
import { wanDecimal } from "@/config/config";
import { useRouter } from "next/navigation";

const ProposalItem = ({
  id,
  type,
  state,
  choice,
  stake,
  burn,
  reward,
  lockTime,
  endTime,
  title,
  status,
}: {
  id: HexType
  type: ProposalCategory
  state: ProposalState
  choice?: VoteType
  stake: number
  burn: number
  reward: number
  lockTime: number
  endTime: number
  title: string,
  status: ProposalItemStatusType
}) => {
  const router = useRouter();
  const choiceTxt = (value: VoteType | undefined) => {
    if (value === 1) {
      return (
        <>
          <Image className="icon-size" src={'/favor_selected.svg'} width={16} height={16} alt={`favor icon`} />
          <span className="proposals-info-choice-favor">Yes</span>
        </>
      )
    } else {
      return (
        <>
          <Image className="icon-size" src={'/against_selected.svg'} width={16} height={16} alt={`against icon`} />
          <span className="proposals-info-choice-against">No</span>
        </>
      )
    }
  }
  const burnTxt = (value: string) => {
    if (Number(value) > 0) {
      return (
        <span className="proposals-info-per-value">{value}&nbsp;WAN</span>
      )
    } else {
      return (
        <>
          {value}&nbsp;<span className="proposals-info-per">WAN</span>
        </>
      )
    }
  }
  const rewardTxt = (value: string) => {
    if (value === 'Pending') {
      return (
        <span className="proposals-info-reward-pending">{value}</span>
      )
    } else if (Number(value) > 0) {
      return (
        <span className="proposals-info-reward-pending">{value}&nbsp;WAN</span>
      )
    } else {
      return (
        <>
          {value}&nbsp;<span className="proposals-info-per">WAN</span>
        </>
      )
    }
  }
  const lockTimeTxt = lockTime === 0 ? 'Vote Duration' : handleTimeThMaxPer(lockTime);
  const endTimeTxt = endTime === 0 ? 'N/A' : endTime < new Date().getTime() / 1000 ? 'Ended' : handleTime(endTime);
  return (
    <div className="proposals-item-con p-6 mb-4">
      <div className="flex justify-between">
        <div className="flex">
          <div className="mr-2.5">
            <IdTag id={id}></IdTag>
          </div>
          <div className="mr-2.5">
            <CategoryTag category={type}></CategoryTag>
          </div>
          <StateTag state={state}></StateTag>
        </div>
        <div className="proposals-info-con">
          <div className="proposals-info-item">
            <div className="proposals-info-title">ENDS IN</div>
            <div className="proposals-info-value">{endTimeTxt}</div>
          </div>
          <div className="line"></div>
          <div className="proposals-info-item">
            <div className="proposals-info-title">LOCK TIME</div>
            <div className="proposals-info-value">{lockTimeTxt}</div>
          </div>
          <div className="line"></div>
          <div className="proposals-info-item">
            <div className="proposals-info-title">MY REWARDS</div>
            <div className="proposals-info-value">
              {
                rewardTxt(formatValue(reward, wanDecimal))
              }
            </div>
          </div>
          <div className="line"></div>
          <div className="proposals-info-item">
            <div className="proposals-info-title">MY BURN</div>
            <div className="proposals-info-value">
              {
                burnTxt(formatValue(burn, wanDecimal))
              }
            </div>
          </div>
          <div className="line"></div>
          <div className="proposals-info-item">
            <div className="proposals-info-title">MY STAKE</div>
            <div className="proposals-info-value">
              {formatValue(stake, wanDecimal)}&nbsp;<span className="proposals-info-per">WAN</span>
            </div>
          </div>
          {
            status === 'vote' ? (
              <>
                <div className="line"></div>
                <div className="proposals-info-item">
                  <div className="proposals-info-title">MY CHOICE</div>
                  <div className="proposals-info-value">
                    {
                      choiceTxt(choice)
                    }
                  </div>
                </div>
              </>
            ) : null
          }
        </div>
      </div>
      <div className="proposals-title" onClick={() => {
        router.push(`/proposalInfo?proposalId=${id}`)
      }}>{title}</div>
    </div>
  )
}

export default ProposalItem;