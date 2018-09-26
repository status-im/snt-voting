import web3 from "Embark/web3"
import MiniMeTokenInterface from 'Embark/contracts/MiniMeTokenInterface';
import PollManager from 'Embark/contracts/PollManager';
import SNT from 'Embark/contracts/SNT';

const excluded = {
 // PROPER_LIGHT_CLIENT_SUPPORT : 3,
};

export const getBalance = async (startBlock) => {
  const { fromWei } = web3.utils;
  const { balanceOfAt } = SNT.methods;
  const balance = await balanceOfAt(web3.eth.defaultAccount, startBlock - 1).call();
  return fromWei(balance);
}
export const getVote = async(idPoll) => {
  const { fromWei } = web3.utils;
  const votes = await PollManager.methods.getVote(idPoll, web3.eth.defaultAccount).call();
  return parseInt(Math.sqrt(fromWei(votes)));
}

const fetchPollData = async (index, pollMethod) => {
  const poll = await pollMethod(index).call();
  const balance = await getBalance(poll._startBlock);

  //const votes = await getVote(index);
  return { ...poll, idPoll: index, balance, votes: "0" };
}

export const getPolls = (number, pollMethod) => {
  const polls = [];
  for (let i = number-1; i >= 0; i--) {
    polls.push(fetchPollData(i, pollMethod));
  }
  return Promise.all(polls.reverse());
}

const excludedPolls = new Set(Object.values(excluded));
const exclusionFilter = (poll, idx) => !excludedPolls.has(idx);
export const omitPolls = polls => polls.filter(exclusionFilter);
