import Pikaday from 'pikaday'
import React from 'react'
import PropTypes from 'prop-types'

class DatePicker extends React.Component {
  static get propTypes() {
    return {
      fieldId: PropTypes.string,
      inputRef: PropTypes.object,
      value: PropTypes.string,
      handler: PropTypes.func
    }
  }

  componentDidMount() {
    new Pikaday({field: document.getElementById(this.props.fieldId)})
  }

  render() {
    return (
      <input type="text" ref={this.props.inputRef} id={this.props.fieldId} defaultValue={this.props.value} onBlur={this.props.handler} />
    )
  }
}

export default DatePicker
