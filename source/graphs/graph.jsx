import React from 'react'
import PropTypes from 'prop-types'
import settings from '../../settings.json'
import {DEFAULT_HEIGHT, DEFAULT_WIDTH, Grapher} from './grapher.jsx'

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
      <div id={`graph-wrapper-${this.props.graph.id}`}>
        <svg height={DEFAULT_HEIGHT} width={DEFAULT_WIDTH} id={`graph-${this.props.graph.id}`}>
          <svg>
            <g id={`points-${this.props.graph.id}`}></g>
            <g id={`lines-${this.props.graph.id}`}></g>
            <g id={`labels-${this.props.graph.id}`}></g>
          </svg>
          <svg id={`graph-loading-${this.props.graph.id}`}>
            <rect id={`graph-loading-box-${this.props.graph.id}`} width="100%" height="100%" style={{'fill':'rgb(255,255,255)'}} />
            <text id={`graph-loading-text-${this.props.graph.id}`} x="50%" y="50%" textAnchor="middle">Loading...</text>
          </svg>
        </svg>
      </div>
    )
  }

  getEarthquakes(graph) {
    return fetch(`/api/earthquakes?start=${graph.start}&end=${graph.end}`).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.features.map((obj) => {return {date: new Date(obj.properties.time), value: obj.properties.mag}})
      },
      (error) => {
        throw error
      }
    )
  }

  getHolidays(graph) {
    return fetch(`/api/holidays?start=${graph.start}&end=${graph.end}`).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((holiday) => {return {date: new Date(holiday.date), value: holiday.name}})
      },
      (error) => {
        throw error
      }
    )
  }

  getRandoms(graph) {
    return fetch(`/api/randomness?start=${graph.start}&end=${graph.end}`).then((response) => {
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
    return fetch(`/api/launches?start=${graph.start}&end=${graph.end}`).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((launch) => {return {date: new Date(launch.net), value: launch.name}})
      },
      (error) => {
        throw error
      }
    )
  }

  getBikeCrimes(graph) {
    return fetch(`/api/bikecrimes?start=${graph.start}&end=${graph.end}`).then((response) => {
      return this.catchResponse(response)
    }).then(
      (data) => {
        return data.map((crime) => {return {date: new Date(crime.occurred_at * 1000), value: crime.title}})
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

  async plot(grapher, key) {
    const dataSettings = settings.external[key]
    let data

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
      grapher.plotScatter(data)
    } else if (dataSettings.graphTypes.includes('verticals')) {
      grapher.plotVerticals(data)
    }
  }

  async generateGraph() {
    const grapher = new Grapher(this.props.graph)
    try {
      grapher.initGraph()
      const plotA = this.plot(grapher, this.props.graph.dataSelections[0])
      const plotB = this.plot(grapher, this.props.graph.dataSelections[1])
      await plotA
      await plotB
      this.hideLoadingScreen()
    } catch(error) {
      const loadingText = document.getElementById(`graph-loading-text-${this.props.graph.id}`)
      loadingText.textContent = `Error: ${error}`
    }
  }
}

export default Graph
