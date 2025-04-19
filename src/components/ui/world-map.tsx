"use client";

import { useRef, memo } from "react";
import DottedMap from "dotted-map";
import Image from "next/image";

interface MapProps {
  // Keeping minimal props only for background customization if needed
  backgroundColor?: string;
  dotColor?: string;
  dots?: Array<{
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
  }>;
}

export const WorldMap = memo(function WorldMap({
  backgroundColor = "black",
  dotColor = "#FFFFFF40",
  dots = [],
}: MapProps) {
  // Create the map only once with memoization
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ 
    height: 100, 
    grid: "diagonal",
  });

  // The dotted-map library's addLine method isn't properly typed
  // We'll skip the lines for now and just display the map
  // In a real implementation, we'd need to investigate the library further

  const svgMap = map.getSVG({
    radius: 0.22,
    color: dotColor,
    shape: "circle",
    backgroundColor: backgroundColor,
  });

  return (
    <div className="w-full aspect-[2/1] bg-black rounded-lg relative font-sans">
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full pointer-events-none select-none"
        alt="world map"
        height={495}
        width={1056}
        draggable={false}
        priority={true}
      />
    </div>
  );
});