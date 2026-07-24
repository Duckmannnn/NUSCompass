import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import OverviewMap from '../components/map/OverviewMap';
import { useNavigation } from '../context/NavigationContext';
import { roomsData } from '../data/blockCData';
import { filterQuickDestinations } from '../data/quickDestinations';

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="overview-search-icon"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function getDestinationName(destination) {
  return (
    destination.displayName ??
    destination.name ??
    destination.label ??
    destination.id
  );
}

export default function HomeScreen() {
  const {
    highlightedRoomId,
    selectBlock,
    selectFloor,
    selectRoom,
    navigateTo,
    setHighlightedRoom,
    selectDestinationIntent,
  } = useNavigation();

  const [searchQuery, setSearchQuery] =
    useState('');

  const [debouncedQuery, setDebouncedQuery] =
    useState('');

  const [isSearchFocused, setIsSearchFocused] =
    useState(false);

  useEffect(() => {
    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    const previousOverscroll =
      document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow =
      'hidden';
    document.body.style.overscrollBehavior =
      'none';

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.overscrollBehavior =
        previousOverscroll;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredDestinations = useMemo(() => {
    const query =
      debouncedQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return roomsData
      .filter((destination) => {
        const searchableText = [
          destination.id,
          destination.name,
          destination.displayName,
          destination.label,
          destination.type,
          destination.building,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 7);
  }, [debouncedQuery]);

  const quickDestinations = useMemo(
    () => filterQuickDestinations(debouncedQuery),
    [debouncedQuery]
  );

  const handleSelectBlock = (blockId) => {
    selectBlock(blockId);
    navigateTo('explore');
  };

  const handleSearchResultClick = (
    destination
  ) => {
    const blockId =
      destination.blockId ??
      destination.block ??
      'C';

    setSearchQuery('');
    setDebouncedQuery('');

    selectBlock(blockId);
    selectFloor(destination.floor);
    setHighlightedRoom(destination.id);
    selectRoom(destination);
    setIsSearchFocused(false);
    navigateTo('explore');
  };

  const handleQuickDestinationClick = (destination) => {
    selectDestinationIntent(destination);
    setSearchQuery('');
    setDebouncedQuery('');
    setIsSearchFocused(false);
    navigateTo('navigation');
  };

  const showSearchResults =
    isSearchFocused &&
    (quickDestinations.length > 0 || debouncedQuery.trim().length > 0);

  return (
    <div className="overview-shell">
      <header className="overview-topbar">
        <div className="overview-brand">
          <div
            className="overview-brand-mark"
            aria-hidden="true"
          >
            NC
          </div>

          <div className="overview-brand-copy">
            <strong>NUSCompass</strong>
            <span>Eusoff Hall navigation</span>
          </div>
        </div>

        <div className="overview-location">
          <span>Campus overview</span>
          <strong>Eusoff Hall</strong>
        </div>

        <div className="overview-search">
          <SearchIcon />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setIsSearchFocused(false), 120);
            }}
            placeholder="Search room or facility"
            aria-label="Search room or facility"
            autoComplete="off"
          />

          {showSearchResults && (
            <div className="overview-search-results">
              {quickDestinations.length > 0 && (
                <>
                  <div className="overview-search-empty">
                    Quick destinations
                  </div>
                  {quickDestinations.map((destination) => (
                    <button
                      key={destination.id}
                      type="button"
                      className="overview-search-result"
                      onClick={() => handleQuickDestinationClick(destination)}
                    >
                      <span className="overview-result-symbol">Q</span>
                      <span className="overview-result-copy">
                        <strong>{destination.label}</strong>
                        <small>Uses your starting point</small>
                      </span>
                      <span className="overview-result-arrow" aria-hidden="true">→</span>
                    </button>
                  ))}
                </>
              )}

              {debouncedQuery.trim().length > 0 &&
                filteredDestinations.map((destination) => {
                  const isHighlighted = highlightedRoomId === destination.id;

                  return (
                    <button
                      key={destination.id}
                      type="button"
                      className={[
                        'overview-search-result',
                        isHighlighted ? 'active' : '',
                      ].join(' ')}
                      onClick={() => handleSearchResultClick(destination)}
                    >
                      <span className="overview-result-symbol">
                        {destination.type === 'facility' ? 'F' : 'R'}
                      </span>
                      <span className="overview-result-copy">
                        <strong>{getDestinationName(destination)}</strong>
                        <small>Block C · Floor {destination.floor}</small>
                      </span>
                      <span className="overview-result-arrow" aria-hidden="true">→</span>
                    </button>
                  );
                })}

              {debouncedQuery.trim().length > 0 &&
                quickDestinations.length === 0 &&
                filteredDestinations.length === 0 && (
                  <div className="overview-search-empty">
                    No matching destinations
                  </div>
                )}
            </div>
          )}
        </div>
      </header>

      <main className="overview-workspace">
        <OverviewMap
          onSelectBlock={handleSelectBlock}
        />

        <div className="overview-map-legend">
          <span>
            <i className="mapped" />
            Mapped block
          </span>

          <span>
            <i className="unmapped" />
            Not mapped
          </span>

          <span>
            <i className="campus-path" />
            Campus path
          </span>
        </div>
      </main>
    </div>
  );
}
