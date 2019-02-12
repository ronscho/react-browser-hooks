import React, { forwardRef, createRef } from 'react'
import { cleanup, fireEvent, render } from 'react-testing-library'
import { act } from 'react-dom/test-utils'

import { useClickOutside } from '../../../src'

let callback
let testElementRef = createRef()
let childElementRef = createRef()
let siblingRef = React.createRef()
let testClickOutsideHook
let testClickOutsideHookWithSibling

beforeEach(() => {
  const TestChildComponent = forwardRef((props, ref) => {
    return <div ref={ref} />
  })

  const TestClickOutsideHook = forwardRef(({ callback }, ref) => {
    useClickOutside(ref, callback)
    return (
      <div ref={ref}>
        <TestChildComponent ref={childElementRef} />
      </div>
    )
  })

  const TestClickOutsideHookWithSibling = forwardRef(({ callback }, ref) => {
    useClickOutside([ref, siblingRef], callback)
    return (
      <>
        <div ref={siblingRef} />
        <div ref={ref}>
          <TestChildComponent ref={childElementRef} />
        </div>
      </>
    )
  })

  testClickOutsideHook = (callback) => {
    render(<TestClickOutsideHook ref={testElementRef} callback={callback} />)
  }

  testClickOutsideHookWithSibling = (callback) => {
    render(
      <TestClickOutsideHookWithSibling
        ref={testElementRef}
        callback={callback}
      />
    )
  }

  callback = jest.fn()
})

afterEach(cleanup)

describe('useClickOutside', () => {
  it('calls callback with click event on clicking outside the component', () => {
    testClickOutsideHook(callback)
    act(() => {
      fireEvent(
        document.body,
        new Event('click', {
          bubbles: true,
          cancelable: false
        })
      )
    })

    expect(callback).toBeCalledTimes(1)
    expect(callback.mock.calls[0].length).toBe(1)
    expect(callback.mock.calls[0][0] instanceof Event).toBe(true)
    expect(callback.mock.calls[0][0].type).toBe('click')
  })

  it('does not call callback when the component itself receives a click', () => {
    testClickOutsideHook(callback)
    act(() => {
      fireEvent(
        testElementRef.current,
        new Event('click', {
          bubbles: true,
          cancelable: false
        })
      )
    })

    expect(callback).toBeCalledTimes(0)
  })

  it('does not call callback when a child receives a click', () => {
    testClickOutsideHook(callback)
    act(() => {
      fireEvent(
        childElementRef.current,
        new Event('click', {
          bubbles: true,
          cancelable: false
        })
      )
    })

    expect(callback).toBeCalledTimes(0)
  })

  it('supports array of refs, and will call callback if target is not contained by any', () => {
    testClickOutsideHookWithSibling(callback)
    act(() => {
      fireEvent(
        document.body,
        new Event('click', {
          bubbles: true,
          cancelable: false
        })
      )
    })

    expect(callback).toBeCalledTimes(1)
    expect(callback.mock.calls[0].length).toBe(1)
    expect(callback.mock.calls[0][0] instanceof Event).toBe(true)
    expect(callback.mock.calls[0][0].type).toBe('click')
  })

  it('supports array of refs, and will not call callback if target is contained by any', () => {
    testClickOutsideHookWithSibling(callback)
    act(() => {
      fireEvent(
        siblingRef.current,
        new Event('click', {
          bubbles: true,
          cancelable: false
        })
      )
    })
    act(() => {
      fireEvent(
        testElementRef.current,
        new Event('click', {
          bubbles: true,
          cancelable: false
        })
      )
    })

    expect(callback).toBeCalledTimes(0)
  })
})