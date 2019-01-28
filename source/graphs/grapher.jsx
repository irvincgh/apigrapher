import * as d3 from 'd3'
import Logger from '../logger.jsx'

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600

class Grapher {
  constructor(props) {
    this.id = props.id
    this.start = new Date(props.start)
    this.end = new Date(props.end)
    this.width = props.width || DEFAULT_WIDTH
    this.height = props.height || DEFAULT_HEIGHT
    this.logger = new Logger()
  }

  initGraph() {
    this.graph = d3.select(`#graph-${this.id}`)
      .attr('width', this.width)
      .attr('height', this.height)
    this.initXScale()
    this.drawBottomAxis()
  }

  drawBottomAxis() {
    const bottomAxis = d3.axisBottom(this.xScale)
    this.graph
      .append('g')
      .attr('id', 'x-axis')
      .call(bottomAxis)
      .attr('transform', 'translate(0,'+this.height+')')
  }

  drawLeftAxis(scale) {
    const leftAxis = d3.axisLeft(scale)
    this.graph
      .append('g')
      .attr('id', 'y-axis')
      .call(leftAxis)
  }

  plotVerticals(data) {
    this.graph.select(`#lines-${this.id}`)
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', (data) => {
        if (!data.date) {
          this.logger.error('Graph data does not contain date property')
        }
        return this.xScale(data.date.getTime())
      })
      .attr('y1', 0)
      .attr('x2', (data) => {
        return this.xScale(data.date.getTime())
      })
      .attr('y2', this.height)
      .attr('stroke-width', 1)
      .attr('stroke', 'grey')
      .attr('stroke-dasharray', '2')

    this.graph.select(`#labels-${this.id}`)
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('transform', (data) => {
        return `translate(${this.xScale(data.date.getTime())+6},10)rotate(90)`
      })
      .text(function(data) {
        return data.value
      })
  }

  plotScatter(data) {
    const yScale = this.getYScale(data)

    this.graph.select(`#points-${this.id}`)
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('cy', (data) => {
        return yScale(data.value)
      })
      .attr('cx', (data) => {
        return this.xScale(data.date.getTime())
      })

    this.drawLeftAxis(yScale)
  }

  initXScale() {
    this.xScale = d3
      .scaleTime()
      .range([0, this.width])
      .domain([this.start, this.end])
  }

  getYScale(data) {
    const yDomain = d3.extent(data, function(data) {
      return data.value
    })
    return d3
      .scaleLinear()
      .range([this.height, 0])
      .domain(yDomain)
  }
}

export { Grapher, DEFAULT_WIDTH, DEFAULT_HEIGHT }
