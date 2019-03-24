import React from 'react'
import PropTypes from 'prop-types'
import DatePicker from './date-picker.jsx'
import moment from 'moment'
import settings from '../../settings.json'

const DEFAULT_SPREAD = 31
const DATE_FORMAT = 'YYYY-MM-DD'

class GraphForm extends React.Component {
  static get propTypes() {
    return {
      handleSubmit: PropTypes.func
    }
  }

  constructor(props) {
    super(props)

    this.data0Ref = React.createRef(),
    this.data1Ref = React.createRef(),
    this.startRef = React.createRef(),
    this.endRef = React.createRef()

    this.state = {
      dataSelections: [],
      start: moment().subtract(DEFAULT_SPREAD, 'days').format(DATE_FORMAT),
      end: moment().format(DATE_FORMAT)
    }
  }

  getDataOptions(inputIndex, selections) {
    const options = [<option key={`${inputIndex}-None`} value=''></option>]
    for (const sourceKey in settings.external) {
      const source = settings.external[sourceKey]
      const otherIndex = inputIndex === 0 ? 1 : 0
      const disabled = selections[otherIndex] === sourceKey ? 'disabled' : ''
      options.push(<option key={`${inputIndex}-${sourceKey}`} disabled={disabled} value={sourceKey}>{source.name}</option>)
    }
    return options
  }

  handleSubmit(event) {
    const isoStart = new Date(`${this.state.start}T00:00:00`).toISOString()
    const isoEnd = new Date(`${this.state.end}T23:59:59`).toISOString()
    this.props.handleSubmit(this.state.dataSelections, isoStart, isoEnd)
    event.preventDefault()
  }

  handleFormChange() {
    const newState = {
      dataSelections: [this.data0Ref.current.value, this.data1Ref.current.value],
      start: this.startRef.current.value,
      end: this.endRef.current.value
    }
    this.setState(newState)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <span>Source A: </span>
        <select id='data-source-a' ref={this.data0Ref} onChange={this.handleFormChange.bind(this)}>{this.getDataOptions(0, this.state.dataSelections)}</select>
        <span>Source B: </span>
        <select id='data-source-b' ref={this.data1Ref} onChange={this.handleFormChange.bind(this)}>{this.getDataOptions(1, this.state.dataSelections)}</select>
        <span>Start: </span>
        <DatePicker fieldId='start-at' inputRef={this.startRef} value={this.state.start} handler={this.handleFormChange.bind(this)} />
        <span>End: </span>
        <DatePicker fieldId='end-at' inputRef={this.endRef} value={this.state.end} handler={this.handleFormChange.bind(this)} />

        <button>Go!</button>
      </form>
    )
  }
}

export default GraphForm
