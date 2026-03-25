import "./ProposalItem.css";
import Image from "next/image";
import { handleTime } from "@/utils/utils";

const ProposalItem = ({
  id,
  type,
  status,
  choice,
  stake,
  burn,
  reward,
  lockTime,
  endTime,
  title
}: {
  id: string
  type?: string
  status: string
  choice: string
  stake: string
  burn: string
  reward: string
  lockTime: string
  endTime: string
  title: string
}) => {
  const typeClassName = type === 'Technical' ? 'proposals-type-technical' : 'proposals-type-funding';
  const statusClassName = (value: string) => {
    switch(value) {
      case 'Active':
        return 'proposals-status-active';
      case 'Passed':
        return 'proposals-status-passed';
      case 'Failed':
        return 'proposals-status-failed';
      case 'Prospective':
        return 'proposals-status-prospective';
      default:
        return 'proposals-status-active';
    }
  }
  const choiceTxt = (value: string) => {
    if (value === 'yes') {
      return (
        <>
          <Image className="icon-size" src={'/favor_selected.svg'} width={16} height={16} alt={`favor icon`} />
          <span className="proposals-info-choice-favor">{value}</span>
        </>
      )
    } else {
      return (
        <>
          <Image className="icon-size" src={'/against_selected.svg'} width={16} height={16} alt={`against icon`} />
          <span className="proposals-info-choice-against">{value}</span>
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
  const lockTimeTxt = lockTime === '-1' ? 'Vote Duration' : `${lockTime} Months`;
  const endTimeTxt = endTime === '-1' ? 'Ended' : handleTime(endTime);
  return (
    <div className="proposals-item-con p-6 mb-4">
      <div className="flex justify-between">
        <div className="flex">
          <div className="proposals-id">#{id}</div>
          {
            type ? (
              <div className={`proposals-type ${typeClassName}`}>{type}</div>
            ) : null
          }
          <div className={`proposals-status ${statusClassName(status)}`}>{status}</div>
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
                rewardTxt(reward)
              }
            </div>
          </div>
          <div className="line"></div>
          <div className="proposals-info-item">
            <div className="proposals-info-title">MY BURN</div>
            <div className="proposals-info-value">
              {
                burnTxt(burn)
              }
            </div>
          </div>
          <div className="line"></div>
          <div className="proposals-info-item">
            <div className="proposals-info-title">MY STAKE</div>
            <div className="proposals-info-value">
              {stake}&nbsp;<span className="proposals-info-per">WAN</span>
            </div>
          </div>
          <div className="line"></div>
          <div className="proposals-info-item">
            <div className="proposals-info-title">MY CHOICE</div>
            <div className="proposals-info-value">
              {
                choiceTxt(choice)
              }
            </div>
          </div>
        </div>
      </div>
      <div className="proposals-title">{title}</div>
    </div>
  )
}

export default ProposalItem;