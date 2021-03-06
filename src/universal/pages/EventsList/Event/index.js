import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Card, { CardContent, CardActions } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Collapse from 'material-ui/transitions/Collapse';
import IconButton from 'material-ui/IconButton';
import lightGreen from 'material-ui/colors/lightGreen';
import pink from 'material-ui/colors/pink';
import { CircularProgress } from 'material-ui/Progress';

import DoneIcon from 'material-ui-icons/Done';
import DoneAllIcon from 'material-ui-icons/DoneAll';
import UndoIcon from 'material-ui-icons/Undo';

import api from 'Universal/utils/api';
import dateUtil from 'Universal/utils/date';
import { updateEventAction } from 'Universal/actions/events';
import { showSnackbarAction } from 'Universal/actions/snackbar';

import StatusBar from './StatusBar';
import Table from './Table';

import styles from './index.css';

const jsStyles = {
    incompleteTable: {
        marginBottom: 24
    }
};

class Event extends Component {
    static propTypes = {
        calendarId: PropTypes.string.isRequired,
        details: PropTypes.object.isRequired,
        showSnackbar: PropTypes.func.isRequired,
        updateEvent: PropTypes.func.isRequired,
        date: PropTypes.string.isRequired,
        view: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            showCompleted: this.props.view === 'COMPLETED' || false,
            processingDoneAll: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.view === 'COMPLETED') {
            this.setState({
                showCompleted: true
            });
        }
    }

    handleExpandClick = () => {
        this.setState({
            showCompleted: !this.state.showCompleted
        });
    };

    handleDoneAll = () => {
        const { calendarId, details: { id } } = this.props;

        this.setState({
            processingDoneAll: true
        });

        return api.put({
            path: `/api/calendars/${calendarId}/events/${id}`,
            query: {
                op: 'DONE'
            }
        }).then((newTasks) => {
            this.props.updateEvent({
                id,
                date: this.props.date,
                completed: newTasks.completed,
                incomplete: newTasks.incomplete
            });
            this.props.showSnackbar({
                message: 'Marked all as completed.'
            });
        }, () => {
            this.props.showSnackbar({
                message: 'Could not mark as completed.'
            });
        }).then(() => {
            this.setState({
                processingDoneAll: false
            });
        });
    };

    handleUndo = (event, index) => {
        const { calendarId, details: { id } } = this.props;

        return api.put({
            path: `/api/calendars/${calendarId}/events/${id}/tasks`,
            query: {
                op: 'UNDO'
            }
        }, {
            task: this.props.details.completed[index]
        }).then((newTasks) => {
            this.props.updateEvent({
                id,
                date: this.props.date,
                completed: newTasks.completed,
                incomplete: newTasks.incomplete
            });
            this.props.showSnackbar({
                message: 'Marked as incomplete.'
            });
        }, () => {
            this.props.showSnackbar({
                message: 'Could not mark as incomplete.'
            });
        });
    };

    handleDone = (event, index) => {
        const { calendarId, details: { id } } = this.props;

        return api.put({
            path: `/api/calendars/${calendarId}/events/${id}/tasks`,
            query: {
                op: 'DONE'
            }
        }, {
            task: this.props.details.incomplete[index]
        }).then((newTasks) => {
            this.props.updateEvent({
                id,
                date: this.props.date,
                completed: newTasks.completed,
                incomplete: newTasks.incomplete
            });
            this.props.showSnackbar({
                message: 'Marked as completed.'
            });
        }, () => {
            this.props.showSnackbar({
                message: 'Could not mark as completed.'
            });
        });
    };

    render() {
        const {
            details: {
                created,
                completed,
                incomplete,
                startDate,
                endDate,
                summary
            },
            view
        } = this.props;

        const nCompleted = completed.length;
        const nIncomplete = incomplete.length;
        const expanded = Boolean(nCompleted) && this.state.showCompleted;

        return (
            <Card className={styles.card}>
                <StatusBar nCompleted={nCompleted} nIncomplete={nIncomplete} />

                <CardContent>
                    <div className={styles.headerContainer}>
                        <div className={styles.headerText}>
                            <Typography type="headline" component="h4">
                                { summary }
                            </Typography>
                            <Typography type="caption">
                                Duration: { dateUtil.displayStartEndDates(startDate, endDate) },

                                &nbsp;

                                Created: { created }
                            </Typography>
                        </div>

                        <div className={styles.headerIcon}>
                            {
                                nIncomplete ? (
                                    <IconButton
                                        aria-label="Done All"
                                        onClick={this.handleDoneAll}>
                                        <DoneAllIcon />
                                    </IconButton>
                                ) : null
                            }

                            {
                                this.state.processingDoneAll &&
                                    <CircularProgress
                                        size={50}
                                        className={styles.progress}
                                    />
                            }
                        </div>
                    </div>

                    <Typography style={{ margin: '10px 0 20px 0' }}>
                        Total: {nIncomplete + nCompleted}, Remaining: {incomplete.length}
                    </Typography>

                    {
                        view !== 'COMPLETED' ? (
                            nIncomplete ? (
                                <Table
                                    title="INCOMPLETE"
                                    backgroundColor={pink['50']}
                                    list={incomplete}
                                    actionIcon={<DoneIcon />}
                                    onActionClick={this.handleDone}
                                    style={expanded ? jsStyles.incompleteTable : {}}
                                />
                            ) : (
                                <Typography
                                    type="subheading"
                                    align="center"
                                    style={expanded ? jsStyles.incompleteTable : {}}
                                >
                                    All tasks completed.
                                </Typography>
                            )
                        ) : null
                    }

                    <Collapse in={expanded}
                        transitionDuration="auto" unmountOnExit>
                        <Table
                            title="COMPLETED"
                            backgroundColor={lightGreen['50']}
                            list={completed}
                            actionIcon={<UndoIcon />}
                            onActionClick={this.handleUndo}
                        />
                    </Collapse>
                </CardContent>

                {
                    view !== 'COMPLETED' && nCompleted ? (
                        <CardActions classes={{
                            root: styles.cardActionContainer
                        }}>
                            <Button dense color="primary" onClick={this.handleExpandClick}>
                                { this.state.showCompleted ?
                                    'Hide completed' :
                                    'Show completed' }
                            </Button>
                        </CardActions>
                    ) : null
                }
            </Card>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateEvent: updateEventAction,
        showSnackbar: showSnackbarAction
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(Event);
