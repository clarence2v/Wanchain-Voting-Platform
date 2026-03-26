import { useMemo } from "react";
import "./Tag.css"
import { ProposalState } from "@wandevs/governance-contracts-sdk";

export default function StateTag(props: {
  state: ProposalState,
  showPoint?: boolean
}) {
  const { state, showPoint } = props
  // None: 0, UnderReview: 1, Canceled: 2
  const statusClassName = useMemo(() => {
    switch(state) {
      case 4:
        return 'vote-state-active';
      case 5:
        return 'vote-state-passed';
      case 6:
        return 'vote-state-failed';
      case 3:
        return 'vote-state-prospective';
      default:
        return 'vote-state-active';
    }
  }, [state])

  const statusName = useMemo(() => {
    switch(state) {
      case 4:
        // VotingInProgress
        return 'Active';
      case 5:
        // Succeeded
        return 'Passed';
      case 6:
        // Rejected
        return 'Failed';
      case 3:
        // Fundraising
        return 'Prospective';
      default:
        return 'Active';
    }
  }, [state])
  return (
    <div className={`vote-state ${statusClassName}`}>
      {
        showPoint ? (
          <div className={`vote-state-point-active mr-1.5`}></div>
        ) : null
      }
      {statusName}
    </div>
  )
}