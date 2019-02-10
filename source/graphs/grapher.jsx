import * as d3 from 'd3'
import Logger from '../logger.jsx'

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600
const MARGINS = {
  left: 25,
  right: 15,
  bottom: 25,
  top: 15
}

class Grapher {
  constructor(props) {
    this.id = props.id
    this.start = new Date(props.start)
    this.end = new Date(props.end)
    this.width = props.width || DEFAULT_WIDTH
    this.height = props.height || DEFAULT_HEIGHT
    this.graphableWidth = this.width - (MARGINS.left + MARGINS.right)
    this.graphableHeight = this.height - (MARGINS.top + MARGINS.bottom)
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
    const bottomAxis = d3
      .axisBottom(this.xScale)
      .tickFormat(d3.timeFormat('%m/%d'))
    this.graph
      .append('g')
      .attr('id', 'x-axis')
      .call(bottomAxis)
      .attr('transform', 'translate(' + MARGINS.left + ',' + (this.graphableHeight + MARGINS.top) + ')')
  }

  drawLeftAxis(scale) {
    const leftAxis = d3.axisLeft(scale)
    this.graph
      .append('g')
      .attr('id', 'y-axis')
      .attr('transform', 'translate(' + MARGINS.left + ',' + MARGINS.top + ')')
      .call(leftAxis)
  }

  plotBar(data) {
    const xDomain = []
    let date = new Date(this.start)
    while (date < this.end) {
      const wholeDayTime = Math.floor(date.getTime() / 86400000) * 86400000
      xDomain.push(wholeDayTime)
      date = new Date(date)
      date.setDate(date.getDate() + 1)
    }
    const xScale = d3
      .scaleBand()
      .range([0, this.graphableWidth])
      .domain(xDomain)
    const yScale = this.getYScale(data)
    this.graph.select(`#bars-${this.id}`)
      .selectAll('bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (data) => {
        return xScale(data.date.getTime())
      })
      .attr('width', xScale.bandwidth())
      .attr('y', (data) => {
        return yScale(data.value)
      })
      .attr('height', (data) => {
        return this.graphableHeight - yScale(data.value)
      })

    this.drawLeftAxis(yScale)
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
      .attr('y2', this.graphableHeight)
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
      .range([0, this.graphableWidth])
      .domain([this.start.getTime(), this.end.getTime()])
  }

  getYScale(data) {
    const yDomain = [
      0,
      d3.max(data, function(data) {
        return data.value
      })
    ]
    return d3
      .scaleLinear()
      .range([this.graphableHeight, 0])
      .domain(yDomain)
  }
}

export { Grapher, DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGINS }
