import Pikaday from 'pikaday';
import React from 'react';


class DatePicker extends React.Component {
  componentDidMount() {
    const picker = new Pikaday({field: document.getElementById(this.props.fieldId)})
  }

  render() {
    return (
      <input type="text" id={this.props.fieldId} defaultValue={this.props.value} onBlur={this.props.handler} />
    )
  }
}

export default DatePicker;