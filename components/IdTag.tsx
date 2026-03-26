import "./Tag.css"
import { HexType } from "@/types/proposalTypes";
import { copyTxt2Clipboard, clipString } from "@/utils/utils";

export default function IdTag(props: {
  id: HexType
}) {
  const { id } = props
  return (
    <div className="vote-id" onClick={() => copyTxt2Clipboard(id)}>{clipString(id, 3, 3)}</div>
  )
}