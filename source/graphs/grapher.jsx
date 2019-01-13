import * as d3 from 'd3'
import Logger from '../logger.jsx'

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600

class Grapher {
  constructor(props) {
    this.id = props.id
    this.width = props.width || DEFAULT_WIDTH
    this.height = props.height || DEFAULT_HEIGHT
    this.logger = new Logger()
  }

  async render(dotData, lineData) {
    //set height/width of the svg
    this.graph = d3.select(`#graph-${this.id}`)
      .attr('width', this.width)
      .attr('height', this.height)

    this.initXScale(await dotData)
    this.initYScale(await dotData)

    this.plotDots(await dotData)
    this.plotVerticalLines(await lineData)

    this.drawBottomAxis()
    this.drawLeftAxis()
  }

  drawBottomAxis() {
    const bottomAxis = d3.axisBottom(this.xScale)
    this.graph
      .append('g') //append a <g> to it
        .attr('id', 'x-axis') //add an id
      .call(bottomAxis) //call the axis generator on that <g> so that an axis is generated within it
        .attr('transform', 'translate(0,'+this.height+')') //move the axis to the bottom of the SVG
  }

  drawLeftAxis() {
    //create a leftAxis generator.  Pass the yScale so it knows how to label the axis
    const leftAxis = d3.axisLeft(this.yScale)
    this.graph //select the outer SVG
      .append('g') //append a <g> to it
        .attr('id', 'y-axis') //add an id
      .call(leftAxis) //call the axis generator on that <g> so that an axis is generated within it
  }

  plotVerticalLines(data) {
    this.graph.select(`#lines-${this.id}`)
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', (datum, index) => {
        if (!datum.date) {
          this.logger.error('Graph data does not contain date property')
        }
        return this.xScale(datum.date.getTime())
      })
      .attr('y1', 0)
      .attr('x2', (datum, index) => {
        return this.xScale(datum.date.getTime())
      })
      .attr('y2', this.height)
      .attr('stroke-width', 1)
      .attr('stroke', 'grey')
      .attr('stroke-dasharray', '2')
      // .on('click', function(datum) {
      //   d3.event.stopPropagation()
      //   alert(`Holiday: ${datum.value}`)
      // })

    this.graph.select(`#labels-${this.id}`)
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('transform', (datum) => {
        return `translate(${this.xScale(datum.date.getTime())+6},10)rotate(90)`
      })
      .text(function(datum) {
        return datum.value
      })
  }

  plotDots(data) {
    this.graph.select(`#points-${this.id}`)
      .selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('r', 3)
      .attr('cy', (datum, index) => {
        return this.yScale(datum.value)
      })
      .attr('cx', (datum, index) => {
        return this.xScale(datum.date.getTime())
      })
      // .on('click', function(datum) {
      //   d3.event.stopPropagation()
      //   alert(`${datum.date}: ${datum.value}`)
      // })
      // .exit().remove()
  }

  initXScale(data) {
    const xDomain = d3.extent(data, function(datum) {
      return datum.date.getTime()
    })
    this.xScale = d3
      .scaleTime()
      .range([0, this.width])
      .domain(xDomain)
  }

  initYScale(data) {
    const yDomain = d3.extent(data, function(datum) {
      return datum.value
    })
    this.yScale = d3
      .scaleLinear()
      .range([this.height, 0])
      .domain(yDomain) //set domain of yScale to min/max values created by d3.extent in the last step
  }
}

export default Grapher