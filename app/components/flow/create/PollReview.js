import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';


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
        return <Fragment>
        <LinearProgress variant="determinate" value={96} />
        <div className="section pollCreation">
            <Typography variant="headline">Review details</Typography>
        </div>
        <div className="buttonNav">
            <Button onClick={this.sign} disabled={this.isSubmitting}>Sign to confirm</Button>
        </div>
        </Fragment>;
    }
}

export default withRouter(PollReview);
