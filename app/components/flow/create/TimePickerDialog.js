import React, { Component } from 'react'
import Picker from 'react-mobile-picker';
import { timeGroups } from '../../standard/constants';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';


export default class TimePickerDialog extends Component {


  render() {
    const { timeDialog, handleTimeChange, closeTimeDialog, timeValues } = this.props;
    return (
      <Dialog onClose={closeTimeDialog} open={timeDialog}>
        <DialogTitle id="time-dialog-title">End Time</DialogTitle>
        <div>
          <Picker
            optionGroups={timeGroups}
            valueGroups={timeValues}
            onChange={handleTimeChange} />
          <Button onClick={closeTimeDialog} color="primary">
            SAVE   
          </Button>
        </div>
      </Dialog>
    )
  }
}
