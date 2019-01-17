import Pikaday from 'pikaday'
import React from 'react'
import PropTypes from 'prop-types'

class DatePicker extends React.Component {
  static get propTypes() {
    return {
      fieldId: PropTypes.string,
      value: PropTypes.string,
      handler: PropTypes.func
    }
  }

  componentDidMount() {
    Pikaday({field: document.getElementById(this.props.fieldId)})
  }

  render() {
    return (
      <input type="text" id={this.props.fieldId} defaultValue={this.props.value} onBlur={this.props.handler} />
    )
  }
}

export default DatePicker