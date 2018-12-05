import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

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
class PollReview extends Component {

    state = {
        isSubmitting : false
    }

    componentDidMount(){
        if(this.props.poll.endDate === null || this.props.poll.endDate === undefined){
            const {history} = this.props;
            history.push('/');
        }
    }

    sign = async () => {
        this.setState({isSubmitting: true});
    
        const {history, poll} = this.props;
        const addPollOnlyEndTime = PollManager.methods["addPoll(uint256,bytes,uint8)"];

        const endTime = parseInt(poll.endDate.getTime() / 1000, 10);
        const pollObj = {
            'title': poll.title,
            'description': poll.description,
            'ballots': poll.options
        }
        const pollObjString = JSON.stringify(pollObj);

        const ipfsHash = await EmbarkJS.Storage.saveText(pollObjString);
        const encodedDesc = web3.utils.toHex(ipfsHash);
        const toSend = addPollOnlyEndTime(endTime, encodedDesc, pollObj.ballots.length || 0);
        const gasEstimated = await toSend.estimateGas();
        const transaction = toSend.send({gas: gasEstimated + 100000});

        transaction.on('transactionHash', hash => {
            this.props.setPollTransactionHash(hash);
            this.props.setPollTransactionPromise(transaction);
            history.push('/poll/results/');
        });

        transaction.catch(err => {
            this.setState({isSubmitting: false});
        });
    }
    

    render() {
        const {poll} = this.props;

        if(!poll.options) return null;

        return <Fragment>
        <LinearProgress variant={this.state.isSubmitting ? "indeterminate" : "determinate"} value={this.state.isSubmitting ? 100 : 96} />
        <div className="section pollCreation">
            <Typography variant="headline">Review details</Typography>

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
        <div className="buttonNav">
            <Button onClick={this.sign} disabled={this.state.isSubmitting}>Sign to confirm</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollReview);
