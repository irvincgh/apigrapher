import React from 'react'
import PropTypes from 'prop-types'
import settings from '../../settings.json'
import {MARGINS, DEFAULT_HEIGHT, DEFAULT_WIDTH, Grapher} from './grapher.jsx'

class Graph extends React.Component {
  static get propTypes() {
    return {
      graph: PropTypes.object
    }
  }

  componentDidMount() {
    this.generateGraph()
  }

  render() {
    return (
      <div id={`graph-wrapper-${this.props.graph.id}`} className='graph'>
        <svg height={DEFAULT_HEIGHT} width={DEFAULT_WIDTH} id={`graph-${this.props.graph.id}`}>
          <svg>
            <g id={`points-${this.props.graph.id}`} transform={`translate(${MARGINS.left}, ${MARGINS.top})`}></g>
            <g id={`lines-${this.props.graph.id}`} transform={`translate(${MARGINS.left}, ${MARGINS.top})`}></g>
            <g id={`labels-${this.props.graph.id}`} transform={`translate(${MARGINS.left}, ${MARGINS.top})`}></g>
            <g id={`bars-${this.props.graph.id}`} transform={`translate(${MARGINS.left}, ${MARGINS.top})`}></g>
          </svg>
          <svg id={`graph-loading-${this.props.graph.id}`}>
            <rect id={`graph-loading-box-${this.props.graph.id}`} width='100%' height='100%' style={{'fill':'rgb(255,255,255)'}} />
            <text id={`graph-loading-text-${this.props.graph.id}`} x='50%' y='50%' textAnchor='middle'>Loading...</text>
          </svg>
        </svg>
      </div>
    )
  }

  getEarthquakes(graph) {
    return this.makeRequest('/api/earthquakes', graph.start, graph.end).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((quake) => {return {date: new Date(quake.date), value: quake.value}})
      },
      (error) => {
        throw error
      }
    )
  }

  getHolidays(graph) {
    return this.makeRequest('/api/holidays', graph.start, graph.end).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((holiday) => {return {date: new Date(holiday.date), value: holiday.value}})
      },
      (error) => {
        throw error
      }
    )
  }

  getRandoms(graph) {
    return this.makeRequest('/api/randomness', graph.start, graph.end).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((item) => {return {date: new Date(item.date), value: item.value}})
      },
      (error) => {
        throw error
      }
    )
  }

  getLaunches(graph) {
    return this.makeRequest('/api/launches', graph.start, graph.end).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((launch) => {return {date: new Date(launch.date), value: launch.value}})
      },
      (error) => {
        throw error
      }
    )
  }

  getBikeCrimes(graph) {
    return this.makeRequest('/api/bikecrimes', graph.start, graph.end).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((crime) => {return {date: new Date(crime.date), value: crime.value}})
      },
      (error) => {
        throw error
      }
    )
  }

  catchResponse(response) {
    return response.json().then((contents) => {
      if (response.status === 200) {
        return Promise.resolve(contents)
      } else if (contents.errors) {
        let errors = []
        for (const errorProp in contents.errors) {
          errors = errors.concat(contents.errors[errorProp])
        }
        let errorString = errors.reduce((output, error) => { output += `\n${error}`})
        return Promise.reject(errorString)
      } else {
        return Promise.reject(contents)
      }
    })
  }

  hideLoadingScreen() {
    const loading = document.getElementById(`graph-loading-${this.props.graph.id}`)
    loading.parentNode.removeChild(loading)
  }

  makeRequest(url, start, end) {
    return fetch(`${url}?start=${start}&end=${end}`)
  }

  async plot(grapher, key) {
    const dataSettings = settings.external[key]
    let data
    const label = settings.external[key].name
    switch (key) {
      case 'bikeCrimes':
        data = await this.getBikeCrimes(this.props.graph)
        break
      case 'earthquakes':
        data = await this.getEarthquakes(this.props.graph)
        break
      case 'holidays':
        data = await this.getHolidays(this.props.graph)
        break
      case 'random':
        data = await this.getRandoms(this.props.graph)
        break
      case 'launches':
        data = await this.getLaunches(this.props.graph)
        break
    }

    if (dataSettings.graphTypes.includes('scatter')) {
      grapher.plotScatter(data, label)
    } else if (dataSettings.graphTypes.includes('verticals')) {
      grapher.plotVerticals(data)
    } else if (dataSettings.graphTypes.includes('bar')) {
      grapher.plotBar(data, label)
    }
  }

  async generateGraph() {
    let errors = []
    const grapher = new Grapher(this.props.graph)
    grapher.initGraph()
    if (this.props.graph.error) {
      errors.push(this.props.graph.error)
    } else {
      try {
        const plotA = this.plot(grapher, this.props.graph.dataSelections[0])
        await plotA
      } catch(error) {
        errors.push(error)
      }
      try {
        const plotB = this.plot(grapher, this.props.graph.dataSelections[1])
        await plotB
      } catch(error) {
        errors.push(error)
      }
    }
    if (errors.length > 0) {
      const uniqErrors = Array.from(new Set(errors))
      const loadingText = document.getElementById(`graph-loading-text-${this.props.graph.id}`)
      loadingText.textContent = `Error: ${uniqErrors.join('; ')}`
    } else {
      this.hideLoadingScreen()
    }
  }
}

export default Graph
