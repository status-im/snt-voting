import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {Link} from "react-router-dom";

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
      str = '0' + str;
  }
  return str;
}

Date.prototype.DDMMYYYYatHHMM = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var dd = pad(this.getDate(), 2);
    var hh = pad(this.getHours(), 2);
    var mm = pad(this.getMinutes(), 2)
  
    return dd + '/' + MM + '/' + yyyy + ' at ' +  hh + ':' + mm + (this.getHours() > 12 ? 'pm' : 'am');
  };

class PollCreationResults extends Component {

    state = {
        poll: {},
        idPoll: null,
        isError: false,
        isPending: true,
        netId: 3
    }

    componentDidMount(){
        const {pollTransaction, pollTransactionHash, history} = this.props;

        if(!pollTransaction || !pollTransactionHash){
          history.push('/');
          return;
        }

        this.setState({poll: Object.assign({}, this.props.poll)});

        EmbarkJS.onReady(() => {  
          web3.eth.net.getId((err, netId) => {
            this.setState({netId});
          });
    
          if(pollTransaction){
            pollTransaction.catch(x => {
              this.setState({isError: true});
            });
    
            let req = false;
            let interval = setInterval(async () => {
              if(req || !pollTransactionHash) return;
    
              req = true;
              const receipt = await web3.eth.getTransactionReceipt(pollTransactionHash);
              if(receipt){
                clearInterval(interval);
                
                if(receipt.status || receipt.status == "0x1"){
                  this.setState({isPending: false});

                  const ev = web3.eth.abi.decodeLog(PollManager.options.jsonInterface.find(x => x.name == "PollCreated").inputs, receipt.logs[0].data, receipt.logs[0].topics.slice(1));
                  
                  await this.props.getPolls();
                  const poll = await PollManager.methods.poll(ev.idPoll).call();
                  this.props.loadPollContent(poll);

                  this.props.resetPoll();

                  this.setState({idPoll: ev.idPoll})
                } else {
                  this.setState({isError: true});
                }
              }
              req = false;
            }, 100);
          }
        });
      }

      linkTo = id => e => {
        let url = window.location.href.replace(window.location.hash, '');
        url += '?d=' + (new Date()).getTime() + '#/titleScreen/' + id; 

        window.location.href = url;
      }

      render(){
        const {pollTransaction, pollTransactionHash} = this.props;
        let {isError, isPending, netId, idPoll, poll} = this.state;

        const etherscanURL = netId == 3 ? 'https://ropsten.etherscan.io/tx/' : ( netId == 1 ? "https://etherscan.io/tx/" : '');

        if(poll.options == null) return null;

        return <Fragment>
         
        { isError && <div className="errorTrx">
        <div className="image"><img src="../images/sad-face.svg" width="24" /></div>
        <Typography variant="headline">Transaction failed</Typography>
        <Typography variant="body1">Your transaction failed to be written to the blockchain. This is usually because of network congestion. Please try again</Typography>
        <Link to={"/poll/review/"}>
          <Button color="primary" variant="contained">Try again</Button>
        </Link>
      </div> }

      { !isError && pollTransaction && <div className="transactionArea">
        { isPending && <div className="pending">
           <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
          <Typography variant="headline">Your poll will be created once the transaction is complete</Typography>
          <Typography variant="body1">Your poll is in the process of being confirmed in the blockchain</Typography>
        </div>
        }
        { !isPending && pollTransaction && <div className="confirmed">
        <img src="../images/confirmed.svg" width="40" />
        <Typography variant="headline">The poll was created and it’s now live!</Typography>
      </div>}
        { pollTransactionHash && etherscanURL && <Typography variant="body1"><a target="_blank" href={ etherscanURL + pollTransactionHash}>View details on Etherscan</a></Typography> }
        
        { idPoll !== null && <Typography variant="body1"><a href="#" onClick={this.linkTo(idPoll)}>See the poll</a></Typography> }

        
        </div>
      }
      <div class="section">
      <div className="reviewDetails">
          <Typography variant="h3">{poll.title}<br /><br /></Typography>
          <Typography variant="body1">{poll.description}<br /><br /><br /></Typography>
          <div className="pollOption ">
              <Typography variant="h3" className="grayHeader">Poll starts:</Typography>
              <Typography variant="body2" className="detail">Today (upon publishing)<br /><br /></Typography>
              <Typography variant="h3" className="grayHeader">Poll ends:</Typography>
              <Typography  variant="body2"  className="detail">{poll.endDate.DDMMYYYYatHHMM()}</Typography>
          </div>

          <Typography variant="h3" className="grayHeader"><br /><br />Options</Typography>
          {
              poll.options.map((item, i) => {
                  return  <div className="pollOption" key={i}>
                      <Typography variant="display1">{item.title}</Typography>
                      <Typography variant="body2">{item.content}</Typography>
                  </div>
              })
          }
      </div>
      </div>
      
        </Fragment>;
      }
}

export default withRouter(PollCreationResults);
