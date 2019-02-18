import * as d3 from 'd3'
import Logger from '../logger.jsx'

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600
const LABEL_HEIGHT = 30
const MARGINS = {
  left: 50,
  right: 50,
  bottom: 25,
  top: 15
}
const DAY_MS = 86400000

class Grapher {
  constructor(props) {
    this.id = props.id
    this.start = new Date(props.start)
    this.end = new Date(props.end)
    this.width = props.width || DEFAULT_WIDTH
    this.height = props.height || DEFAULT_HEIGHT
    this.graphableWidth = this.width - (MARGINS.left + MARGINS.right)
    this.graphableHeight = this.height - (MARGINS.top + MARGINS.bottom)
    this.verticalAxisCount = 0
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

  drawVerticalAxis(scale, label) {
    let verticalAxis
    let axisLeft
    let labelLeft
    if (this.verticalAxisCount === 0) {
      axisLeft = MARGINS.left
      labelLeft = MARGINS.left - LABEL_HEIGHT
      verticalAxis = d3.axisLeft(scale)
    } else if (this.verticalAxisCount === 1) {
      axisLeft = MARGINS.left + this.graphableWidth
      labelLeft = axisLeft + LABEL_HEIGHT
      verticalAxis = d3.axisRight(scale)
    }
    const domainRange = d3.max(scale.domain()) - d3.min(scale.domain())
    if (domainRange < 10) {
      verticalAxis.ticks(domainRange)
    }
    this.graph
      .append('g')
      .attr('id', 'y-axis')
      .attr('transform', 'translate(' + axisLeft + ',' + MARGINS.top + ')')
      .call(verticalAxis)
    this.graph
      .append('g')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + labelLeft + ',' + (this.height / 2) + ')rotate(-90)')
      .text(label)
    this.verticalAxisCount += 1
  }

  plotBar(data, label) {
    const xDomain = []
    let date = new Date(this.start)
    while (date < this.end) {
      const wholeDayTime = Math.floor(date.getTime() / DAY_MS) * DAY_MS
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

    this.drawVerticalAxis(yScale, label)
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

  plotScatter(data, label) {
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

    this.drawVerticalAxis(yScale, label)
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
