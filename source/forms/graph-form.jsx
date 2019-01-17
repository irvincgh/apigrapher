import React from 'react'
import DatePicker from './date-picker.jsx'
import moment from 'moment'

const DEFAULT_SPREAD = 31
const DATE_FORMAT = 'YYYY-MM-DD'

class GraphForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      start: moment().subtract(DEFAULT_SPREAD, 'days').format(DATE_FORMAT),
      end: moment().format(DATE_FORMAT)
    }
  }

  handleSubmit(event) {
    this.props.handleSubmit(this.state.start, this.state.end)
    event.preventDefault()
  }

  handleStartChange(event) {
    const options = this.state
    options.start = event.target.value
    this.setState(options)
  }

  handleEndChange(event) {
    const options = this.state
    options.end = event.target.value
    this.setState(options)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <span>Start: </span><DatePicker fieldId="start-at" value={this.state.start} handler={this.handleStartChange.bind(this)} />
        <span>End: </span><DatePicker fieldId="end-at" value={this.state.end} handler={this.handleEndChange.bind(this)} />
        <button>Graph!</button>
      </form>
    )
  }
}

export default GraphForm