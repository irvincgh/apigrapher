import './styles/base.scss'

import GraphForm from './forms/graph-form.jsx'
import GraphList from './graphs/graph-list.jsx'
import React from 'react'
import ReactDOM from 'react-dom'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {graphs: [], currentGraphId: 1}
  }

  render() {
    return (
      <div>
        <GraphList graphs={this.state.graphs} />
        <GraphForm handleSubmit={this.createGraph.bind(this)} />
      </div>
    )
  }

  createGraph(dataSelections, start, end) {
    const graphs = this.state.graphs
    const newGraph = {
      id: this.state.currentGraphId,
      dataSelections: dataSelections,
      start: start,
      end: end
    }

    if (dataSelections.length !== 2) { newGraph.error = 'Please select two different data sources to graph.' }
    graphs.push(newGraph)
    this.setState({graphs: graphs, currentGraphId: newGraph.id + 1})
  }
}

ReactDOM.render(
  (
    <App />
  ),
  document.getElementById('content')
)
