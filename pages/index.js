import React, { Component } from 'react'

import { setFailureMessage, resetBoard, revealCell } from '../actions.js'

const Block = ({ children }) => <div className="Block" children={children} />

const Cell = ({
  isMine,
  handleRightClick,
  isFlagged,
  isRevealed,
  handleCellClick,
  neighborCount,
  ri,
  ci,
}) => {
  const child = isRevealed
    ? isMine
      ? '💣'
      : neighborCount(ri, ci)
    : isFlagged
    ? '🚩'
    : ''
  return (
    <Block>
      <div
        className={`Cell ${isMine ? 'Cell--mine' : ''}${
          isFlagged ? 'Cell--flagged' : ''
        }${isRevealed ? 'Cell--revealed' : ''}`}
        children={child}
        onClick={handleCellClick}
        onContextMenu={handleRightClick}
      />
    </Block>
  )
}

const Board = ({ children }) => <div className="Board">{children}</div>

class Sweeper extends Component {
  state = {
    cols: new Array(5).fill(1).map((row, rowIndex) =>
      new Array(5).fill(1).map((c, colIndex) => {
        const isMine = Math.random(1) > 0.8
        return {
          id: colIndex + rowIndex * 10 + row,
          isMine,
          isFlagged: false,
          isRevealed: false,
          children: '',
          rowIndex,
          colIndex,
        }
      }),
    ),
    clicks: 0,
    hasError: false,
  }

  getCellFromState = (cellId) => {
    let cell = {}
    this.state.cols.forEach((row) => {
      if (row.find((cell) => cell.id === cellId)) {
        cell = row.find((cell) => cell.id === cellId)
      }
    })
    return cell
  }

  resetBoard = () => {
    this.setState(resetBoard)
  }

  handleCellClick = (cellId) => (_) => {
    const cell = this.getCellFromState(cellId)
    if (cell.isMine) {
      this.setState(setFailureMessage)
    } else {
      this.setState(revealCell(cellId))
    }
    this.setState((pState) => ({ clicks: pState.clicks + 1 }))
  }

  handleRightClick = (cellId) => (e) => {
    e.preventDefault()
    this.setState((pState) => {
      let score = pState.score || 0
      const newCols = pState.cols.map((row) =>
        row.map((cell) => {
          if (cell.id === cellId) {
            if (cell.isMine) score += 1
            return {
              ...cell,
              isFlagged: true,
            }
          } else {
            return cell
          }
        }),
      )
      return {
        cols: newCols,
        score,
      }
    })
    this.setState((pState) => ({ clicks: pState.clicks + 1 }))
    return false
  }

  getNeighborCount = (ri, ci) => {
    let count = 0
    const { cols } = this.state
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let x = i + ri
        let y = j + ci
        if (x > -1 && x < 5 && y > -1 && y < 5) {
          let neighbor = cols[i + ri][j + ci]
          if (neighbor.isMine) count += 1
        }
      }
    }
    return count
  }
  checkBoard = () => {
    let count = 0
    const { cols } = this.state
    cols.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isFlagged || cell.isRevealed) {
          count += 1
        }
      }),
    )
    // @TODO
  }

  render() {
    return (
      <div className="Container">
        {this.state.hasError && (
          <div
            style={{
              backgroundColor: 'var(--gray)',
              padding: 20,
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              boxShadow: '0 0 10px 4px var(--primary)',
              borderRadius: '20px',
              textAlign: 'center',
            }}
          >
            <h3 className="Error">You hit a bomb!</h3>
            <button
              style={{ marginTop: 10 }}
              onClick={this.resetBoard}
              className="Reset"
            >
              Reset Board
            </button>
            <h5 style={{ marginTop: 10 }}>
              You flagged {this.state.score || 0} bombs!
            </h5>
          </div>
        )}
        <Board>
          {this.state.cols.map((rows, rowIndex) =>
            rows.map((cell, colIndex) => (
              <Cell
                {...cell}
                handleCellClick={this.handleCellClick(cell.id)}
                handleRightClick={this.handleRightClick(cell.id)}
                key={cell.id}
                neighborCount={this.getNeighborCount}
                ri={rowIndex}
                ci={colIndex}
              />
            )),
          )}
        </Board>
        <style jsx global>{`
          :root {
            --primary: salmon;
            --gray: honeydew;
            --white: white;

            --fontFamily: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
          }
          *,
          *:before,
          *:after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          html,
          body {
            background: var(--gray);
            font-family: var(--fontFamily);
          }

          .Container {
            display: flex;
            height: 100vh;
            width: 100vw;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }

          .Cell {
            --scale: 6;
            height: calc(90vmin / 5);
            width: calc((90vmin / 5) - 0.4rem);
            line-height: calc(90vmin / 5);
            text-align: center;
            border-radius: 1em;
            color: var(--primary);
            background: var(--white);
            font-size: calc(var(--scale) * 0.25rem);
          }
          .Block {
            padding: 0.2rem;
          }

          .Board {
            width: 90vmin;
            height: 90vmin;
            margin: 5vmin;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    )
  }
}

export default Sweeper
