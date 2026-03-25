import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab
} from "@heroui/react";
import Image from "next/image";
import "./VoteModal.css";
import { useState } from "react";
import { useTheme } from 'next-themes';

export default function VoteModal(props: {
  isOpen: boolean,
  onClose: () => void
}) {
  const {
    isOpen, onClose
  } = props;
  const { theme } = useTheme();

  const [voteType, setVoteType] = useState(true);
  const [voteValue, setVoteValue] = useState(2);   // burn: 1   lock: 2
  const [voteDurationIndex, setVoteDurationIndex] = useState(0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "w-[480] max-w-[480] m-0 p-0",
        closeButton: "top-6 right-6",
        body: "gap-0"
      }}
      closeButton={
        <div className="top-6 right-6">
          <Image src="/close_icon.svg" width={20} height={20} alt="close icon" />
        </div>
      }
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex pt-6 pb-2">
              <div className="vote-modal-type">VOTE NOW</div>
            </ModalHeader>
            <ModalBody>
              <div className="vote-modal-title pb-3">
                Wanchain Q1 Cross-chain Marketing Campaign
                <div className="line"></div>
              </div>
              <p className="vote-modal-item-title pt-7 mb-2">
                I Want to Vote
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div
                  className={`vote-type-item ${voteType && "vote-selected-yes"}`}
                  onClick={() => setVoteType(true)}
                >
                  <Image
                    className="normal-icon-size mr-1.5"
                    src={voteType ? "/favor_selected.svg" : "/favor_notselected.svg"}
                    width={18}
                    height={18}
                    alt="favor icon"
                  />
                  &nbsp;Yes
                </div>
                <div
                  className={`vote-type-item ${!voteType && "vote-selected-no"}`}
                  onClick={() => setVoteType(false)}
                >
                  <Image
                    className="normal-icon-size mr-1.5"
                    src={!voteType ? "/against_selected.svg" : "/against_notselected.svg"}
                    width={18}
                    height={18}
                    alt="favor icon"
                  />
                  &nbsp;No
                </div>
              </div>
              <p className="vote-modal-item-title mb-2">
                VOTING MECHANISM
              </p>
              <div className="voting-mechanism-con grid grid-cols-2 gap-0 mb-6">
                <div
                  className={`voting-mechanism-item ${voteValue === 2 && "bg-customBlue-0 text-white"}`}
                  onClick={() => setVoteValue(2)}
                >
                  <Image
                    className="normal-icon-size mr-1.5"
                    src={voteValue === 2 ? "/lock_selected_icon.svg" : "/lock_notselected_icon.svg"}
                    width={18}
                    height={18}
                    alt="favor icon"
                  />&nbsp;Lock (Bond)
                </div>
                <div
                  className={`voting-mechanism-item ${voteValue === 1 && "bg-customYellow-0 text-white"}`}
                  onClick={() => setVoteValue(1)}
                >
                  <Image
                    className="normal-icon-size mr-1.5"
                    src={voteValue === 1 ? "/burn_selected_icon.svg" : "/burn_notselected_icon.svg"}
                    width={18}
                    height={18}
                    alt="favor icon"
                  />&nbsp;Burn (Consume)
                </div>
              </div>
              <p className="vote-modal-item-title mb-2">
                Select lock duration multiplier:
              </p>
              {
                voteValue === 2 ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className={`vote-lock-duration-item mb-2 ${voteDurationIndex === 0 && "vote-lock-duration-active-item"}`}
                      onClick={() => setVoteDurationIndex(0)}
                    >
                      <p>Duration</p>
                      <div className={`vote-lock-duration-multiple-item ${voteDurationIndex === 0 && "vote-lock-duration-multiple-active-item"}`}>1x</div>
                    </div>
                    <div
                      className={`vote-lock-duration-item mb-2 ${voteDurationIndex === 1 && "vote-lock-duration-active-item"}`}
                      onClick={() => setVoteDurationIndex(1)}
                    >
                      <p>6 Months</p>
                      <div className={`vote-lock-duration-multiple-item ${voteDurationIndex === 1 && "vote-lock-duration-multiple-active-item"}`}>5x</div>
                    </div>
                    <div
                      className={`vote-lock-duration-item mb-2 ${voteDurationIndex === 2 && "vote-lock-duration-active-item"}`}
                      onClick={() => setVoteDurationIndex(2)}
                    >
                      <p>12 Months</p>
                      <div className={`vote-lock-duration-multiple-item ${voteDurationIndex === 2 && "vote-lock-duration-multiple-active-item"}`}>10x</div>
                    </div>
                  </div>
                ) : (
                  <div className="vote-modal-burn-description">
                    <Image
                      src="/vote_modal_burn_decription_icon.svg"
                      alt=""
                      width={18}
                      height={18}
                      className="normal-icon-size mr-3.5"
                    />
                    <div>
                      <p className="vote-modal-burn-decription-title mb-1">25x Voting Power Multiplier</p>
                      <p className="vote-modal-burn-decription-value">
                        Warning: Tokens used for this vote will be permanently destroyed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                )
              }
              <p className="vote-modal-item-title mb-2">
                Amount
              </p>
              <div className="vote-modal-amount-con mb-6">
                <input
                  className="vote-modal-amount-inp"
                  placeholder="0.00"
                />
                <div className="vote-modal-amount-per">WAN</div>
              </div>
              <div className="estimated-voting-power flex items-center justify-between">
                <div className="w-1/3 flex items-center">
                  <Image
                    className="normal-icon-size mr-2"
                    width={18}
                    height={18}
                    alt="estimated voting power icon"
                    src={theme === "light" ? "/vote_power_icon_light.svg" : "/vote_power_icon_dark.svg"}
                  />
                  <div className="estimated-voting-power-title">Estimated Voting Power:</div>
                </div>
                <div className="flex-1">
                  {/* <div className="flex">
                    <input />
                  </div> */}
                  <div className="voting-power-value">0 WAN Value</div>
                  <div className="voting-power-value-discription">0 WAN x 10x Multiplier</div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="vote-modal-cancel-btn" onClick={onClose}>
                Cancel
              </div>
              <div className="vote-modal-confirm-btn" onClick={onClose}>
                Confirm Vote
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}