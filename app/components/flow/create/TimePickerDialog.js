import React, { Component } from 'react'
import Picker from 'react-mobile-picker';
import { timeGroups } from '../../standard/constants';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';


export default class TimePickerDialog extends Component {


  render() {
    const { timeDialog, handleTimeChange, closeTimeDialog, timeValues } = this.props;
    return (
      <Dialog onClose={closeTimeDialog} open={timeDialog} >
        <div className="time-picker-title">Set end time</div>
        <div>
          <Picker
            optionGroups={timeGroups}
            valueGroups={timeValues}
            height="160"
            onChange={handleTimeChange} />
          <div className="time-picker-save" >
            <Button onClick={closeTimeDialog} color="primary">
              SAVE   
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }
}
