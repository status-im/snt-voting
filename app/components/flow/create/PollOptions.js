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


const SortableItem = SortableElement(({value, removeOption, editOption}) =>
    <div className="pollOption" onDoubleClick={editOption}>
        <Typography variant="display1">{value.title}</Typography>
        <Typography variant="body2">{value.content}</Typography>
        <Button onClick={removeOption} className="delete">X</Button>
    </div>
);

const SortableList = SortableContainer(({items, removeOption, editOption}) => {
  return (
    <div>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} editOption={editOption(index)} removeOption={removeOption(index)} />
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

            this.setState({ open: false, edit: null, optionTitle: '', optionContent: '', error: '' });
        }
    }
    
    handleClose = () => {
        this.setState({ open: false, edit: null, optionContent: '', optionTitle: '' });
    }

    removeOption = i => () => {
        this.setState({options: this.state.options.splice(i, 1)});
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
        const {title} = this.state;
        const {history} = this.props;

        if(title.trim() != ''){
            this.props.assignToPoll({title});
            history.push('/poll/description');
        } else {
            this.setState({error: "Required"})
        }
    }

    componentDidMount(){
        if(!this.props.poll.description){
            const {history} = this.props;
            history.push('/poll/title');
        }
    }

    render() {
        return <Fragment>
        <LinearProgress variant="determinate" value={57} />
        <div className="section pollCreation">
            <Typography variant="headline">Create a Poll</Typography>
            <Typography variant="body1" style={{marginTop: '20px'}}>Add options to the poll</Typography>
            <a onClick={this.handleClickOpen} className="addOption"><img src="../images/plus-button.svg" width="40" />Add option</a>
            <SortableList lockAxis={"y"} distance={10} items={this.state.options} editOption={this.editOption} removeOption={this.removeOption} onSortEnd={this.onSortEnd} />

        </div>
        <div className="buttonNav">
            <Button onClick={this.continue} disabled={this.state.options.length == 0}>Next</Button>
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
                    label="Poll Description"
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
