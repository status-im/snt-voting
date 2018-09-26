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
          label="Enter the proposal options, separated by '|' (optional)"
          className={classes.textField}
          value={values.ballots}
          onChange={handleChange}
          margin="normal"
          fullWidth
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
  mapPropsToValues: props => ({ title: '', ballots: ''}),
  validate(values, props){
    const errors = {};
    const { title, ballots } = values;
    const ballotOptions = ballots.toString().split("|")
    if(title.toString().trim() === "") {
      errors.title = "Required";
    }
    if(ballotOptions.filter(n => n).length == 1) {
      errors.ballots = "A minimum of 2 options is required if using multiple options";
    }

    return errors;
  },

  async handleSubmit(values, { setSubmitting, setErrors, props, resetForm }) {
    const { title, ballots } = values;
    const { eth: { getBlockNumber } } = window.web3;
    const addPoll = PollManager.methods["addPoll(uint256,bytes,uint8)"];
    const currentBlock = await getBlockNumber();
    const endTime = currentBlock + (oneDayinBlocks * 90);
    const options = ballots.split("|");
    const encodedDesc = "0x" + rlp.encode([title, options]).toString('hex');
    
    const toSend = addPoll(endTime, encodedDesc, options.length || 0);

    setSubmitting(true);

    toSend.estimateGas()
          .then(gasEstimated => {
            console.log("addPoll gas estimated: "+gasEstimated);
            return toSend.send({gas: gasEstimated + 100000});
          })
          .then(res => {
            console.log('sucess:', res);
            resetForm();
            props.getPolls();
            setSubmitting(false);
            props.togglePoll();
          })
          .catch(res => {
            console.log('fail:', res);
            setErrors({ 'description': res.message.split('Error:').pop().trim() });
          })
          .finally(() => {
            setSubmitting(false);
          });
  }
})(StyledForm)

export default AddPoll;
