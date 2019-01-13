import React from 'react'
import Graph from './graph.jsx'

class GraphList extends React.Component {
  render() {
    return (
      <div>
        {this.props.graphs.map((graph) => {
          return (
            <Graph key={graph.id} graph={graph} />
          )
        })}
      </div>
    )
  }
}

export default GraphList