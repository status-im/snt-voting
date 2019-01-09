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
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const SortableItem = SortableElement(({value, editOption}) =>
    <div className="pollOption" onDoubleClick={editOption}>
        <Typography variant="display1">{value.title}</Typography>
        <Typography variant="body2">{value.content}</Typography>
    </div>
);

const SortableList = SortableContainer(({items, removeOption, editOption}) => {
  return (
    <div>
      {items.reverse().map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} editOption={editOption(index)} />
      ))}
    </div>
  );
});

class PollOptions extends Component {

    state = {
        error: '',
        open: false,
        options: [],
        optionTitle: '',
        optionContent: '',
        edit: null
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
        if(this.state.optionTitle.trim() == ''){
            this.setState({error: 'Required'});
        } else {
            const options = this.state.options;

            if(this.state.edit !== null){
                options[this.state.edit] = {title: this.state.optionTitle, content: this.state.optionContent};
            } else {
                options.push({title: this.state.optionTitle, content: this.state.optionContent});
            }
            this.props.assignToPoll({options});

            this.setState({ open: false, edit: null, optionTitle: '', optionContent: '', error: '' });
        }
    }
    
    handleClose = () => {
        this.setState({ open: false, edit: null, optionContent: '', optionTitle: '' });
    }

    removeOption = i => () => {
        if(i != null){
            if(confirm("Are you sure you want to delete this option?")){
                this.state.options.splice(i, 1);
                this.setState({options: this.state.options});
                this.handleClose();
            }
        }        
    }

    editOption = i => () => {
        const state = {};
        state.open = true;
        state.optionContent = this.state.options[i].content;
        state.optionTitle = this.state.options[i].title;
        state.edit = i;
        this.setState(state);
    }

    continue = () => {
        const {options} = this.state;
        const {history} = this.props;

        if(options.length != 0){
            this.props.assignToPoll({options});
            history.push('/poll/schedule');
        } else {
            this.setState({error: "Required"})
        }
    }

    componentDidMount(){
        if(this.props.poll.options !== undefined){
            this.setState({options: this.props.poll.options});
        }

        if(!this.props.poll.description){
            const {history} = this.props;
            history.push('/');
        }
    }

    render() {
        return <Fragment>
        <LinearProgress variant="determinate" value={57} />
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <Typography variant="body1" style={{marginTop: '20px'}}>Add options to the poll</Typography>
            <a onClick={this.handleClickOpen} className="addOption"><img src="images/plus-button.svg" width="40" />Add option</a>
            <SortableList lockAxis={"y"} pressDelay={200} items={this.state.options} editOption={this.editOption} removeOption={this.removeOption} onSortEnd={this.onSortEnd} />

        </div>
        <div className="buttonNav">
            <Button onClick={this.continue} disabled={this.state.options.length == 0}>Next</Button>
        </div>
        <Dialog
        fullScreen={true}
        open={this.state.open}
        onClose={this.handleClose}
        className="pollCreation"
        TransitionComponent={Transition}
        >
            <DialogActions>
            <Button onClick={this.handleClose} color="primary" style={{position:"absolute", left: "0px", align:"left"}}>
                <img src="images/x-close.svg" />
            </Button>
            { this.state.edit !== null && <Button onClick={this.removeOption(this.state.edit)}>
                <img src="images/trash-icon.svg" />
            </Button> }
            <Button onClick={this.addOption} color="primary" style={{fontSize:"15px", lineHeight:"22px"}} disabled={this.state.optionTitle.trim().length == 0 || this.state.optionContent.length == 0}>
                Save
            </Button>
            </DialogActions>
            <DialogTitle id="responsive-dialog-title">{ this.state.edit !== null ? "Edit poll option" : "Add new poll option" }</DialogTitle>
            <DialogContent>
                <TextField
                    label="Option title"
                    autoFocus
                    error={this.state.error != ''}
                    className="inputTxt"
                    fullWidth
                    margin="normal"
                    value={this.state.optionTitle}
                    onChange={this.handleChange('optionTitle')}
                    InputLabelProps={{
                    shrink: true,
                    }}      
                />
                {this.state.error && <FormHelperText className="errorText">{this.state.error}</FormHelperText>}

                <TextField
                    id="standard-multiline-flexible"
                    label="Option description"
                    multiline
                    fullWidth
                    className="inputTxt"
                    margin="normal"
                    value={this.state.optionContent}
                    onChange={this.handleChange('optionContent')}
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
