import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Menu, { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';

import styles from './index.css';

class RFDropdown extends Component {
    static propTypes = {
        label: PropTypes.string,
        input: PropTypes.object,
        meta: PropTypes.object,
        source: PropTypes.array.isRequired,
        renderOption: PropTypes.func
    };

    static defaultProps = {
        meta: {},
        input: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null,
            open: false,
            value: this.props.input.value ||
                (this.props.source[0] && this.props.source[0].value)
        };
    }

    handleLabelClick = (event) => {
        event.preventDefault();

        // Need this to re-focus the TextField to preserve tabindex.
        this.textInput = event.target;

        if (!this.props.source.length) {
            return;
        }

        this.setState({
            anchorEl: event.target,
            open: true
        });
    }

    handleRequestClose = (value) => {
        if (typeof value === 'string') {
            this.props.input.onChange(value);
        }

        this.setState({
            open: false
        });

        this.textInput.focus();
    }

    render() {
        const {
            label,
            input: {
                value
            },
            source,
            meta,
            renderOption,
            ...custom
        } = this.props;

        let selectedLabel;
        for (let i = source.length - 1; i >= 0; --i) {
            if (source[i].value === value) {
                selectedLabel = source[i].label;
                break;
            }
        }

        return (
            (
                <div className={styles.root}>
                    {
                        <TextField
                            onClick={this.handleLabelClick}
                            onKeyPress={this.handleLabelClick}
                            label={label}
                            value={selectedLabel || 'Select'}
                            fullWidth={true}
                            className={styles.input}
                            disabled={!source.length}
                            {...custom}
                        />
                    }
                    <Menu
                        anchorEl={this.state.anchorEl}
                        open={this.state.open}
                        onRequestClose={this.handleRequestClose}
                    >
                        {
                            source.map((option, index) => (
                                <MenuItem
                                    key={index}
                                    selected={option.value === value}
                                    onClick={() => this.handleRequestClose(option.value)}
                                >
                                    {
                                        renderOption ?
                                            renderOption(option) :
                                            option.label
                                    }
                                </MenuItem>
                            ))
                        }
                    </Menu>
                </div>
            )
        );
    }
}

export default RFDropdown;
