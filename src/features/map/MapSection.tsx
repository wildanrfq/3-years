import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { Calendar, Navigation, Play, Square, X } from 'lucide-react';
import { content, PlaceItem, SectionId } from '../../config/content';
import { assetUrl } from '../../lib/assets';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SectionShell } from '../../components/SectionShell';
import { SquishyButton } from '../../components/SquishyButton';
import { HintBubble } from '../../components/HintBubble';

// Perbaiki path ikon default Leaflet saat dibundle oleh Vite.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapSectionProps {
  onBackToHub: () => void;
  onNextSection: (next: SectionId) => void;
}

function createNumberedPinIcon(num: number, isActive: boolean, delayMs: number): L.DivIcon {
  const fill = isActive ? '#3C4E36' : '#647F57';
  const ring = isActive ? '#F2CFC4' : '#FBF8EF';
  return L.divIcon({
    className: 'sage-pin-wrapper',
    html: `
      <div class="sage-pin-drop" style="animation-delay:${delayMs}ms">
        <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 44C19 44 34 29.8 34 18.5C34 9.9 27.3 3 19 3C10.7 3 4 9.9 4 18.5C4 29.8 19 44 19 44Z" fill="${fill}" stroke="${ring}" stroke-width="2.6"/>
          <circle cx="19" cy="18" r="10.5" fill="${ring}"/>
          <text x="19" y="22.5" text-anchor="middle" font-family="Nunito, sans-serif" font-size="12" font-weight="800" fill="#2B3827">${num}</text>
        </svg>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
  });
}

function createTravelerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'sage-traveler-wrapper',
    html: `
      <div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#FBF8EF] bg-[#F2CFC4] shadow-md">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7-4.6-7-10.2A4.3 4.3 0 0 1 9.3 6.5c1.2 0 2.2.6 2.7 1.5.5-.9 1.5-1.5 2.7-1.5A4.3 4.3 0 0 1 19 10.8C19 16.4 12 21 12 21z" fill="#647F57" stroke="#2B3827" stroke-width="1.5"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export default function MapSection({
  onBackToHub,
  onNextSection,
}: MapSectionProps) {
  const reducedMotion = useReducedMotion();
  const places = content.places;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const [tourIdx, setTourIdx] = useState(0);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; seq: number } | null>(null);

  const tourTimerRef = useRef<number | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (places.length === 0) return [-7.7956, 110.3695];
    const lat = places.reduce((acc, p) => acc + p.lat, 0) / places.length;
    const lng = places.reduce((acc, p) => acc + p.lng, 0) / places.length;
    return [lat, lng];
  }, [places]);

  const routeCoords = useMemo<[number, number][]>(
    () => places.map((p) => [p.lat, p.lng]),
    [places]
  );

  const travelerIcon = useMemo(() => createTravelerIcon(), []);

  const stopTour = useCallback(() => {
    if (tourTimerRef.current !== null) {
      window.clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    setIsPlayingTour(false);
  }, []);

  useEffect(() => {
    return () => {
      if (tourTimerRef.current !== null) {
        window.clearTimeout(tourTimerRef.current);
      }
    };
  }, []);

  const focusPlace = useCallback((idx: number) => {
    const place = places[idx];
    if (!place) return;
    setSelectedIdx(idx);
    setTourIdx(idx);
    setFlyTarget((prev) => ({
      lat: place.lat,
      lng: place.lng,
      seq: (prev?.seq ?? 0) + 1,
    }));
  }, [places]);

  const startTour = useCallback(() => {
    if (places.length === 0) return;
    if (isPlayingTour) {
      stopTour();
      return;
    }

    setIsPlayingTour(true);
    let step = 0;

    const advance = () => {
      focusPlace(step);
      step += 1;
      if (step < places.length) {
        tourTimerRef.current = window.setTimeout(advance, reducedMotion ? 1600 : 2600);
      } else {
        tourTimerRef.current = window.setTimeout(() => {
          setIsPlayingTour(false);
        }, 2200);
      }
    };

    advance();
  }, [focusPlace, isPlayingTour, places.length, reducedMotion, stopTour]);

  const activePlace: PlaceItem | null = selectedIdx !== null ? places[selectedIdx] ?? null : null;
  const travelerPos: [number, number] | null =
    isPlayingTour && places[tourIdx] ? [places[tourIdx].lat, places[tourIdx].lng] : null;

  return (
    <SectionShell
      section="map"
      onBackToHub={onBackToHub}
      onNextSection={onNextSection}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <HintBubble icon={<Navigation className="h-3.5 w-3.5 text-sage-600" aria-hidden="true" />}>
            Ketuk pin bernomor untuk lihat ceritanya
          </HintBubble>

          <SquishyButton
            variant={isPlayingTour ? 'blush' : 'primary'}
            onClick={startTour}
            className="px-4 py-2 text-xs"
          >
            {isPlayingTour ? (
              <>
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Hentikan tur</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Putar perjalanan kita</span>
              </>
            )}
          </SquishyButton>
        </div>

        {/* Kartu peta */}
        <div className="relative overflow-hidden rounded-[28px] border border-sage-200/90 bg-cream shadow-sage-lg">
          <div className="sage-map-tiles h-[410px] w-full sm:h-[460px]">
            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom={false}
              className="h-full w-full z-0"
            >
              <TileLayer
                url={content.mapTile.url}
                attribution={content.mapTile.attribution}
              />

              <MapResizeAndFly flyTarget={flyTarget} reducedMotion={reducedMotion} />

              <AnimatedRouteLine positions={routeCoords} reducedMotion={reducedMotion} />

              {places.map((place, idx) => (
                <Marker
                  key={place.name}
                  position={[place.lat, place.lng]}
                  icon={createNumberedPinIcon(
                    idx + 1,
                    selectedIdx === idx,
                    reducedMotion ? 0 : idx * 140
                  )}
                  eventHandlers={{
                    click: () => {
                      stopTour();
                      focusPlace(idx);
                    },
                  }}
                />
              ))}

              {travelerPos && (
                <Marker
                  position={travelerPos}
                  icon={travelerIcon}
                  zIndexOffset={500}
                />
              )}
            </MapContainer>
          </div>

          {/* Bottom sheet detail lokasi (bisa digeser ke bawah untuk menutup) */}
          <AnimatePresence>
            {activePlace && (
              <PlaceBottomSheet
                place={activePlace}
                index={selectedIdx ?? 0}
                onClose={() => setSelectedIdx(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tombol cepat daftar tempat agar ramah keyboard dan jari */}
        <div className="flex flex-wrap justify-center gap-2">
          {places.map((place, idx) => (
            <button
              key={place.name}
              type="button"
              onClick={() => {
                stopTour();
                focusPlace(idx);
              }}
              className={`focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-pill border px-3.5 py-2 text-xs font-bold transition ${
                selectedIdx === idx
                  ? 'border-sage-600 bg-sage-600 text-[#FBF8EF] shadow-sage-sm'
                  : 'border-sage-200 bg-cream text-sage-800 hover:bg-sage-100'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  selectedIdx === idx
                    ? 'bg-[#FBF8EF] text-[#2B3827]'
                    : 'bg-sage-100 text-sage-700'
                }`}
              >
                {idx + 1}
              </span>
              <span>{place.name}</span>
            </button>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function MapResizeAndFly({
  flyTarget,
  reducedMotion,
}: {
  flyTarget: { lat: number; lng: number; seq: number } | null;
  reducedMotion: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const refresh = () => {
      map.invalidateSize({ animate: false });
    };
    refresh();
    const t1 = window.setTimeout(refresh, 160);
    const t2 = window.setTimeout(refresh, 450);

    const container = map.getContainer();
    const observer = new ResizeObserver(refresh);
    observer.observe(container);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
    };
  }, [map]);

  useEffect(() => {
    if (!flyTarget) return;
    map.flyTo([flyTarget.lat, flyTarget.lng], 14, {
      duration: reducedMotion ? 0 : 0.9,
    });
  }, [flyTarget, map, reducedMotion]);

  return null;
}

function AnimatedRouteLine({
  positions,
  reducedMotion,
}: {
  positions: [number, number][];
  reducedMotion: boolean;
}) {
  const polylineRef = useRef<L.Polyline | null>(null);
  const animatedOnceRef = useRef(false);

  useEffect(() => {
    const poly = polylineRef.current;
    if (!poly || reducedMotion || animatedOnceRef.current) return;

    const timer = window.setTimeout(() => {
      const pathEl = poly.getElement() as SVGPathElement | null;
      if (!pathEl || typeof pathEl.getTotalLength !== 'function') return;

      animatedOnceRef.current = true;
      const length = pathEl.getTotalLength();
      if (!length) return;

      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;
      pathEl.getBoundingClientRect();
      pathEl.style.transition = 'stroke-dashoffset 1.6s ease-out';
      pathEl.style.strokeDashoffset = '0';

      window.setTimeout(() => {
        pathEl.style.transition = '';
        pathEl.style.strokeDasharray = '';
        pathEl.style.strokeDashoffset = '';
      }, 1700);
    }, 240);

    return () => window.clearTimeout(timer);
  }, [positions, reducedMotion]);

  return (
    <Polyline
      ref={polylineRef}
      positions={positions}
      pathOptions={{
        color: '#647F57',
        weight: 4,
        opacity: 0.88,
      }}
    />
  );
}

function PlaceBottomSheet({
  place,
  index,
  onClose,
}: {
  place: PlaceItem;
  index: number;
  onClose: () => void;
}) {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 65 || info.velocity.y > 320) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 260 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="absolute inset-x-2 bottom-2 z-[600] rounded-[24px] border border-sage-200 bg-cream/95 p-4 shadow-sage-lg backdrop-blur-md sm:inset-x-4 sm:bottom-4"
    >
      <div className="mx-auto mb-2.5 h-1.5 w-10 rounded-full bg-sage-300" aria-hidden="true" />

      <div className="flex items-start gap-3.5">
        {place.photo && (
          <img
            src={assetUrl(place.photo)}
            alt={place.name}
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-2xl border border-sage-200 bg-sage-100 object-cover sm:h-24 sm:w-24"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-pill bg-sage-100 px-2.5 py-0.5 text-[11px] font-bold text-sage-700">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>
                #{index + 1} · {place.date}
              </span>
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail tempat"
              className="focus-ring flex h-11 w-11 -mr-1 -mt-1 items-center justify-center rounded-full text-sage-600 transition hover:bg-sage-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <h2 className="mt-0.5 font-display text-lg font-semibold text-sage-900">
            {place.name}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-sage-700 sm:text-sm">
            {place.note}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
