import React, { Fragment } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PollManager from 'Embark/contracts/PollManager';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import { withFormik } from 'formik';
import rlp from 'rlp';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  inputLabel: {
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  textFieldInput: {
    fontSize: '16px'
  },
  textFieldFormLabel: {
    fontSize: 18,
  }
});

const InnerForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  classes
}) => (
  <Card>
    <CardContent>
      <form onSubmit={handleSubmit} className={classes.form}>
        
        <TextField
          id="ballots"
          label="Enter the poll details(title: &quot;&quot;description: &quot;&quot;, ballots: [{&quot;title&quot;:&quot;&quot;, &quot;subtitle&quot;:&quot;&quot;, &quot;content&quot;:&quot;&quot;}]) (optional)"
          className={classes.textField}
          value={values.ballots}
          onChange={handleChange}
          margin="normal"
          fullWidth
          multiline={true}
          rows={10}
          error={!!errors.ballots}
          InputProps={{
            classes: {
              input: classes.textFieldInput
            },
          }}
          InputLabelProps={{
            className: classes.textFieldFormLabel
          }}
          helperText={errors.ballots}
        />


        <TextField
          id="startBlock"
          label="Start Block (optional)"
          className={classes.textField}
          value={values.startBlock}
          onChange={handleChange}
          margin="normal"
          fullWidth
          error={!!errors.startBlock}
          InputProps={{
            classes: {
              input: classes.textFieldInput
            },
          }}
          InputLabelProps={{
            className: classes.textFieldFormLabel
          }}
          helperText={errors.startBlock}
        />

        <TextField
          id="endTime"
          label="End Time (optional)"
          className={classes.textField}
          value={values.endTime}
          onChange={handleChange}
          margin="normal"
          fullWidth
          error={!!errors.endTime}
          InputProps={{
            classes: {
              input: classes.textFieldInput
            },
          }}
          InputLabelProps={{
            className: classes.textFieldFormLabel
          }}
          helperText={errors.endTime}
        />


        {!isSubmitting ?
         <Button type="submit" variant="extendedFab" aria-label="add" className={classes.button}>Submit</Button> :
         <CircularProgress style={{ margin: '10px 10px 10px 50%' }} />
        }
      </form>
    </CardContent>
  </Card>
)

const StyledForm = withStyles(styles)(InnerForm);
const AddPoll = withFormik({
  mapPropsToValues: props => ({ ballots: JSON.stringify({
    title: "What should we build next?",
    description: `<p>Status Incubate exists to help early-stage startups reinvent the Web. Your vote help us decide where to invest.</p>
                    <p><a href="#">Learn more about Status Incubate</a>`,
    ballots: [
      {
        title: "Option1",
        subtitle: "Subtitle Option1",
        content: "Text About Option1"
      },
      {
        title: "Option2",
        subtitle: "Subtitle Option2",
        content: "Text About Option2"
      },
      {
        title: "Option3",
        subtitle: "Subtitle Option3",
        content: "Text About Option3"
      }
    ]
  }), startBlock: '', endTime: ''}),
  validate(values, props){


    return web3.eth.getBlockNumber()
      .then(currentBlock => {
        const errors = {};
        let { ballots, startBlock, endTime } = values;
        
        let pollDetails;
        try {
          pollDetails = JSON.parse(ballots);

          const details = Object.keys(pollDetails);
          const validAttributes = ['title', 'description', 'ballots'];
          if(details.filter(o1 => validAttributes.filter(o2 => o2 === o1).length === 0).length > 0){
            errors.ballots = "Only 'description', 'ballots' are allowed" + (i+1);
          }

          if(pollDetails.title.toString().trim() == ""){
            errors.ballots = "Title is required";
          }

          const ballotOptions = pollDetails.ballots;

          if(!Array.isArray(ballotOptions)){
            errors.ballots = "JSON must be an array of objects";
          } else if(ballotOptions.length == 0) {
            errors.ballots = "At least one ballot is required";
          } else {
            const validOptions = ['title', 'subtitle', 'content'];

            for(let i = 0; i < ballotOptions.length; i++){
              if(!ballotOptions[i].title){
                errors.ballots = "Ballot " + (i+1) + " is missing a title";
                break;
              }

              const userOptions = Object.keys(ballotOptions[i]);
              if(userOptions.filter(o1 => validOptions.filter(o2 => o2 === o1).length === 0).length > 0){
                errors.ballots = "Only 'title', 'subtitle', and 'content' are allowed in ballot " + (i+1);
              }
            }
          }
        } catch(err){
          console.log(err);
          if(ballots.trim() !== "")
            errors.ballots = "Invalid JSON";
        }

        let sBlock;
        if(startBlock != ""){
          var parsed = parseInt(startBlock, 10);
          if (isNaN(parsed)) {
            errors.startBlock = "Invalid Start Block"
          } else {
            sBlock = parsed;

            if(sBlock < currentBlock){
              errors.startBlock = "Block number is in the past. Recommended: " + (currentBlock + 60) + " (will be mined in ~10min)"
            }
          }
        }

        let eBlock;
        if(endTime != ""){
          var parsed = parseInt(endTime, 10);
          if (isNaN(parsed)) {
            errors.endTime = "Invalid End Time"
          } else {
            eBlock = parsed;
          }

          if(eBlock < ((new Date()).getTime() / 1000)){
            errors.endTime = "End time must occur in the future"
          }
        }

        if (Object.keys(errors).length) {
          throw errors;
        }

    });
  },

  async handleSubmit(values, { setSubmitting, setErrors, props, resetForm }) {
    const { ballots, startBlock, endTime } = values;
    const { utils: { toHex } } = window.web3;

    const addPollCustomBlock = PollManager.methods["addPoll(uint256,uint256,bytes,uint8)"];
    const addPollOnlyEndTime = PollManager.methods["addPoll(uint256,bytes,uint8)"];

    let date = new Date();
    date.setDate(date.getDate() + 90);
    const d90 = date.getTime() / 1000;

    const endTime90 = parseInt(endTime ? endTime : d90);
    const jsonObj = JSON.parse(ballots);
    const ipfsHash = await EmbarkJS.Storage.saveText(ballots);
    const encodedDesc = toHex(ipfsHash);

    let toSend;
    if(startBlock){
      toSend = addPollCustomBlock(startBlock, endTime90, encodedDesc, jsonObj.ballots.length || 0);
    } else {
      toSend = addPollOnlyEndTime(endTime90, encodedDesc, jsonObj.ballots.length || 0);
    }
    setSubmitting(true);

    try {
      const gasEstimated = await toSend.estimateGas();
      console.log("addPoll gas estimated: "+ gasEstimated);
    
      EmbarkJS.Utils.secureSend(web3, toSend, {gas: gasEstimated + 100000, from: web3.eth.defaultAccount}, false, (err, res) => {
        console.log('sucess:', res);
        resetForm();
        props.getPolls();
        setSubmitting(false);
        props.togglePoll();
      });

    } catch (err) {
      console.log('fail:', err);
      setErrors({ 'description': err.message.split('Error:').pop().trim() });
    }

    setSubmitting(false);
  }
})(StyledForm)

export default AddPoll;
