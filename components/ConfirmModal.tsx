import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import Image from "next/image";
import "./ConfirmModal.css";

export default function ConfirmModal(props: {
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  const {
    isOpen, onClose, onConfirm
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: "w-[448] max-w-[448] m-0 p-0",
        closeButton: "hidden",
        body: "gap-0"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex pt-6 pb-2">
              <div className="confirm-modal-title mb-4">
                <Image
                  className="extra-large-icon-size mr-3"
                  src="/confirm_info_icon.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                Submit Proposal?
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="confirm-modal-body pl-4 mb-6">
                Your proposal will be submitted to the Wanchain Team for review. The team will review it as soon as possible. Once approved, your proposal will enter the public voting phase.
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="confirm-modal-cancel-btn mr-3" onClick={onClose}>
                Cancel
              </div>
              <div className="confirm-modal-confirm-btn" onClick={onConfirm}>
                Confirm
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}