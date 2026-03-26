'use client'
import "./page.css";
import Image from "next/image";
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { SVGProps, useEffect, useMemo, useState } from "react";
import { Select, SelectItem, Input } from "@heroui/react";
import fundingLightIcon from '@image/funding_icon_light.webp'
import fundingDarkIcon from '@image/funding_icon_dark.webp'
import technicalLightIcon from '@image/technical_icon_light.webp'
import technicalDarkIcon from '@image/technical_icon_dark.webp'
import { isNumber, formatBalance } from "@/utils/utils";
import { JSX } from "react/jsx-runtime";
import { useSdk } from "@/app/providers";
import { encodeProposalDescriptionData } from "@wandevs/governance-contracts-sdk";
import { useAccount } from "wagmi";
import { erc20Abi, maxUint256 } from "viem";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
  sendTransaction,
} from '@wagmi/core';
import { walletConfig } from "../wagmi";
import BigNumber from "bignumber.js";
import ConfirmModal from "@/components/ConfirmModal";
import { WAN_GOVERNOR_PROXY, TESTNET_XP_ADDR } from "@/config/address";

const MailIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity=".5" clip-path="url(#il547p6cya)">
        <path d="M12.667.666H3.333A3.337 3.337 0 0 0 0 3.999v8a3.337 3.337 0 0 0 3.333 3.334h9.334A3.337 3.337 0 0 0 16 11.999V4A3.337 3.337 0 0 0 12.667.666zM3.333 1.999h9.334a2 2 0 0 1 1.853 1.258L9.415 8.363a2.005 2.005 0 0 1-2.83 0L1.48 3.257A2 2 0 0 1 3.333 2zm9.334 12H3.333a2 2 0 0 1-2-2V5l4.31 4.307a3.338 3.338 0 0 0 4.714 0l4.31-4.307v7a2 2 0 0 1-2 2z" fill="#152234"/>
      </g>
      <defs>
        <clipPath id="il547p6cya">
          <path fill="#fff" d="M0 0h16v16H0z"/>
        </clipPath>
      </defs>
    </svg>
  )
}

const TelegramIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M16.303 1.981c.273.024.634.124.904.442.27.316.347.732.31 1.174l.001.001c-.023.32-.132 1-.26 1.815-.131.837-.292 1.865-.432 2.932l-.002.012-.967 6.34-.002.017-.006.047a2.38 2.38 0 0 1-.176.618c-.152.347-.481.837-1.132.982-.591.132-1.22-.1-1.626-.29a5.355 5.355 0 0 1-.93-.557v.001l-.145-.097-.379-.248c-.308-.203-.716-.472-1.152-.766-.855-.576-1.859-1.278-2.403-1.757v.001c-.192-.164-.477-.474-.547-.919-.079-.494.135-.959.562-1.342l2.055-1.963-3.709 2.524-.01.007-.01.006-.345-.551.343.552h-.001l-.003.003-.007.005-.018.01a1.335 1.335 0 0 1-.19.09 2.418 2.418 0 0 1-.487.138c-.413.073-.982.077-1.687-.135h-.004l-2.63-.812-.082-.026-.072-.045.345-.55-.346.55h-.001l-.001-.002-.003-.002-.008-.005-.02-.013c-.014-.01-.033-.023-.054-.04a1.492 1.492 0 0 1-.157-.139 1.17 1.17 0 0 1-.33-.63c-.055-.355.08-.687.34-.949.232-.232.57-.42 1.002-.582 4.064-1.914 9.065-3.871 13.454-5.688l.012-.005.237.606-.236-.606h.001l.003-.001.007-.003.022-.008a2.152 2.152 0 0 1 .28-.082c.167-.04.421-.083.692-.06zm-.112 1.295a.961.961 0 0 0-.282.03 1.441 1.441 0 0 0-.113.032l-.022.007C11.346 5.177 6.4 7.112 2.374 9.01l-.026.012-.027.01c-.116.043-.21.084-.286.12l2.198.678c.506.151.866.135 1.079.098.108-.02.184-.045.225-.062.012-.005.02-.01.027-.014l5.638-3.835c.517-.352.924-.58 1.24-.69.152-.051.35-.1.556-.074.251.031.516.18.638.477a.918.918 0 0 1 .028.573c-.033.134-.09.26-.146.365a2.63 2.63 0 0 1-.439.59l-.004.005-.006.005-4.25 4.059-.01.01-.01.008a.577.577 0 0 0-.152.18l-.003.004a.166.166 0 0 0 .02.036c.01.015.022.032.038.048l.051.049.007.006c.468.413 1.404 1.07 2.276 1.658.429.29.832.555 1.14.757.286.188.528.346.591.393l.009.006.008.007c.061.05.341.245.683.405.374.176.655.228.792.198.078-.018.154-.076.224-.236.033-.075.055-.151.067-.21.006-.03.01-.052.01-.065l.002-.008.002-.02.003-.02.972-6.371c.142-1.08.304-2.117.435-2.95.135-.858.23-1.458.247-1.706v-.011h.001c.01-.114 0-.18-.007-.214-.007-.001-.014-.004-.024-.005z" fill="#152234" opacity=".5"/>
    </svg>
  )
}

export default function Proposals() {
  const { theme } = useTheme();
  const isdark = useMemo(() => {
    return theme === 'dark'
  }, [theme])
  const sdk = useSdk();
  const { address } = useAccount();
  const [voteValue, setVoteValue] = useState('lock');
  const [category, setCategory] = useState(0);
  const [proposalTitle, setProposalTitle] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [requestValue, setRequestValue] = useState('');
  const [pledgeValue, setPledgeValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [userNameValue, setUserNameValue] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [minAmount, setMinAmount] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState('0');
  const typeArr = useMemo(() => {
    return [{
    label: 'Funding',
    icon: isdark ? fundingDarkIcon : fundingLightIcon
  }, {
    label: 'Technical',
    icon: isdark ? technicalDarkIcon : technicalLightIcon
  }]
  }, [isdark])


  useEffect(() => {
    const getInfo = async () => {
      if (!sdk) {
        console.error('sdk init')
        return
      }
      const baseRes = await sdk.getBaseParameters();
      console.log('baseRes', baseRes)
      const {
        minParticipationAmount
      } = baseRes;
      setMinAmount(Number(minParticipationAmount))

      const treasuryAddr = baseRes.wanTreasury;
      const treasuryOriginalBalance = await sdk.publicClient.getBalance({
        address: treasuryAddr
      })
      setTreasuryBalance(formatBalance(treasuryOriginalBalance))
    }
    getInfo();
  }, [sdk])

  const handleRequestValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!isNumber(value)) {
      if (value !== '') return
    }
    if (Number(value) < 0) {
      return
    }
    const arr = value.split('')
    if (arr.length > 1 && arr[0] === '0' && arr[1] !== '.') {
      value = String(Number(value))
    }
    setRequestValue(value);
  }

  const handlePledgeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!isNumber(value)) {
      if (value !== '') return
    }
    if (Number(value) < 0) {
      return
    }
    const arr = value.split('')
    if (arr.length > 1 && arr[0] === '0' && arr[1] !== '.') {
      value = String(Number(value))
    }
    setPledgeValue(value);
  }

  const handleInpDesciprtion = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescriptionValue(value);
  }

  const handleInpEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);
  }

  const handleInpUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserNameValue(value);
  }

  const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let value = e.target.value;
    console.log('value select:::;')
    let categoryId = 0;
    if (value === 'Funding') {
      categoryId = 0; 
    } else {
      categoryId = 1;
    }
    setCategory(categoryId);
  }

  const pledgeIsFull = useMemo(() => {
    return Number(pledgeValue) >= 1000;
  }, [pledgeValue])

  const handleCancel = () => {
    setVoteValue('lock');
    setProposalTitle('');
    setDescriptionValue('');
    setRequestValue('');
    setPledgeValue('');
  }

  const handleHiddenModal = () => setShowConfirmModal(false)

  const checkAllowance = async () => {
    if (!address || !sdk) {
      console.error('sdk init or not connect')
      return;
    }
    const allowance = await sdk.publicClient.readContract({
      address: TESTNET_XP_ADDR,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address, WAN_GOVERNOR_PROXY],
    });

    // allowance: bigint
    console.log('sdk.publicClient', allowance)
    return allowance > 0;
  }

  const handleApprove = async () => {
    const { request, result } = await simulateContract(walletConfig, {
      address: TESTNET_XP_ADDR,
      abi: erc20Abi,
      functionName: 'approve',
      args: [WAN_GOVERNOR_PROXY, maxUint256],
      // args: [WAN_GOVERNOR_PROXY, BigInt(1000*Math.pow(10, 18))], not allow use maxUint256
      account: address,
    });
    console.log('request', request, result)
    const hash = await writeContract(walletConfig, request);
    console.log('approve tx hash', hash);

    const receipt = await waitForTransactionReceipt(walletConfig, { hash });
    console.log('approve receipt', receipt);

    return hash;
  }

  const handleSubmit = async () => {
    console.log('encodeProposalDescriptionData', encodeProposalDescriptionData)
    if (!sdk || !address) {
      console.error('sdk init or not connect')
      return;
    }
    const isApprove = await checkAllowance();
    if (!isApprove) {
      await handleApprove();
    }
    const version = 1;
    if (!version || !proposalTitle || !descriptionValue || !emailValue || !userNameValue) {
      console.error('invalid info')
      return;
    }
    const pledgeType = voteValue === 'lock' ? 2 : 1;
    const description = encodeProposalDescriptionData(version, proposalTitle, descriptionValue, emailValue, userNameValue);
    const pledgeNum = BigInt(new BigNumber(pledgeValue).times(Math.pow(10, 18)).toString())
    if (new BigNumber(pledgeNum).lt(minAmount)) {
      console.error('invalid amount')
      return;
    }
    const requestNum = BigInt(new BigNumber(requestValue).times(Math.pow(10, 18)).toString())
    if (new BigNumber(requestNum).gt(treasuryBalance)) {
      console.error('The requested amount must not exceed 10% of the Community Treasury.')
      return;
    }
    const request = await sdk.buildCreateProposalTx(address, pledgeNum, requestNum, category, pledgeType, description);
    const hash = await sendTransaction(walletConfig, request);
    console.log('raw tx hash', hash);

    const receipt = await waitForTransactionReceipt( walletConfig, { hash });
    console.log('raw tx receipt', receipt);

    handleHiddenModal();
    handleCancel();
  }

  return (
    <div className="min-h-screen px-[120]">
      <div className="pt-4 pb-6 w-fit">
        <Link className="back-title flex items-center" href="/">
          <Image className="smal-icon-size mr-3" width={16} height={16} src={theme === "light" ? "/arrow_back_icon_light.svg" : "/arrow_back_icon_dark.svg"} alt="back home icon" />
          &nbsp;Back to Home
        </Link>
      </div>
      <div className="flex justify-center">
        <div className="create-body">
          <div className="create-title mb-2">Create New Proposal</div>
          <div className="create-discription mb-4">
            Submit your proposal for community voting. Please ensure all details are accurate as they cannot be changed once submitted.
          </div>
          <div className="creation-line mb-4"></div>
          <div className="proposal-creation-discription-con">
            <Image
              src="/proposal_creation_icon.svg"
              width={20}
              height={20}
              alt="proposal creation icon"
              className="large-icon-size"
            />
            <div className="ml-2">
              <div className="proposal-creation-discription-title mb-1">Proposal Creation Cost</div>
              <div className="proposal-creation-discription-value">Creating a proposal requires burning</div>
            </div>
          </div>
          <div className="flex items-center mb-4 h-5">
            <Image
              className="normal-icon-size mr-2"
              width={18}
              height={18}
              src="/basic-information-icon@3x.webp"
              alt="basic information icon"
            />
            <p className="creation-item-title">Basic Information</p>
          </div>
          <p className="creation-proposal-title  h-5 flex items-center mb-2">Proposal Title</p>
          <div className="inp-con mb-4 px-4">
            <input
              placeholder="Enter a clear, descriptive title"
              value={proposalTitle}
              onChange={e => setProposalTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            key="outside-top"
            classNames={{
              label: "creation-proposal-title  h-5 flex items-center mb-2",
              trigger: "inp-con mb-8 px-4"
            }}
            listboxProps={{
              itemClasses: {
                base: [
                  "data-[data-hover=true]:bg-customBlue-1",
                  "data-[hover=true]:bg-customBlue-1",
                  "data-[data-selectable=true]:focus:bg-customBlue-1",
                  "data-[selectable=true]:focus:bg-customBlue-1",
                ]
              }
            }}
            labelPlacement="outside-top"
            label="Category"
            placeholder="Select an animal"
            onChange={handleCategory}
          >
            {typeArr.map((v) => (
              <SelectItem key={v.label} textValue={v.label}>
                <div className="flex items-center">
                  <Image
                    className="large-icon-size mr-2 "
                    src={v.icon}
                    width={20}
                    height={20}
                    alt=""
                  />
                  {v.label}
                </div>
              </SelectItem>
            ))}
          </Select>
          <div className="flex items-center mb-4 h-5">
            <Image
              className="normal-icon-size mr-2"
              width={18}
              height={18}
              src="/funding-request-icon@3x.webp"
              alt="funding request icon"
            />
            <p className="creation-item-title">Funding Request</p>
          </div>
          <p className="creation-proposal-title  h-5 flex items-center mb-2">Requested Amount (WAN)</p>
          <div className="inp-con justify-between px-4 mb-2">
            <input
              className="inp-request-value"
              value={requestValue}
              onChange={handleRequestValue}
              placeholder="0"
            />
            WAN
          </div>
          <p className="creation-discription-tip mb-3">Technical proposals usually request 0 WAN.</p>
          <div className="funding-requestion-con p-6 mb-4">
            <p className="funding-requestion-title mb-2">Collateral Configuration</p>
            <div className="voting-mechanism-con grid grid-cols-2 gap-0 mb-6">
              <div
                className={`voting-mechanism-item ${voteValue === "lock" ? "bg-customBlue-0 text-white" : ""}`}
                onClick={() => setVoteValue("lock")}
              >
                <Image
                  className="small-icon-size mr-1.5"
                  src={voteValue === "lock" ? "/lock_selected_icon.svg" : "/lock_notselected_icon.svg"}
                  width={16}
                  height={16}
                  alt="favor icon"
                />&nbsp;Lock (10x Leverage)
              </div>
              <div
                className={`voting-mechanism-item ${voteValue === "burn" ? "bg-customYellow-0 text-white" : ""}`}
                onClick={() => setVoteValue("burn")}
              >
                <Image
                  className="small-icon-size mr-1.5"
                  src={voteValue === "burn" ? "/burn_selected_icon.svg" : "/burn_notselected_icon.svg"}
                  width={16}
                  height={16}
                  alt="favor icon"
                />&nbsp;Burn (50x Leverage)
              </div>
            </div>
            <div className="funding-requestion-title mb-2 flex items-center justify-between">
              Your Pledge Amount
              <p>Min. Required for Active:<span>0.01 WAN</span></p>
            </div>
            <div className="inp-con justify-between px-4 mb-3">
              <input
                className="inp-request-value"
                value={pledgeValue}
                onChange={handlePledgeValue}
                placeholder="0"
              />
              <span>WAN</span>
            </div>
            {
              pledgeIsFull ? (
                <div className="creation-prospective-active-con">
                  <div className="flex justify-between mb-4">
                    <Image
                      src="/creation_proposal_active_icon.svg"
                      className="extra-large-icon-size mr-3"
                      width={24}
                      height={24}
                      alt=""
                    />
                    <div>
                      <p className="creation-prospective-active-title mb-1">Active Proposal (Direct to Vote)</p>
                      <div className="creation-proposal-descrition">
                        Great! You fully meet the collateral requirement. Once approved by the team, this proposal will immediately start the voting period.
                      </div>
                    </div>
                  </div>
                  <div className="prograss-active-line"></div>
                </div>
              ) : (
                <div className="creation-prospective-con">
                  <div className="flex justify-between mb-4">
                    <Image
                      src="/creation_proposal_dollar_icon.svg"
                      className="extra-large-icon-size mr-3"
                      width={24}
                      height={24}
                      alt=""
                    />
                    <div>
                      <p className="creation-prospective-title mb-1">Prospective Proposal (Needs Sponsors)</p>
                      <div className="creation-proposal-descrition">
                        Your pledge covers 0% of the requirement. Once approved, this proposal will require community sponsors to pledge the remaining 0.00 WAN.
                      </div>
                    </div>
                  </div>
                  <div className="prograss-line"></div>
                </div>
              )
            }
          </div>
          <div className="flex items-center mb-4 h-5">
            <Image
              className="normal-icon-size mr-2"
              width={18}
              height={18}
              src="/proposal-details-icon@3x.webp"
              alt="proposal details icon"
            />
            <p className="creation-item-title">Proposal Details</p>
          </div>
          <p className="creation-proposal-title  h-5 flex items-center mb-2">Description</p>
          <textarea
            placeholder="Describe your proposal in detail."
            className="creation-description"
            value={descriptionValue}
            onChange={handleInpDesciprtion}
          />
          <div className="flex justify-between mb-4">
            <Input
              label="Email Address"
              labelPlacement="outside"
              placeholder="name@example.com"
              startContent={
                <MailIcon className="pointer-events-none shrink-0" />
              }
              type="email"
              classNames={{
                base: "mr-4",
                label: "creation-proposal-title h-5 mb-2",
                inputWrapper: [
                  "creation-email-con"
                ]
              }}
              value={emailValue}
              onChange={handleInpEmail}
            />
            <Input
              label="Telegram ID"
              labelPlacement="outside"
              placeholder="@username"
              startContent={
                <TelegramIcon className="pointer-events-none shrink-0" />
              }
              type="text"
              classNames={{
                label: "creation-proposal-title h-5 mb-2",
                inputWrapper: [
                  "creation-email-con"
                ]
              }}
              value={userNameValue}
              onChange={handleInpUserName}
            />
          </div>
          <div className="flex items-center mb-4 h-5">
            <Image
              className="normal-icon-size mr-2"
              width={18}
              height={18}
              src="/voting-period-icon@3x.webp"
              alt="voting period icon"
            />
            <p className="creation-item-title">Voting Period</p>
          </div>
          <div className="creation-voting-con mb-8">
            <p className="creation-voting-title">Voting Duration</p>
            <div className="flex justify-between">
              <p className="creation-voting-value">
                To ensure security and validity, the voting period will start automatically immediately after the team audit is approved.
              </p>
              <div className="creation-voting-duration-con">
                <p className="creation-voting-duration-value">2 Weeks</p>
                <p className="creation-voting-duration-note">(Fixed)</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row-reverse">
            <div className="creation-submit-btn" onClick={() => setShowConfirmModal(true)}>
              Submit Proposal
              <Image
                src="/submit_icon.svg"
                alt=""
                width={16}
                height={16}
                className="small-icon-size ml-2"
              />
            </div>
            <div className="creation-cancel-btn" onClick={handleCancel}>Cancel</div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleHiddenModal}
        onConfirm={handleSubmit}
      ></ConfirmModal>
    </div>
  )
}