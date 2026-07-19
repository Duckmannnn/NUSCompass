import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import overviewMapUrl from '../../assets/maps/eusoff-overview.svg';
import { eusoffOverview } from '../../data/eusoffOverview';

const MIN_SCALE = 0.45;
const MAX_SCALE = 4;
const FIT_PADDING = 20;
const DRAG_THRESHOLD = 5;

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

export default function OverviewMap({
  onSelectBlock,
}) {
  const { viewBox, blocks } = eusoffOverview;

  const frameRef = useRef(null);

  const dragRef = useRef({
    pointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    startViewportX: 0,
    startViewportY: 0,
    hasDragged: false,
  });

  const suppressClickRef = useRef(false);

  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [isDragging, setIsDragging] =
    useState(false);

  const [hoveredBlockId, setHoveredBlockId] =
    useState(null);

  const hoveredBlock = useMemo(
    () =>
      blocks.find(
        (block) => block.id === hoveredBlockId
      ) ?? blocks.find((block) => block.id === 'C'),
    [blocks, hoveredBlockId]
  );

  const fitMap = useCallback(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const bounds =
      frame.getBoundingClientRect();

    const availableWidth = Math.max(
      bounds.width - FIT_PADDING * 2,
      1
    );

    const availableHeight = Math.max(
      bounds.height - FIT_PADDING * 2,
      1
    );

    const scale = clamp(
      Math.min(
        availableWidth / viewBox.width,
        availableHeight / viewBox.height
      ),
      MIN_SCALE,
      1.6
    );

    setViewport({
      scale,
      x:
        (bounds.width -
          viewBox.width * scale) /
        2,
      y:
        (bounds.height -
          viewBox.height * scale) /
        2,
    });
  }, [viewBox.height, viewBox.width]);

  useLayoutEffect(() => {
    fitMap();

    const frame = frameRef.current;

    if (
      !frame ||
      typeof ResizeObserver === 'undefined'
    ) {
      return undefined;
    }

    const resizeObserver =
      new ResizeObserver(() => {
        fitMap();
      });

    resizeObserver.observe(frame);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fitMap]);

  const zoomAtPoint = useCallback(
    (requestedScale, pointX, pointY) => {
      setViewport((current) => {
        const scale = clamp(
          requestedScale,
          MIN_SCALE,
          MAX_SCALE
        );

        if (scale === current.scale) {
          return current;
        }

        const ratio = scale / current.scale;

        return {
          scale,
          x:
            pointX -
            (pointX - current.x) * ratio,
          y:
            pointY -
            (pointY - current.y) * ratio,
        };
      });
    },
    []
  );

  const zoomFromCenter = (factor) => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const bounds =
      frame.getBoundingClientRect();

    zoomAtPoint(
      viewport.scale * factor,
      bounds.width / 2,
      bounds.height / 2
    );
  };

  const handleWheel = (event) => {
    event.preventDefault();

    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const bounds =
      frame.getBoundingClientRect();

    const pointX =
      event.clientX - bounds.left;

    const pointY =
      event.clientY - bounds.top;

    const factor =
      event.deltaY < 0 ? 1.12 : 0.89;

    zoomAtPoint(
      viewport.scale * factor,
      pointX,
      pointY
    );
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startViewportX: viewport.x,
      startViewportY: viewport.y,
      hasDragged: false,
    };

    suppressClickRef.current = false;
  };

  const handlePointerMove = (event) => {
    if (
      dragRef.current.pointerId !==
      event.pointerId
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      dragRef.current.startPointerX;

    const deltaY =
      event.clientY -
      dragRef.current.startPointerY;

    if (
      Math.hypot(deltaX, deltaY) <=
      DRAG_THRESHOLD
    ) {
      return;
    }

    dragRef.current.hasDragged = true;
    suppressClickRef.current = true;
    setIsDragging(true);

    if (
      !event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    }

    setViewport((current) => ({
      ...current,
      x:
        dragRef.current.startViewportX +
        deltaX,
      y:
        dragRef.current.startViewportY +
        deltaY,
    }));
  };

  const finishPointerInteraction = (
    event
  ) => {
    if (
      dragRef.current.pointerId !==
      event.pointerId
    ) {
      return;
    }

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    const hasDragged =
      dragRef.current.hasDragged;

    dragRef.current.pointerId = null;
    dragRef.current.hasDragged = false;
    setIsDragging(false);

    if (hasDragged) {
      suppressClickRef.current = true;

      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const cancelPointerInteraction = (
    event
  ) => {
    if (
      dragRef.current.pointerId !==
      event.pointerId
    ) {
      return;
    }

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    dragRef.current.pointerId = null;
    dragRef.current.hasDragged = false;
    suppressClickRef.current = false;
    setIsDragging(false);
  };

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const handleDoubleClick = (event) => {
    const blockElement =
      event.target.closest?.(
        '[data-overview-block="true"]'
      );

    if (blockElement) {
      return;
    }

    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const bounds =
      frame.getBoundingClientRect();

    zoomAtPoint(
      viewport.scale * 1.35,
      event.clientX - bounds.left,
      event.clientY - bounds.top
    );
  };

  const handleBlockClick = (block) => {
    if (
      suppressClickRef.current ||
      !block.available
    ) {
      return;
    }

    onSelectBlock(block.id);
  };

  const handleBlockKeyDown = (
    event,
    block
  ) => {
    if (
      !block.available ||
      (event.key !== 'Enter' &&
        event.key !== ' ')
    ) {
      return;
    }

    event.preventDefault();
    onSelectBlock(block.id);
  };

  return (
    <div
      ref={frameRef}
      className={[
        'overview-viewport',
        isDragging ? 'is-dragging' : '',
      ].join(' ')}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerInteraction}
      onPointerCancel={
        cancelPointerInteraction
      }
      onClickCapture={handleClickCapture}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="overview-viewport-content"
        style={{
          width: viewBox.width,
          height: viewBox.height,
          transform:
            `translate3d(` +
            `${viewport.x}px, ` +
            `${viewport.y}px, 0) ` +
            `scale(${viewport.scale})`,
        }}
      >
        <svg
          className="overview-map-svg"
          viewBox={
            `0 0 ` +
            `${viewBox.width} ` +
            `${viewBox.height}`
          }
          role="img"
          aria-label="Interactive map of Eusoff Hall"
        >
          <image
            href={overviewMapUrl}
            width={viewBox.width}
            height={viewBox.height}
            preserveAspectRatio="xMidYMid meet"
            pointerEvents="none"
          />

          <g className="overview-building-layer">
            {blocks.map((block) => (
              <g
                key={block.id}
                data-overview-block="true"
                role="button"
                tabIndex={
                  block.available ? 0 : -1
                }
                aria-disabled={!block.available}
                aria-label={
                  block.available
                    ? `${block.name}, mapped and available`
                    : `${block.name}, not mapped yet`
                }
                className={[
                  'overview-building-hit',
                  block.available
                    ? 'available'
                    : 'unavailable',
                  hoveredBlockId === block.id
                    ? 'hovered'
                    : '',
                ].join(' ')}
                onMouseEnter={() =>
                  setHoveredBlockId(block.id)
                }
                onMouseLeave={() =>
                  setHoveredBlockId(null)
                }
                onFocus={() =>
                  setHoveredBlockId(block.id)
                }
                onBlur={() =>
                  setHoveredBlockId(null)
                }
                onClick={() =>
                  handleBlockClick(block)
                }
                onKeyDown={(event) =>
                  handleBlockKeyDown(
                    event,
                    block
                  )
                }
              >
                <path d={block.path} />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="overview-block-status">
        <span
          className={[
            'overview-block-status-dot',
            hoveredBlock?.available
              ? 'available'
              : 'unavailable',
          ].join(' ')}
        />

        <div>
          <strong>{hoveredBlock?.name}</strong>
          <span>
            {hoveredBlock?.available
              ? `${hoveredBlock.floors} floors mapped · Click to open`
              : 'Not mapped yet'}
          </span>
        </div>
      </div>

      <div
        className="overview-map-controls"
        onPointerDown={(event) =>
          event.stopPropagation()
        }
        onDoubleClick={(event) =>
          event.stopPropagation()
        }
        onWheel={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={() => zoomFromCenter(1.2)}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          onClick={() =>
            zoomFromCenter(1 / 1.2)
          }
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>

        <span>
          {Math.round(viewport.scale * 100)}%
        </span>

        <button
          type="button"
          className="overview-fit-button"
          onClick={fitMap}
          aria-label="Fit map"
          title="Fit map"
        >
          Fit
        </button>
      </div>

      <div className="overview-map-instruction">
        Drag to move · Scroll to zoom
      </div>
    </div>
  );
}
