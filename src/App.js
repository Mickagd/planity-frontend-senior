import React, { useMemo, useState, useEffect } from 'react';

import Calendar from './pages/Calendar/Calendar';

import * as data from './ressources/data.json';

import './App.css';

// 9am to 9pm
const MAX_HOUR = 21;
const MIN_HOUR = 9;
const NB_SLOTS = MAX_HOUR - MIN_HOUR;

function App() {
  // Get window dimensions
  const getDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;

    return{ width, height };
  };

  // Create state to handle window dimensions
  const [windowSize, setWindowSize] = useState(getDimensions());

  // Recompute the dimensions after update
  useEffect(() => {
    const handleResize = () => setWindowSize(getDimensions())

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getOverlappedItems = () => {
    const fullItems = [];
    const items = data.default;
    const jumpedItems = [];

    for (let i = 0; i < items.length; i++) {
      const overlappedItems = [items[i].id];
      const start1 = parseInt(items[i].start.slice(0, -3));
      const end1 = start1 + (items[i].duration / 60);

      for (let j = i + 1; j < items.length; j++) {
        const start2 = parseInt(items[j].start.slice(0, -3));
        const end2 = start2 + (items[j].duration / 60);

        // Check overlapped items
        if ((start1 <= start2 && end1 > start2) || (start1 < end2 && end1 >= end2)) {
          overlappedItems.push(items[j].id);
          i++;
          jumpedItems.push(items[i]);
        }
      }

      fullItems.push(overlappedItems);
    }

    return { fullItems, jumpedItems };
  };

  const getOverlappedItemsBack = (oldJumpedItems) => {
    oldJumpedItems.reverse();

    const fullItems = [];
    const items = [...data.default].reverse();

    for (let i = 0; i < items.length; i++) {
      const overlappedItems = [items[i].id];
      const start1 = parseInt(items[i].start.slice(0, -3));
      const end1 = start1 + (items[i].duration / 60);

      for (let j = 0; j < oldJumpedItems.length; j++) {
        const start2 = parseInt(oldJumpedItems[j].start.slice(0, -3));
        const end2 = start2 + (oldJumpedItems[j].duration / 60);

        // Check overlapped items
        if (((start2 <= start1 && end2 > start1) || (start2 < end1 && end2 >= end1))
          && items[i] !== oldJumpedItems[j]) {
          overlappedItems.push(oldJumpedItems[j].id);
          fullItems.push(overlappedItems);
        }
      }
    }

    return fullItems;
  };

  const checkSimilarItems = (overlappedItems, overlappedItemsBack) => {
    const differentItems = [];

    for (let i = 0; i < overlappedItemsBack.length; i++) {
      let isAlreadyExisting = false;

      for (let j = 0; j < overlappedItems.length; j++) {
        if (overlappedItemsBack[i].join() === overlappedItems[j].join())
          isAlreadyExisting = true;
      }

      if (!isAlreadyExisting)
        differentItems.push(overlappedItemsBack[i]);
    }

    return differentItems;
  };

  const removeUnoverlappedItems = (items) => {
    const keepingItems = [];

    for (let i = 0; i < items.length; i++) {
      let isAlreadyExisting = false;

      for (let j = i + 1; j < items.length; j++) {
        if (items[i].join().includes(items[j].join()) || items[j].join().includes(items[i].join()))
          isAlreadyExisting = true;
      }

      if (!isAlreadyExisting)
        keepingItems.push(items[i]);
    }

    return keepingItems;
  };

  const getItemsWidth = (overlappedItems) => {
    const nbIds = {};

    for (let i = 0; i < overlappedItems.length; i++) {
      for (let j = 0; j < overlappedItems[i].length; j++) {
        if (!nbIds[overlappedItems[i][j]])
          nbIds[overlappedItems[i][j]] = {
            count: overlappedItems[i].length,
            left: j,
          }
      }
    }

    return nbIds;
  };


  let overlappedItems = getOverlappedItems();
  const overlappedItemsBack = getOverlappedItemsBack([...overlappedItems.jumpedItems]);
  const similarItems = checkSimilarItems(overlappedItems.fullItems, overlappedItemsBack);
  
  overlappedItems = [...overlappedItems.fullItems].concat([...similarItems]);
  overlappedItems = removeUnoverlappedItems(overlappedItems);

  const itemsWidth = getItemsWidth(overlappedItems);

  const memoizedDataToRender = useMemo(() => {
    const { width, height } = windowSize;
    const slotSize = height / NB_SLOTS;

    return data.default.map((item) => ({
      ...item,
      itemWidth: itemsWidth[item.id],
      // parsint and slice used to transform an hour to an int
      top: height - (slotSize * (MAX_HOUR - parseInt(item.start.slice(0, -3)))),
      left: itemsWidth[item.id].left * (width / itemsWidth[item.id].count),
      // Size depends on the hours
      heightSize: slotSize * (item.duration / 60),
    }));
  }, [windowSize, itemsWidth]);

  return (
    <div className="wrapper">
      <Calendar />
      <div className="event-wrapper">
        {
          memoizedDataToRender.map(({ id, top, left, heightSize, itemWidth }) => (
            <div
              className="event"
              // Generate random background color
              style={{
                backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                top,
                left,
                height: heightSize,
                width: itemWidth,
                position: 'absolute',
              }}
            >
              {id}
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
