import { Location } from "@/lib/types";

interface Props {
  location: Location;
}

export default function LocationPopup({ location }: Props) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;

  return (
    <div className="w-64">
      {location.photo_url && (
        <img
          src={location.photo_url}
          alt={location.name}
          className="w-full h-32 object-cover rounded-t mb-2"
        />
      )}
      <div className="px-1">
        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
          {location.category}
        </span>
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
          {location.name}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-3">
          {location.description}
        </p>
        <div className="flex flex-col gap-0.5 text-xs text-gray-500 mb-3">
          {location.entry_fee && (
            <span>
              <span className="font-medium text-gray-700">Entry:</span>{" "}
              {location.entry_fee}
            </span>
          )}
          {location.hours && (
            <span>
              <span className="font-medium text-gray-700">Hours:</span>{" "}
              {location.hours}
            </span>
          )}
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-green-700 text-white text-sm font-medium py-1.5 rounded hover:bg-green-800 transition-colors"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}
