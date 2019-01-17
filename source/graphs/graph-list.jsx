import React from 'react'
import PropTypes from 'prop-types'
import Graph from './graph.jsx'

class GraphList extends React.Component {
  static get propTypes() {
    return {
      graphs: PropTypes.array
    }
  }

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