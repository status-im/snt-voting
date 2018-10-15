import React, { Fragment } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PollManager from 'Embark/contracts/PollManager';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import rlp from 'rlp';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import { withFormik } from 'formik';

const oneDayinBlocks = 5760;

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
          id="title"
          label="Enter your proposal title"
          className={classes.textField}
          value={values.title}
          onChange={handleChange}
          margin="normal"
          fullWidth
          error={!!errors.title}
          InputProps={{
            classes: {
              input: classes.textFieldInput
            },
          }}
          InputLabelProps={{
            className: classes.textFieldFormLabel
          }}
          helperText={errors.title}
        />

        <TextField
          id="ballots"
          label="Enter the ballots array ([{&quot;title&quot;:&quot;&quot;, &quot;subtitle&quot;:&quot;&quot;, &quot;content&quot;:&quot;&quot;}]) (optional)"
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
          id="endBlock"
          label="End Block (optional)"
          className={classes.textField}
          value={values.endBlock}
          onChange={handleChange}
          margin="normal"
          fullWidth
          error={!!errors.endBlock}
          InputProps={{
            classes: {
              input: classes.textFieldInput
            },
          }}
          InputLabelProps={{
            className: classes.textFieldFormLabel
          }}
          helperText={errors.endBlock}
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
  mapPropsToValues: props => ({ title: '', ballots: '', startBlock: '', endBlock: ''}),
  validate(values, props){


    return web3.eth.getBlockNumber()
      .then(currentBlock => {
        const errors = {};
        const { title, ballots, startBlock, endBlock } = values;
        
        if(title.toString().trim() === "") {
          errors.title = "Required";
        }

        let ballotOptions;
        try {
          ballotOptions = JSON.parse(ballots);

          if(!Array.isArray(ballotOptions)){
            errors.ballots = "JSON must be an array of objects";
          } else if(ballotOptions.length == 1) {
            errors.ballots = "A minimum of 2 options is required if using multiple options";
          } else {
            const validOptions = ['title', 'subtitle', 'content'];

            for(let i = 0; i < ballotOptions.length; i++){
              if(!ballotOptions[i].title){
                errors.ballots = "Option " + (i+1) + " is missing a title";
                break;
              }

              const userOptions = Object.keys(ballotOptions[i]);
              if(userOptions.filter(o1 => validOptions.filter(o2 => o2 === o1).length === 0).length > 0){
                errors.ballots = "Only 'title', 'subtitle', and 'content' are allowed in option " + (i+1);
              }
            }
          }
        } catch(err){
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
        if(endBlock != ""){
          var parsed = parseInt(endBlock, 10);
          if (isNaN(parsed)) {
            errors.endBlock = "Invalid End Block"
          } else {
            eBlock = parsed;
          }

          if(eBlock < sBlock){
            errors.endBlock = "End block must occur after start block"
          }
        }

        if (Object.keys(errors).length) {
          throw errors;
        }

    });
  },

  async handleSubmit(values, { setSubmitting, setErrors, props, resetForm }) {
    const { title, ballots, startBlock, endBlock } = values;
    const { eth: { getBlockNumber }, utils: { toHex } } = window.web3;

    const addPollCustomBlock = PollManager.methods["addPoll(uint256,uint256,bytes,uint8)"];
    const addPollOnlyEndBlock = PollManager.methods["addPoll(uint256,bytes,uint8)"];

    const currentBlock = await getBlockNumber();
    const endTime = endBlock ? endBlock : ((startBlock ? startBlock : currentBlock) + (oneDayinBlocks * 90));
    const options = JSON.parse(ballots);
    const ipfsHash = await EmbarkJS.Storage.saveText(ballots);


    let toSend;
    if(startBlock){
      toSend = addPollCustomBlock(startBlock, endTime, toHex(ipfsHash), options.length || 0);
    } else {
      toSend = addPollOnlyEndBlock(endTime, toHex(ipfsHash), options.length || 0);
    }
    setSubmitting(true);

    try {
      const gasEstimated = await toSend.estimateGas();
      console.log("addPoll gas estimated: "+ gasEstimated);
      const res = await toSend.send({gas: gasEstimated + 100000});
      console.log('sucess:', res);
      resetForm();
      props.getPolls();
      setSubmitting(false);
      props.togglePoll();

    } catch (err) {
      console.log('fail:', err);
      setErrors({ 'description': err.message.split('Error:').pop().trim() });
    }

    setSubmitting(false);
  }
})(StyledForm)

export default AddPoll;
