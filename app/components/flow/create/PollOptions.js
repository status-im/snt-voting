import React, {Component, Fragment} from 'react';
import { withRouter } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';


const SortableItem = SortableElement(({value}) =>
  <li>{value.title}</li>
);

const SortableList = SortableContainer(({items}) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </ul>
  );
});

class PollOptions extends Component {

    state = {
        error: '',
        open: false,
        options: [],
        optionTitle: '',
        optionContent: ''
    }

    onSortEnd = ({oldIndex, newIndex}) => {
        this.setState({
          options: arrayMove(this.state.options, oldIndex, newIndex),
        });
      };

    handleChange = name => event => {
        this.setState({error: ''});
        const state = {};
        state[name] = event.target.value;
        this.setState(state);
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    addOption = () => {
        const options = this.state.options;
        options.push({title: this.state.optionTitle, content: this.state.optionContent});
        this.setState({ open: false, optionTitle: '', optionContent: '' });
    }
    
    handleClose = () => {
        this.setState({ open: false });
    }

    continue = () => {
        const {title} = this.state;
        const {history} = this.props;

        if(title.trim() != ''){
            this.props.assignToPoll({title});
            history.push('/poll/description');
        } else {
            this.setState({error: "Required"})
        }
    }

    render() {
        return <Fragment>
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <Typography variant="body1">Add options to the poll</Typography>
            <Button onClick={this.handleClickOpen}>Add option</Button>


            <SortableList items={this.state.options} onSortEnd={this.onSortEnd} />

        </div>
        <div className="buttonNav">
            <Button onClick={this.continue}>Next</Button>
        </div>
        <Dialog
        fullScreen={true}
        open={this.state.open}
        onClose={this.handleClose}
        className="pollCreation"
        >
            <DialogActions>
            <Button onClick={this.handleClose} color="primary">
                X
            </Button>
            <Button onClick={this.addOption} color="primary">
                Save
            </Button>
            </DialogActions>
            <DialogTitle id="responsive-dialog-title">Add new poll option</DialogTitle>
            <DialogContent>
                <TextField
                    label="Option title"
                    autoFocus
                    error={false}
                    className="inputTxt"
                    fullWidth
                    margin="normal"
                    value={this.state.optionTitle}
                    onChange={this.handleChange('optionTitle')}
                    InputLabelProps={{
                    shrink: true,
                    }}      
                />
                <TextField
                    id="standard-multiline-flexible"
                    label="Poll Description"
                    multiline
                    fullWidth
                    autoFocus
                    className="inputTxt"
                    margin="normal"
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
            </DialogContent>
        </Dialog>
        </Fragment>;
    }
}

export default (withRouter(PollOptions));
