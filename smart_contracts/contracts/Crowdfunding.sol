// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
    struct Milestone {
        string description;
        uint256 amount;
        bool approved;
        uint256 approvalCount;
        bool fundsReleased;
    }

    struct Campaign {
        address payable creator;
        string title;
        string description;
        string imageURI;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool withdrawn;
        uint256 totalMilestones;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => address[]) public donors;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public milestoneApprovals;

    uint256 public campaignCount;

    event CampaignCreated(uint256 indexed id, address creator, string title, uint256 goal, uint256 deadline);
    event DonationReceived(uint256 indexed id, address donor, uint256 amount);
    event MilestoneCreated(uint256 indexed campaignId, uint256 indexed milestoneId, string description, uint256 amount);
    event MilestoneApproved(uint256 indexed campaignId, uint256 indexed milestoneId, address donor);
    event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed donor, uint256 amount);

    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _imageURI,
        uint256 _goal,
        uint256 _durationInDays
    ) public {
        require(_goal > 0, "Goal must be greater than zero");
        
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);
        
        campaigns[campaignCount] = Campaign({
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            imageURI: _imageURI,
            goal: _goal,
            deadline: deadline,
            amountRaised: 0,
            withdrawn: false,
            totalMilestones: 0
        });

        emit CampaignCreated(campaignCount, msg.sender, _title, _goal, deadline);
        campaignCount++;
    }

    function createMilestone(uint256 _campaignId, string memory _description, uint256 _amount) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only creator can add milestones");
        
        uint256 mId = campaign.totalMilestones;
        milestones[_campaignId][mId] = Milestone({
            description: _description,
            amount: _amount,
            approved: false,
            approvalCount: 0,
            fundsReleased: false
        });
        
        campaign.totalMilestones++;
        emit MilestoneCreated(_campaignId, mId, _description, _amount);
    }

    function donate(uint256 _campaignId) public payable nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be greater than zero");

        if (contributions[_campaignId][msg.sender] == 0) {
            donors[_campaignId].push(msg.sender);
        }

        contributions[_campaignId][msg.sender] += msg.value;
        campaign.amountRaised += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function approveMilestone(uint256 _campaignId, uint256 _milestoneId) public {
        require(contributions[_campaignId][msg.sender] > 0, "Only donors can approve");
        require(!milestoneApprovals[_campaignId][_milestoneId][msg.sender], "Already approved");
        
        Milestone storage milestone = milestones[_campaignId][_milestoneId];
        require(!milestone.fundsReleased, "Funds already released");

        milestoneApprovals[_campaignId][_milestoneId][msg.sender] = true;
        milestone.approvalCount++;

        // If more than 50% of donors approve, mark as approved
        if (milestone.approvalCount > donors[_campaignId].length / 2) {
            milestone.approved = true;
            emit MilestoneApproved(_campaignId, _milestoneId, msg.sender);
        }
    }

    function releaseMilestoneFunds(uint256 _campaignId, uint256 _milestoneId) public nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only creator can release funds");
        require(block.timestamp >= campaign.deadline, "Campaign still running");
        require(campaign.amountRaised >= campaign.goal, "Funding goal not reached");
        
        Milestone storage milestone = milestones[_campaignId][_milestoneId];
        require(milestone.approved, "Milestone not approved by majority");
        require(!milestone.fundsReleased, "Funds already released");
        require(address(this).balance >= milestone.amount, "Insufficient contract balance");

        milestone.fundsReleased = true;
        
        (bool sent, ) = campaign.creator.call{value: milestone.amount}("");
        require(sent, "Failed to send Ether");

        emit FundsReleased(_campaignId, _milestoneId, milestone.amount);
    }

    function withdraw(uint256 _campaignId) public nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only creator can withdraw");
        require(block.timestamp >= campaign.deadline, "Campaign still running");
        require(campaign.amountRaised >= campaign.goal, "Funding goal not reached");
        require(!campaign.withdrawn, "Already withdrawn");
        require(campaign.totalMilestones == 0, "Use milestone release instead");

        campaign.withdrawn = true;
        
        (bool sent, ) = campaign.creator.call{value: campaign.amountRaised}("");
        require(sent, "Failed to send Ether");
    }

    function refund(uint256 _campaignId) public nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign still running");
        require(campaign.amountRaised < campaign.goal, "Funding goal reached, no refunds");

        uint256 contributedAmount = contributions[_campaignId][msg.sender];
        require(contributedAmount > 0, "No contributions found");

        contributions[_campaignId][msg.sender] = 0;
        
        (bool sent, ) = payable(msg.sender).call{value: contributedAmount}("");
        require(sent, "Failed to send refund");

        emit RefundIssued(_campaignId, msg.sender, contributedAmount);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }
    
    function getDonors(uint256 _campaignId) public view returns (address[] memory) {
        return donors[_campaignId];
    }
}
