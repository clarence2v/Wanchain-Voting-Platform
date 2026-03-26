import "./Tag.css"
import { ProposalCategory } from "@wandevs/governance-contracts-sdk";

export default function CategoryTag(props: {
  category: ProposalCategory
}) {
  // Funding	0	 Technical	1
  const { category } = props
  return (
    <>
      {
        category === 0 ? (
          <div className={`vote-type vote-type-funding`}>Funding</div>
        ) : (
          <div className={`vote-type vote-type-technical`}>Technical</div>
        )
      }
    </>
  )
}