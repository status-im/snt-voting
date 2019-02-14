import web3 from 'Embark/web3';
import MiniMeTokenInterface from 'Embark/contracts/MiniMeTokenInterface';
import PollManager from 'Embark/contracts/PollManager';
import DappToken from 'Embark/contracts/DappToken';

const excluded = {
  // PROPER_LIGHT_CLIENT_SUPPORT : 3,
};

export const getBalance = async startBlock => {
  const { fromWei } = web3.utils;
  const { balanceOfAt } = DappToken.methods;
  const balance = await balanceOfAt(web3.eth.defaultAccount, startBlock - 1).call();
  return fromWei(balance);
};

const fetchPollData = async (index, pollMethod) => {
  const poll = await pollMethod(index).call({ from: web3.eth.defaultAccount });
  const blockInfo = await web3.eth.getBlock(poll._startBlock);
  return { ...poll, idPoll: index, blockInfo };
};

export const getPolls = (number, pollMethod) => {
  const polls = [];
  for (let i = number - 1; i >= 0; i--) {
    polls.push(fetchPollData(i, pollMethod));
  }
  return Promise.all(polls.reverse());
};

const excludedPolls = new Set(Object.values(excluded));
const exclusionFilter = (poll, idx) => !excludedPolls.has(idx);
export const omitPolls = polls => polls.filter(exclusionFilter);
